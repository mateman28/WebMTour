"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

interface BookingData {
  id: string
  status: string
  booking_date: string
  participants_count: number
  user_name: string
  user_email: string
  user_phone: string
  special_requests?: string
  total_price: number
  tours?: {
    title: string
    location: string
    duration_days: number
  }
  bookingid: string
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchBooking = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("bookings")
          .select(`
            *,
            tours (
              title,
              location,
              duration_days
            )
          `)
          .eq("id", id)
          .single()

        if (error) {
          setError("ไม่พบข้อมูลการจอง")
        } else {
          setBooking(data)
        }
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล")
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [id])

  if (!id || error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{error || "ไม่พบข้อมูลการจอง"}</p>
            <Link href="/">
              <Button className="mt-4">กลับหน้าแรก</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">ไม่พบข้อมูลการจอง</p>
            <Link href="/">
              <Button className="mt-4">กลับหน้าแรก</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{"จองสำเร็จ!"}</h1>
            <p className="text-lg text-muted-foreground">{"ขอบคุณที่เลือกใช้บริการของเรา"}</p>
          </div>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {"รายละเอียดการจอง"}
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {booking.status === "pending" ? "รอการยืนยัน" : booking.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">{"หมายเลขการจอง"}</h3>
                  <p className="font-mono text-sm">{booking.bookingid}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">{"สถานะ"}</h3>
                  <p>{booking.status === "pending" ? "รอการยืนยัน" : booking.status}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">{"ข้อมูลทัวร์"}</h3>
                <div className="space-y-2">
                  <p className="font-medium">{booking.tours?.title}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>📍 {booking.tours?.location}</span>
                    <span>📅 {booking.tours?.duration_days} วัน</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">{"ข้อมูลการเดินทาง"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">{"วันที่เดินทาง"}</h4>
                    <p>{format(new Date(booking.booking_date), "dd MMMM yyyy", { locale: th })}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">{"จำนวนผู้เข้าร่วม"}</h4>
                    <p>{booking.participants_count} คน</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">{"ข้อมูลผู้จอง"}</h3>
                <div className="space-y-2">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">{"ชื่อ-นามสกุล"}</h4>
                    <p>{booking.user_name}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">{"อีเมล"}</h4>
                      <p>{booking.user_email}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">{"เบอร์โทรศัพท์"}</h4>
                      <p>{booking.user_phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {booking.special_requests && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">{"ความต้องการพิเศษ"}</h3>
                  <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{"ราคารวม"}</span>
                  <span className="text-2xl font-bold text-blue-600">฿{booking.total_price.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{"ขั้นตอนถัดไป"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <p>
                    {"เราจะส่งอีเมลยืนยันการจองไปยัง"} <strong>{booking.user_email}</strong> {"ภายใน 24 ชั่วโมง"}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <p>{"ทีมงานจะติดต่อกลับเพื่อยืนยันรายละเอียดและแจ้งขั้นตอนการชำระเงิน"}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <p>{"เตรียมตัวสำหรับการเดินทางที่น่าจดจำ!"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                {"กลับหน้าแรก"}
              </Button>
            </Link>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => window.print()}>
              {"พิมพ์ใบจอง"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
