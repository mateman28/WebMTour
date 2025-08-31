import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { data: tour, error } = await supabase.from("tours").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Error fetching tour:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    return NextResponse.json({ tour })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { title, description, price, duration, max_participants, destination, image_url, is_active } = body

    if (!title || !description || !price || !duration || !max_participants || !destination) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: tour, error } = await supabase
      .from("tours")
      .update({
        title,
        description,
        price: Number.parseFloat(price),
        duration: Number.parseInt(duration),
        max_participants: Number.parseInt(max_participants),
        destination,
        image_url: image_url || null,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating tour:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    return NextResponse.json({ tour })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { is_active } = body

    const { data: tours, error } = await supabase
      .from("tours")
      .update({
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()

    if (error) {
      console.error("Error updating tour status:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!tours || tours.length === 0) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    const tour = tours[0]
    return NextResponse.json({ tour })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("tours").delete().eq("id", params.id)

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
