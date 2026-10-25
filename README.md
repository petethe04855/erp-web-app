# 🧾 Chawy ERP Expense Uploader & LINE OA Integration (`erp-expense-upload`)

แอปพลิเคชันเว็บแบบ Standalone (Next.js 15 App Router + Tailwind CSS) สำหรับอัปโหลดและสแกนใบเสร็จ/สลิปโอนเงินเข้าสู่ฐานข้อมูล `expenses` ของระบบ Chawy ERP พร้อมเชื่อมต่อกับ **LINE Official Account (LINE OA)** ครบวงจร

---

## 🌟 ฟีเจอร์หลัก (Key Features)

1. **LINE OA Chat Bot (`/api/line/webhook`)**:
   - ผู้ใช้งานส่งรูปสลิปหรือใบเสร็จเข้าไปในห้องแชท LINE OA ได้โดยตรง
   - ดึงรูปภาพอัตโนมัติ ส่งให้ AI (Gemini Vision OCR) สแกนยอดเงิน, ร้านค้า, วันที่, และรายการสินค้า
   - ตอบกลับผู้ใช้ใน LINE ด้วย **LINE Flex Message** แสดงการ์ดสแกน พร้อมปุ่ม **"✅ ยืนยันบันทึกทันที"**
   - ผู้ใช้กดปุ่มเดียว บันทึกข้อมูลลงตาราง `expenses` ในระบบ ERP พร้อมบันทึกชื่อ LINE ผู้ส่งในฟิลด์ `created_by`

2. **LINE LIFF Web App (`@line/liff`)**:
   - เปิดผ่าน Rich Menu ใน LINE OA แบบเต็มจอ
   - ดึงโปรไฟล์ LINE User (รูป + ชื่อ) อัตโนมัติ โดยไม่ต้องกรอกรหัส PIN หรือ Username/Password

3. **Standalone Web & Mobile Direct Access**:
   - เปิดใช้งานได้ทันทีทั้งบนเบราว์เซอร์มือถือและเดสก์ท็อป โดยไม่ต้องกรอกรหัส PIN
   - ปุ่มถ่ายภาพด่วนจากกล้องหลังมือถือ (`capture="environment"`)
   - ลากไฟล์มาวาง (Drag & Drop) หรือกด `Ctrl + V` เพื่อวางรูปภาพจาก Clipboard ได้ทันที

4. **ตรวจทานก่อนบันทึก (Review & Edit Card)**:
   - แสดงภาพขนาดย่อ พร้อมโหมดดูภาพขยาย (Zoom Lightbox)
   - ปรับแก้ไขยอดเงิน (฿), วันที่, หมวดหมู่ทั้ง 7 หมวด, ช่องทาง, ร้านค้า, เลขที่คำสั่งซื้อ, และคำอธิบาย
   - กดบันทึกลงฐานข้อมูล `expenses` พร้อมแสดงการ์ดสรุปและเอฟเฟกต์ Confetti ฉลองความสำเร็จ
   - ปุ่ม **"ถ่าย / อัปโหลดใบเสร็จใบต่อไป"** สำหรับทำงานต่อเนื่องได้อย่างรวดเร็ว

---

## 🚀 วิธีการติดตั้งและรันโปรเจค

### 1. เข้าสู่โฟลเดอร์โปรเจค
```bash
cd erp-expense-upload
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. คัดลอกและตั้งค่าไฟล์ Environment
```bash
cp .env.example .env.local
```
ตั้งค่าตัวแปร:
- `NEXT_PUBLIC_API_URL`: URL ของ backend API (ค่าเริ่มต้น `http://localhost:8084/api/v1`)
- `NEXT_PUBLIC_LIFF_ID`: LIFF ID จาก LINE Developers Console (สำหรับโหมด LIFF)
- `LINE_CHANNEL_ACCESS_TOKEN`: Channel Access Token ของ LINE Messaging API
- `LINE_CHANNEL_SECRET`: Channel Secret ของ LINE Messaging API

### 4. รันโปรเจคในโหมดพัฒนา (Development)
```bash
npm run dev
```
แอปจะทำงานที่พอร์ต **`http://localhost:8083`**

---

## 📱 การเชื่อมต่อกับ LINE Official Account

### 1. ตั้งค่า Webhook URL ใน LINE Developers Console
- ไปที่ **Messaging API** tab ใน LINE Developers Console
- กำหนด **Webhook URL** เป็น:
  ```text
  https://<your-domain-or-ngrok>/api/line/webhook
  ```
- เปิดใช้งานสวิตช์ **Use webhook**

### 2. ตั้งค่า LIFF App สำหรับ Rich Menu
- ไปที่ **LIFF** tab ใน LINE Developers Console
- เพิ่ม LIFF App ใหม่:
  - Size: **Full** หรือ **Tall**
  - Endpoint URL: `https://<your-domain-or-ngrok>/`
  - Scopes: `profile`, `openid`
- นำ LIFF ID ที่ได้มากรอกใน `NEXT_PUBLIC_LIFF_ID` ในไฟล์ `.env.local`
- นำ LIFF URL (เช่น `https://liff.line.me/xxxxxx-xxxxxx`) ไปผูกกับ Action ใน Rich Menu ของ LINE OA
"# erp-web-app" 
