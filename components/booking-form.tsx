"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Minus, Plus } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Tour {
  id: string
  title: string
  price: number
  max_participants: number
}

interface BookingFormProps {
  tour: Tour
}

export function BookingForm({ tour }: BookingFormProps) {
  const router = useRouter()
  const [bookingDate, setBookingDate] = useState<Date>()
  const [participants, setParticipants] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  })

  const totalPrice = tour.price * participants

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingDate) {
      alert("กรุณาเลือกวันที่เดินทาง")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tour_id: tour.id,
          user_name: formData.name,
          user_email: formData.email,
          user_phone: formData.phone,
          booking_date: format(bookingDate, "yyyy-MM-dd"),
          participants_count: participants,
          total_price: totalPrice,
          special_requests: formData.specialRequests,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/booking-success?id=${result.booking_id}`)
      } else {
        const error = await response.json()
        alert(error.message || "เกิดข้อผิดพลาดในการจอง")
      }
    } catch (error) {
      console.error("Booking error:", error)
      alert("เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{"จองทัวร์นี้"}</CardTitle>
        <div className="text-2xl font-bold text-blue-600">
          ฿{tour.price.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ คน</span>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label>{"วันที่เดินทาง"}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !bookingDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {bookingDate ? format(bookingDate, "dd MMMM yyyy", { locale: th }) : "เลือกวันที่"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={bookingDate}
                  onSelect={setBookingDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Participants Selection */}
          <div className="space-y-2">
            <Label>{"จำนวนผู้เข้าร่วม"}</Label>
            <div className="flex items-center justify-between border rounded-md px-3 py-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setParticipants(Math.max(1, participants - 1))}
                disabled={participants <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-medium">{participants} คน</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setParticipants(Math.min(tour.max_participants, participants + 1))}
                disabled={participants >= tour.max_participants}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {"สูงสุด"} {tour.max_participants} {"คน"}
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{"ชื่อ-นามสกุล"}</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{"อีเมล"}</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="กรอกอีเมล"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{"เบอร์โทรศัพท์"}</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="กรอกเบอร์โทรศัพท์"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="special-requests">{"ความต้องการพิเศษ (ถ้ามี)"}</Label>
              <Textarea
                id="special-requests"
                value={formData.specialRequests}
                onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                placeholder="เช่น อาหารเจ, ที่พักพิเศษ, ฯลฯ"
                rows={3}
              />
            </div>
          </div>

          {/* Price Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{"ราคาต่อคน"}</span>
              <span>฿{tour.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{"จำนวนผู้เข้าร่วม"}</span>
              <span>{participants} คน</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>{"ราคารวม"}</span>
              <span className="text-blue-600">฿{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? "กำลังจอง..." : "จองเลย"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
