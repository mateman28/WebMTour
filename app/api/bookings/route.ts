import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      tour_id,
      user_name,
      user_email,
      user_phone,
      booking_date,
      participants_count,
      total_price,
      special_requests,
    } = body

    // 1. ตรวจสอบข้อมูลที่จำเป็น
    if (!tour_id || !user_name || !user_email || !user_phone || !booking_date || !participants_count) {
      return NextResponse.json({ message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 })
    }

    // 2. ตรวจสอบว่าทัวร์มีอยู่จริงและเปิดใช้งาน
    const { data: tour, error: tourError } = await supabase
      .from("tours")
      .select("*")
      .eq("id", tour_id)
      .eq("is_active", true)
      .single()

    if (tourError || !tour) {
      return NextResponse.json({ message: "ไม่พบทัวร์ที่เลือก" }, { status: 404 })
    }

    // 🟢 3. (เพิ่มใหม่) ตรวจสอบว่า "วันที่เลือก" มีอยู่จริง และสถานะต้องเป็น "available"
    const { data: tourDate, error: dateError } = await supabase
      .from("tour_dates")
      .select("status, price") // ดึงสถานะและราคามาเช็ค
      .eq("tour_id", tour_id)
      .eq("start_date", booking_date) // เช็คว่าวันที่ตรงกับวันเริ่มทัวร์
      .single()

    if (dateError || !tourDate) {
         return NextResponse.json({ message: "ไม่พบรอบการเดินทางในวันที่เลือก" }, { status: 400 })
    }

    if (tourDate.status !== 'available') {
        return NextResponse.json({ 
            message: `รอบวันที่นี้ไม่ว่าง (${tourDate.status === 'full' ? 'เต็มแล้ว' : 'ปิดรับจอง'})` 
        }, { status: 400 })
    }

    // 4. ตรวจสอบจำนวนผู้เข้าร่วม (เทียบกับ Max ของทัวร์หลัก)
    if (participants_count > tour.max_participants) {
      return NextResponse.json({ message: `จำนวนผู้เข้าร่วมเกินกำหนด (สูงสุด ${tour.max_participants} คน)` }, { status: 400 })
    }

    // (Optional) 5. ป้องกันการโกงราคา (Re-calculate Price)
    // ถ้าราคาที่ส่งมา ไม่ตรงกับ (ราคาต่อหัว * จำนวนคน) ให้ดีดกลับ หรือจะใช้ราคาจาก DB เลยก็ได้
    // const calculatedPrice = tourDate.price * participants_count; 
    // if (total_price !== calculatedPrice) { ... }

    // 6. สร้างการจอง
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        tour_id,
        user_name,
        user_email,
        user_phone,
        booking_date,
        participants_count,
        total_price, // หรือใช้ calculatedPrice เพื่อความปลอดภัย
        special_requests: special_requests || null,
        status: "pending",
      })
      .select()
      .single()

    if (bookingError) {
      console.error("Booking error:", bookingError)
      return NextResponse.json({ message: "เกิดข้อผิดพลาดในการจอง" }, { status: 500 })
    }

    return NextResponse.json({
      message: "จองสำเร็จ",
      booking_id: booking.id,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 })
  }
}