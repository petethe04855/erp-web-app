# 🧾 Chawy ERP Expense Uploader & LIFF Web App (`erp-expense-upload`)

แอปพลิเคชันเว็บแบบ Frontend-Only (Next.js 15 App Router + Tailwind CSS) สำหรับอัปโหลดและสแกนใบเสร็จ/สลิปโอนเงินเข้าสู่ระบบ Chawy ERP พร้อมเชื่อมต่อกับ **LINE LIFF** โดยทำงานร่วมกับ **`erp-expense-api`** (Go + Fiber) บนพอร์ต `8085`

---

## 🌟 ฟีเจอร์หลัก (Key Features)

1. **LINE LIFF Integration (`@line/liff`)**:
   - เปิดผ่าน Rich Menu ใน LINE OA แบบเต็มจอ
   - ดึงโปรไฟล์ LINE User (รูป + Display Name) อัตโนมัติในฝั่งเบราว์เซอร์

2. **Standalone Web & Mobile Direct Access**:
   - ใช้งานได้บนเบราว์เซอร์มือถือและเดสก์ท็อปโดยตรง
   - ปุ่มถ่ายภาพด่วนจากกล้องหลังมือถือ (`capture="environment"`)
   - ลากไฟล์มาวาง (Drag & Drop) หรือกด `Ctrl + V` เพื่อวางรูปภาพจาก Clipboard

3. **ตรวจทานก่อนบันทึก (Review & Edit Card)**:
   - แสดงภาพขนาดย่อ พร้อมโหมดดูภาพขยาย (Zoom Lightbox)
   - ปรับแก้ไขยอดเงิน (฿), วันที่, หมวดหมู่ทั้ง 7 หมวด, ช่องทาง, ร้านค้า, เลขที่คำสั่งซื้อ, และคำอธิบาย
   - กดบันทึกลงฐานข้อมูล ERP ผ่าน `erp-expense-api` พร้อมเอฟเฟกต์ Confetti ฉลองความสำเร็จ

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

### 3. ตั้งค่า Environment Variables
```bash
cp .env.example .env.local
```
กำหนดค่าตัวแปร:
- `NEXT_PUBLIC_EXPENSE_API_URL`: URL ของ Backend `erp-expense-api` (ค่าเริ่มต้น `http://localhost:8085/api/v1`)
- `NEXT_PUBLIC_BACKEND_HOST`: Host ของ ERP สำหรับแสดงรูปภาพ (ค่าเริ่มต้น `http://localhost:8084`)
- `NEXT_PUBLIC_LIFF_ID`: LIFF ID จาก LINE Developers Console (สำหรับโหมดเปิดใน LINE)

### 4. รันโปรเจคในโหมดพัฒนา
```bash
npm run dev
```
แอปจะทำงานที่พอร์ต **`http://localhost:8083`**
