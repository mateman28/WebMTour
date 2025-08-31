"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { th } from "date-fns/locale"

interface Booking {
  id: string
  user_name: string
  user_email: string
  user_phone: string
  booking_date: string
  participants_count: number
  total_price: number
  status: string
  created_at: string
  tours: {
    title: string
    location: string
  } | null
}

interface BookingsTableProps {
  bookings: Booking[]
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setIsLoading(bookingId)

    try {
      const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", bookingId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error updating booking status:", error)
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ")
    } finally {
      setIsLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {"รอยืนยัน"}
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {"ยืนยันแล้ว"}
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            {"ยกเลิก"}
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {"เสร็จสิ้น"}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">{"ยังไม่มีการจองในระบบ"}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{"รายการการจองทั้งหมด"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{"ผู้จอง"}</TableHead>
              <TableHead>{"ทัวร์"}</TableHead>
              <TableHead>{"วันที่เดินทาง"}</TableHead>
              <TableHead>{"จำนวนคน"}</TableHead>
              <TableHead>{"ราคารวม"}</TableHead>
              <TableHead>{"สถานะ"}</TableHead>
              <TableHead>{"การจัดการ"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{booking.user_name}</p>
                    <p className="text-sm text-muted-foreground">{booking.user_email}</p>
                    <p className="text-sm text-muted-foreground">{booking.user_phone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{booking.tours?.title}</p>
                    <p className="text-sm text-muted-foreground">{booking.tours?.location}</p>
                  </div>
                </TableCell>
                <TableCell>{format(new Date(booking.booking_date), "dd MMM yyyy", { locale: th })}</TableCell>
                <TableCell>{booking.participants_count} คน</TableCell>
                <TableCell className="font-medium">฿{booking.total_price.toLocaleString()}</TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                <TableCell>
                  <Select
                    value={booking.status}
                    onValueChange={(value) => updateBookingStatus(booking.id, value)}
                    disabled={isLoading === booking.id}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{"รอยืนยัน"}</SelectItem>
                      <SelectItem value="confirmed">{"ยืนยันแล้ว"}</SelectItem>
                      <SelectItem value="cancelled">{"ยกเลิก"}</SelectItem>
                      <SelectItem value="completed">{"เสร็จสิ้น"}</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
