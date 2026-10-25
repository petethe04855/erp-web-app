import { lineSeedSansTH } from "./fonts";
import "./globals.css";
import { LiffProvider } from "@/components/LiffProvider";

export const metadata = {
  title: "ระบบอัปโหลดใบเสร็จค่าใช้จ่าย | Chawy ERP",
  description: "อัปโหลดและสแกนใบเสร็จ/สลิปโอนเงินเข้าสู่ระบบ ERP ทันทีด้วย AI (Gemini Vision) และ LINE OA",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ERP Expense",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={lineSeedSansTH.variable}>
      <body className="bg-[#f7f7f7] text-neutral-900 min-h-screen selection:bg-neutral-900 selection:text-white">
        <LiffProvider>{children}</LiffProvider>
      </body>
    </html>
  );
}
