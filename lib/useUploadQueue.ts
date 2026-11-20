"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "./errors";
import { isPdfFile } from "./files";
import type { CreateExpensePayload, ExpenseRecord, ScanResponse, UploadItem } from "./types";

interface UploadQueueOptions {
  scanFn: (file: File) => Promise<ScanResponse>;
  createFn: (payload: CreateExpensePayload) => Promise<ExpenseRecord>;
  /** Builds the payload for an item saved without opening its review card. */
  buildPayload: (scan: ScanResponse) => CreateExpensePayload;
  scanErrorText: string;
  saveErrorText: string;
  /** Called after each file finishes scanning (successfully). */
  onScanned?: (id: string, items: UploadItem[]) => void;
}

let seq = 0;

/**
 * Upload queue for many files: 1 file = 1 record. Files are scanned one at a
 * time (keeps the AI load predictable); each scanned file waits for review
 * and can be saved on its own or with "save all".
 */
export function useUploadQueue(opts: UploadQueueOptions) {
  const [items, setItemsState] = useState<UploadItem[]>([]);
  const itemsRef = useRef<UploadItem[]>([]);
  const optsRef = useRef(opts);
  const busyRef = useRef(false);
  const [isSavingAll, setIsSavingAll] = useState(false);

  useEffect(() => {
    optsRef.current = opts;
  });

  // Keep the ref in sync synchronously so the scan loop never reads stale state.
  const setItems = useCallback((update: (prev: UploadItem[]) => UploadItem[]) => {
    itemsRef.current = update(itemsRef.current);
    setItemsState(itemsRef.current);
  }, []);

  const patch = useCallback(
    (id: string, p: Partial<UploadItem>) => {
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it)));
    },
    [setItems],
  );

  const pump = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      for (;;) {
        const next = itemsRef.current.find((it) => it.status === "queued");
        if (!next) break;
        patch(next.id, { status: "scanning", error: undefined });
        try {
          const scan = await optsRef.current.scanFn(next.file);
          if (!itemsRef.current.some((it) => it.id === next.id)) continue; // removed meanwhile
          patch(next.id, { status: "review", scan });
          optsRef.current.onScanned?.(next.id, itemsRef.current);
        } catch (err) {
          patch(next.id, { status: "error", error: errorMessage(err, optsRef.current.scanErrorText) });
        }
      }
    } finally {
      busyRef.current = false;
    }
  }, [patch]);

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      const added: UploadItem[] = files.map((file) => ({
        id: `u${++seq}`,
        file,
        previewUrl: URL.createObjectURL(file),
        isPdf: isPdfFile(file),
        status: "queued",
      }));
      setItems((prev) => [...prev, ...added]);
      void pump();
    },
    [pump, setItems],
  );

  const remove = useCallback(
    (id: string) => {
      const it = itemsRef.current.find((x) => x.id === id);
      if (it) URL.revokeObjectURL(it.previewUrl);
      setItems((prev) => prev.filter((x) => x.id !== id));
    },
    [setItems],
  );

  const retry = useCallback(
    (id: string) => {
      patch(id, { status: "queued", error: undefined });
      void pump();
    },
    [patch, pump],
  );

  const updateDraft = useCallback(
    (id: string, draft: CreateExpensePayload) => patch(id, { draft }),
    [patch],
  );

  /** Saves one item; on failure it stays in review with the error shown. */
  const save = useCallback(
    async (id: string, payload: CreateExpensePayload): Promise<ExpenseRecord | null> => {
      patch(id, { status: "saving", draft: payload, error: undefined });
      try {
        const record = await optsRef.current.createFn(payload);
        patch(id, { status: "saved", record, draft: undefined });
        return record;
      } catch (err) {
        patch(id, { status: "review", error: errorMessage(err, optsRef.current.saveErrorText) });
        return null;
      }
    },
    [patch],
  );

  /** Saves every scanned item one after another (edited drafts win). */
  const saveAll = useCallback(async () => {
    setIsSavingAll(true);
    const saved: ExpenseRecord[] = [];
    try {
      for (const it of itemsRef.current.filter((x) => x.status === "review" && x.scan)) {
        const payload = it.draft ?? optsRef.current.buildPayload(it.scan!);
        const record = await save(it.id, payload);
        if (record) saved.push(record);
      }
    } finally {
      setIsSavingAll(false);
    }
    return saved;
  }, [save]);

  const reset = useCallback(() => {
    itemsRef.current.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    setItems(() => []);
  }, [setItems]);

  // Free object URLs when the page goes away.
  useEffect(
    () => () => {
      itemsRef.current.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    },
    [],
  );

  const count = (s: UploadItem["status"]) => items.filter((it) => it.status === s).length;

  return {
    items,
    addFiles,
    remove,
    retry,
    updateDraft,
    save,
    saveAll,
    reset,
    isSavingAll,
    reviewCount: count("review"),
    savedCount: count("saved"),
    pendingCount: items.filter((it) => it.status !== "saved").length,
    isScanning: items.some((it) => it.status === "scanning" || it.status === "queued"),
  };
}
