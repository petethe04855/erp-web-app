# syntax=docker/dockerfile:1

# ---------- Dependencies ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Build ----------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# .env.example ถูก next.config.ts อ่านเป็น fallback LIFF ID ตอน build — ต้องเข้า context
# (เหมือนเดิม next.config.ts ไม่แก้ action ของ env)
ARG NEXT_PUBLIC_LIFF_ID=""
ENV NEXT_PUBLIC_LIFF_ID=$NEXT_PUBLIC_LIFF_ID
ARG INTERNAL_ERP_API_URL="http://127.0.0.1:8084/api/v1"
ENV INTERNAL_ERP_API_URL=$INTERNAL_ERP_API_URL
COPY . .
RUN npm run build

# ---------- Runtime (standalone) ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8083 \
    HOSTNAME=0.0.0.0

RUN addgroup -S nodejs -g 1001 \
    && adduser -S nextjs -u 1001 -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8083
CMD ["node", "server.js"]
