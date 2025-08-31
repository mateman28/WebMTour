import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { TourDetails } from "@/components/tour-details"
import { BookingForm } from "@/components/booking-form"

interface TourPageProps {
  params: Promise<{ id: string }>
}

export default async function TourPage({ params }: TourPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // ดึงข้อมูลทัวร์
  const { data: tour, error } = await supabase.from("tours").select("*").eq("id", id).eq("is_active", true).single()

  if (error || !tour) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tour Details - 2/3 width */}
          <div className="lg:col-span-2">
            <TourDetails tour={tour} />
          </div>

          {/* Booking Form - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingForm tour={tour} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
