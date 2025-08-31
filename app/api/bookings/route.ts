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

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!tour_id || !user_name || !user_email || !user_phone || !booking_date || !participants_count) {
      return NextResponse.json({ message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 })
    }

    // ตรวจสอบว่าทัวร์มีอยู่จริงและเปิดใช้งาน
    const { data: tour, error: tourError } = await supabase
      .from("tours")
      .select("*")
      .eq("id", tour_id)
      .eq("is_active", true)
      .single()

    if (tourError || !tour) {
      return NextResponse.json({ message: "ไม่พบทัวร์ที่เลือก" }, { status: 404 })
    }

    // ตรวจสอบจำนวนผู้เข้าร่วม
    if (participants_count > tour.max_participants) {
      return NextResponse.json({ message: `จำนวนผู้เข้าร่วมเกินกำหนด (สูงสุด ${tour.max_participants} คน)` }, { status: 400 })
    }

    // สร้างการจอง
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        tour_id,
        user_name,
        user_email,
        user_phone,
        booking_date,
        participants_count,
        total_price,
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
