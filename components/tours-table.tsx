"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

interface ToursTableProps {
  tours: Tour[]
  onTourUpdate: (updatedTour: Tour) => void
}

export function ToursTable({ tours, onTourUpdate }: ToursTableProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const toggleTourStatus = async (tourId: string, currentStatus: boolean) => {
    setIsLoading(tourId)

    try {
      const response = await fetch(`/api/tours/${tourId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update tour status")
      }

      const updatedTour = await response.json()
      onTourUpdate(updatedTour)
    } catch (error) {
      console.error("Error updating tour status:", error)
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ")
    } finally {
      setIsLoading(null)
    }
  }

  if (tours.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-4">{"ยังไม่มีทัวร์ในระบบ"}</p>
          <Link href="/admin/tours/new">
            <Button className="bg-blue-600 hover:bg-blue-700">{"เพิ่มทัวร์แรก"}</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{"รายการทัวร์ทั้งหมด"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{"ชื่อทัวร์"}</TableHead>
              <TableHead>{"จุดหมาย"}</TableHead>
              <TableHead>{"ราคา"}</TableHead>
              <TableHead>{"ระยะเวลา"}</TableHead>
              <TableHead>{"สถานะ"}</TableHead>
              <TableHead>{"การจัดการ"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tours.map((tour) => (
              <TableRow key={tour.id}>
                <TableCell className="font-medium">{tour.title}</TableCell>
                <TableCell>{tour.location}</TableCell>
                <TableCell>฿{tour.price.toLocaleString()}</TableCell>
                <TableCell>{tour.duration_days} วัน</TableCell>
                <TableCell>
                  <Badge variant={tour.is_active ? "default" : "secondary"}>
                    {tour.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link href={`/admin/tours/${tour.id}`}>
                      <Button variant="outline" size="sm">
                        {"แก้ไข"}
                      </Button>
                    </Link>
                    <Button
                      variant={tour.is_active ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleTourStatus(tour.id, tour.is_active)}
                      disabled={isLoading === tour.id}
                    >
                      {isLoading === tour.id ? "กำลังอัปเดต..." : tour.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
