// ✅ 1. ส่วน Import (ต้องมีบรรทัดพวกนี้เสมอ)
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Type ของ params สำหรับ Next.js 15
type Context = {
  params: Promise<{ id: string }>
}

// --- GET: ดึงข้อมูลทัวร์ ---
export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: tour, error } = await supabase
      .from("tours")
      .select(`
        *,
        tour_dates (
          *
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching tour:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // เรียงวันที่ (ถ้ามี)
    if (tour.tour_dates) {
        tour.tour_dates.sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    }

    return NextResponse.json(tour)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// --- PUT: แก้ไขข้อมูลทัวร์ ---
export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { 
        title, description, price, 
        duration_days, // รับค่าชื่อ duration_days
        max_participants, 
        location, // หรือ location (เช็ค DB ให้ดี)
        image_url, is_active,
        pdf_url, OwnerTour, Code_Tour_owner, Link_Owner,
        tour_dates 
    } = body

    if (!title || !description || !price || !duration_days || !max_participants || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: tour, error } = await supabase
      .from("tours")
      .update({
        title,
        description,
        price: Number.parseFloat(price),
        duration_days: Number.parseInt(duration_days),
        max_participants: Number.parseInt(max_participants),
        location : location, // อย่าลืมเช็คชื่อ column ใน DB
        image_url: image_url || null,
        
        pdf_url: pdf_url || null,
        OwnerTour: OwnerTour || null,
        Code_Tour_owner: Code_Tour_owner || null,
        Link_Owner: Link_Owner || null,

        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating tour:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // จัดการ tour_dates
    if (tour_dates) {
        await supabase.from("tour_dates").delete().eq("tour_id", id)
        if (tour_dates.length > 0) {
            const datesToInsert = tour_dates.map((d: any) => ({
                tour_id: id,
                start_date: d.start_date,
                end_date: d.end_date,
                price: Number(d.price),
                status: d.status || 'available'
            }))
            await supabase.from("tour_dates").insert(datesToInsert)
        }
    }

    return NextResponse.json({ tour })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// --- PATCH: แก้ไขสถานะ (เปิด/ปิด) ---
export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { is_active } = body

    const { data: tours, error } = await supabase
      .from("tours")
      .update({
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating tour status:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!tours || tours.length === 0) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    return NextResponse.json({ tour: tours[0] })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// --- DELETE: ลบทัวร์ ---
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase.from("tours").delete().eq("id", id)

    if (error) {
      console.error("Error deleting tour:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Tour deleted successfully" })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}