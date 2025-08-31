"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Tour {
  id: string
  title: string
  description: string
  location: string
  price: number
  duration_days: number
  max_participants: number
  is_active: boolean
  image_url?: string
}

export default function EditTourPage() {
  const params = useParams()
  const router = useRouter()
  const [tour, setTour] = useState<Tour | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: 0,
    duration_days: 1,
    max_participants: 1,
    is_active: true,
    image_url: "",
  })

  useEffect(() => {
    if (params.id === "new") {
      router.replace("/admin/tours/new")
      return
    }
    fetchTour()
  }, [params.id, router])

  const fetchTour = async () => {
    if (params.id === "new") return

    try {
      const response = await fetch(`/api/tours/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch tour")

      const data = await response.json()
      setTour(data)
      setFormData({
        title: data.title || "",
        description: data.description || "",
        location: data.location || "",
        price: data.price || 0,
        duration_days: data.duration_days || 1,
        max_participants: data.max_participants || 1,
        is_active: data.is_active ?? true,
        image_url: data.image_url || "",
      })
      if (data.image_url) {
        setPreviewUrl(data.image_url)
      }
    } catch (error) {
      console.error("Error fetching tour:", error)
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูลทัวร์")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeImage = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setFormData({ ...formData, image_url: "" })
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to upload image")

      const { url } = await response.json()
      return url
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tour) return

    setIsSaving(true)
    try {
      let imageUrl = formData.image_url
      if (selectedFile) {
        const uploadedUrl = await uploadImage()
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      const response = await fetch(`/api/tours/${tour.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image_url: imageUrl,
        }),
      })

      if (!response.ok) throw new Error("Failed to update tour")

      alert("อัปเดตทัวร์สำเร็จ")
      router.push("/admin/tours")
    } catch (error) {
      console.error("Error updating tour:", error)
      alert("เกิดข้อผิดพลาดในการอัปเดตทัวร์")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">กำลังโหลด...</div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">ไม่พบข้อมูลทัวร์</div>
      </div>
    )
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
        <h1 className="text-3xl font-bold">แก้ไขทัวร์</h1>
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
                <Input id="image" type="file" accept="image/*" onChange={handleFileSelect} className="flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("image")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  เลือกรูป
                </Button>
              </div>

              {previewUrl && (
                <div className="relative w-full max-w-md">
                  <Image
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    width={400}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">ชื่อทัวร์</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">จุดหมาย</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">ระยะเวลา (วัน)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="participants">จำนวนผู้เข้าร่วมสูงสุด</Label>
                <Input
                  id="participants"
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">เปิดใช้งาน</Label>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={isSaving || isUploading} className="bg-blue-600 hover:bg-blue-700">
                {isSaving || isUploading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
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
