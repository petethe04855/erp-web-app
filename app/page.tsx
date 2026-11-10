import { redirect } from "next/navigation";

// The middle selection page has been removed.
// Page selection is handled by LINE menu (LIFF endpoints) instead:
//   /expense -> ลงค่าใช้จ่าย
//   /income  -> ลงรายรับ
// Root simply defaults to the expense flow.
export default function HomePage() {
  redirect("/expense");
}
