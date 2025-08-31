"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function NewTourPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [tour, setTour] = useState({
    title: "",
    description: "",
    location: "",
    price: 0,
    duration_days: 1,
    max_participants: 10,
    is_active: true,
    image_url: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview("")
    setTour({ ...tour, image_url: "" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      let imageUrl = tour.image_url

      // Upload image if selected
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json()
          imageUrl = url
        }
      }

      // Create tour using API route
      const response = await fetch("/api/tours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...tour,
          image_url: imageUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create tour")
      }

      alert("เพิ่มทัวร์สำเร็จ")
      router.push("/admin/tours")
    } catch (error) {
      console.error("Error creating tour:", error)
      alert("เกิดข้อผิดพลาดในการเพิ่มทัวร์")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/admin/tours">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปรายการทัวร์
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">เพิ่มทัวร์ใหม่</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลทัวร์</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image">รูปภาพทัวร์</Label>
              <div className="flex items-center space-x-4">
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <Button type="button" variant="outline" onClick={() => document.getElementById("image")?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  เลือกรูปภาพ
                </Button>
                {imagePreview && (
                  <div className="relative">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      width={100}
                      height={100}
                      className="rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">ชื่อทัวร์</Label>
                <Input
                  id="title"
                  value={tour.title}
                  onChange={(e) => setTour({ ...tour, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">จุดหมาย</Label>
                <Input
                  id="location"
                  value={tour.location}
                  onChange={(e) => setTour({ ...tour, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                value={tour.description}
                onChange={(e) => setTour({ ...tour, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">ราคา (บาท)</Label>
                <Input
                  id="price"
                  type="number"
                  value={tour.price}
                  onChange={(e) => setTour({ ...tour, price: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">ระยะเวลา (วัน)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={tour.duration_days}
                  onChange={(e) => setTour({ ...tour, duration_days: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="participants">จำนวนผู้เข้าร่วมสูงสุด</Label>
                <Input
                  id="participants"
                  type="number"
                  value={tour.max_participants}
                  onChange={(e) => setTour({ ...tour, max_participants: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={tour.is_active}
                onCheckedChange={(checked) => setTour({ ...tour, is_active: checked })}
              />
              <Label htmlFor="is_active">เปิดใช้งาน</Label>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? "กำลังบันทึก..." : "เพิ่มทัวร์"}
              </Button>
              <Link href="/admin/tours">
                <Button type="button" variant="outline">
                  ยกเลิก
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
