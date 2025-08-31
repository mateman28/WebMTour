import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminNav } from "@/components/admin-nav"
import { BookingsTable } from "@/components/bookings-table"

export default async function AdminBookingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/admin/login")
  }

  const { data: adminUser } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

  if (!adminUser) {
    redirect("/admin/login")
  }

  // Get all bookings with tour information
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      tours (
        title,
        location
      )
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <AdminNav adminUser={adminUser} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{"จัดการการจอง"}</h1>
          <p className="text-muted-foreground">{"ดูและจัดการการจองทั้งหมด"}</p>
        </div>

        <BookingsTable bookings={bookings || []} />
      </div>
    </div>
  )
}
