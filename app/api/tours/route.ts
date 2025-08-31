import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient()

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
    const supabase = createClient()
    const body = await request.json()

    const { title, description, price, duration, max_participants, destination, image_url } = body

    if (!title || !description || !price || !duration || !max_participants || !destination) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: tour, error } = await supabase
      .from("tours")
      .insert([
        {
          title,
          description,
          price: Number.parseFloat(price),
          duration: Number.parseInt(duration),
          max_participants: Number.parseInt(max_participants),
          destination,
          image_url: image_url || null,
          is_active: true,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating tour:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tour }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
