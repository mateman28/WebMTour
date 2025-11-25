import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: tours, error } = await supabase.from("tours").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching tours:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tours })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { title, 
        description, 
        price, 
        duration_days, // เช็คให้ดีว่า Frontend ส่งมาชื่อ duration หรือ duration_days (ในโค้ดข้อ 1 ผมใส่ให้ส่ง duration)
        max_participants, 
        location, 
        image_url,
        // 🟢 รับค่าใหม่เพิ่ม
        pdf_url,
        OwnerTour,
        Code_Tour_owner,
        Link_Owner,
        tour_dates
       } = body

    if (!title || !description || !price || !duration_days || !max_participants || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: tour, error } = await supabase
      .from("tours")
      .insert([
        {
          title,
          description,
          price: Number.parseFloat(price),
          duration_days: Number.parseInt(duration_days),
          max_participants: Number.parseInt(max_participants),
          location,
          image_url: image_url || null,
          
          
          // 🟢 บันทึกค่าใหม่ลง Supabase (ต้องมั่นใจว่าใน Table สร้าง Column พวกนี้แล้ว)
          pdf_url: pdf_url || null,
          OwnerTour: OwnerTour || null,
          Code_Tour_owner: Code_Tour_owner || null,
          Link_Owner: Link_Owner || null,

          is_active: true,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating tour:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 🟢 3. ถ้ามีรอบวันที่ (tour_dates) ให้บันทึกลงตาราง tour_dates
    if (tour_dates && tour_dates.length > 0) {
        
        // เตรียมข้อมูล: เอา ID ของทัวร์ที่เพิ่งสร้าง (tour.id) มาใส่ในทุก record
        const datesToInsert = tour_dates.map((date: any) => ({
            tour_id: tour.id, // 🔑 Key สำคัญที่เชื่อมตาราง
            start_date: date.start_date,
            end_date: date.end_date,
            price: Number.parseFloat(date.price)
        }))

        const { error: datesError } = await supabase
            .from("tour_dates")
            .insert(datesToInsert)

        if (datesError) {
            console.error("Error inserting dates:", datesError)
            // แจ้งเตือนแต่อาจจะไม่ return error 500 เพราะทัวร์หลักสร้างสำเร็จแล้ว
        }
    }
    return NextResponse.json({ tour }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
