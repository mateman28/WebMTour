"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AdminNav } from "@/components/admin-nav"
import { ToursTable } from "@/components/tours-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Tour {
  id: string
  title: string
  location: string
  price: number
  duration_days: number
  max_participants: number
  is_active: boolean
  created_at: string
}

interface AdminUser {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
}

export default function AdminToursPage() {
  const router = useRouter()
  const supabase = createClient()
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/admin/login")
        return
      }

      const { data: adminUserData } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

      if (!adminUserData) {
        router.push("/admin/login")
        return
      }

      setAdminUser(adminUserData)
      await fetchTours()
    } catch (error) {
      console.error("Auth error:", error)
      router.push("/admin/login")
    }
  }

  const fetchTours = async () => {
    try {
      const { data, error } = await supabase.from("tours").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setTours(data || [])
    } catch (error: any) {
      console.error("Error fetching tours:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">กำลังโหลด...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        {adminUser && <AdminNav adminUser={adminUser} />}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h1>
            <p className="text-muted-foreground mb-4">ไม่สามารถโหลดข้อมูลทัวร์ได้</p>
            <p className="text-sm text-red-500">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              ลองใหม่
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!adminUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav adminUser={adminUser} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{"จัดการทัวร์"}</h1>
            <p className="text-muted-foreground">{"เพิ่ม แก้ไข และจัดการแพ็คเกจทัวร์"}</p>
          </div>
          <Link href="/admin/tours/new">
            <Button className="bg-blue-600 hover:bg-blue-700">{"เพิ่มทัวร์ใหม่"}</Button>
          </Link>
        </div>

        <ToursTable tours={tours} />
      </div>
    </div>
  )
}
