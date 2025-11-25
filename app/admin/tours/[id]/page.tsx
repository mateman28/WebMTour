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
import { ArrowLeft, Upload, X, Calendar, Plus, Trash2, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Interface สำหรับรอบวันที่
interface TourDate {
  id?: number // มี id กรณีเป็นข้อมูลเดิม
  start_date: string
  end_date: string
  price: number
  status: string
}

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
  pdf_url?: string
  OwnerTour?: string
  Code_Tour_owner?: string
  Link_Owner?: string
  tour_dates?: TourDate[] // เพิ่มรายการวันที่
}

export default function EditTourPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // State สำหรับ Form Data
  const [formData, setFormData] = useState<Tour>({
    id: "",
    title: "",
    description: "",
    location: "",
    price: 0,
    duration_days: 1,
    max_participants: 1,
    is_active: true,
    image_url: "",
    pdf_url: "",
    OwnerTour: "",
    Code_Tour_owner: "",
    Link_Owner: "",
    tour_dates: []
  })

  // State สำหรับวันที่ใหม่ที่กำลังจะเพิ่ม
  const [newDate, setNewDate] = useState<TourDate>({
    start_date: "",
    end_date: "",
    price: 0,
    status: "available"
  })

  useEffect(() => {
    if (params.id === "new") {
      router.replace("/admin/tours/new")
      return
    }
    fetchTour()
  }, [params.id, router])

  // ฟังก์ชันโหลดข้อมูลทัวร์
  const fetchTour = async () => {
    try {
      const response = await fetch(`/api/tours/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch tour")

      const data = await response.json()
      
      // Map ข้อมูลจาก API เข้า State
      setFormData({
        id: data.id,
        title: data.title || "",
        description: data.description || "",
        location: data.location  || "", // รองรับทั้งชื่อเก่าและใหม่
        price: data.price || 0,
        duration_days: data.duration_days || data.duration || 1,
        max_participants: data.max_participants || 1,
        is_active: data.is_active ?? true,
        image_url: data.image_url || "",
        pdf_url: data.pdf_url || "",
        OwnerTour: data.OwnerTour || "",
        Code_Tour_owner: data.Code_Tour_owner || "",
        Link_Owner: data.Link_Owner || "",
        // ถ้า API ส่ง tour_dates มาด้วยให้ใช้ ถ้าไม่มีให้เป็น array ว่าง
        tour_dates: data.tour_dates || [] 
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

  // --- จัดการรูปภาพ ---
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
      const formDataUpload = new FormData()
      formDataUpload.append("file", selectedFile)
      const response = await fetch("/api/upload", { method: "POST", body: formDataUpload })
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

  // --- จัดการรอบวันที่ (เหมือนหน้า New) ---
  const handleAddDate = () => {
    if (newDate.start_date && newDate.end_date && newDate.price > 0) {
      if (new Date(newDate.end_date) < new Date(newDate.start_date)) {
        alert("วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น")
        return
      }
      setFormData({
        ...formData,
        tour_dates: [...(formData.tour_dates || []), newDate],
      })
      // Reset ฟอร์มวันที่ แต่คงราคาไว้
      setNewDate({ ...newDate, start_date: "", end_date: "" })
    } else {
      alert("กรุณาระบุวันเริ่มต้น, วันสิ้นสุด และราคา")
    }
  }

  const handleRemoveDate = (indexToRemove: number) => {
    setFormData({
      ...formData,
      tour_dates: formData.tour_dates?.filter((_, index) => index !== indexToRemove),
    })
  }

  // อัปเดตราคา newDate ตามราคาหลัก
  useEffect(() => {
    if (newDate.price === 0 && formData.price > 0) {
        setNewDate(prev => ({ ...prev, price: formData.price }))
    }
  }, [formData.price])

  // --- Submit Form ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      let imageUrl = formData.image_url
      if (selectedFile) {
        const uploadedUrl = await uploadImage()
        if (uploadedUrl) imageUrl = uploadedUrl
      }

      // เตรียมข้อมูลส่งไป Backend
      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        price: formData.price,
        duration_days: formData.duration_days,
        max_participants: formData.max_participants,
        is_active: formData.is_active,
        image_url: imageUrl,
        
        // ฟิลด์ใหม่
        pdf_url: formData.pdf_url,
        OwnerTour: formData.OwnerTour,
        Code_Tour_owner: formData.Code_Tour_owner,
        Link_Owner: formData.Link_Owner,
        
        // ส่งรายการวันที่ไปด้วย (Backend ต้องเขียนรองรับการ update/insert)
        tour_dates: formData.tour_dates
      }

      console.log("Update Payload:", payload)

      const response = await fetch(`/api/tours/${params.id}`, {
        method: "PUT", // หรือ PATCH ตามที่ Backend กำหนด
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update tour")
      }

      alert("✅ อัปเดตทัวร์สำเร็จ")
      router.push("/admin/tours")
    } catch (error) {
      console.error("Error updating tour:", error)
      alert("เกิดข้อผิดพลาดในการอัปเดตทัวร์")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="container mx-auto p-6 text-center">กำลังโหลด...</div>
  if (!formData.id) return <div className="container mx-auto p-6 text-center">ไม่พบข้อมูลทัวร์</div>

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/admin/tours">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> กลับไปรายการทัวร์
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">แก้ไขทัวร์</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>ข้อมูลทัวร์</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* รูปภาพ */}
            <div className="space-y-2">
              <Label htmlFor="image">รูปภาพทัวร์</Label>
              {previewUrl && (
                <div className="relative w-full max-w-md mt-2">
                  <Image src={previewUrl} alt="Preview" width={400} height={200} className="rounded-lg object-cover h-48 w-full" unoptimized />
                  <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={removeImage}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
               {/* URL รูปภาพ */}
               <div className="mt-2">
                   <Label className="text-xs text-muted-foreground">หรือใส่ลิงก์รูปภาพโดยตรง</Label>
                   <Input 
                        value={formData.image_url} 
                        onChange={(e) => {
                            setFormData({...formData, image_url: e.target.value});
                            setPreviewUrl(e.target.value);
                        }} 
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                    />
               </div>
            </div>

            {/* ข้อมูลพื้นฐาน */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">ชื่อทัวร์</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">จุดหมาย (location)</Label>
                <Input id="destination" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} required />
            </div>

            {/* ข้อมูล Owner & PDF (เพิ่มใหม่) */}
            <div className="p-4 bg-slate-50 rounded-lg border space-y-4">
                <h3 className="font-semibold text-sm text-slate-700">ข้อมูลเพิ่มเติม & Owner</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="OwnerTour">Owner Name</Label>
                        <Input id="OwnerTour" value={formData.OwnerTour} onChange={(e) => setFormData({...formData, OwnerTour: e.target.value})} placeholder="ชื่อบริษัททัวร์" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="Code_Tour_owner">Code Owner</Label>
                        <Input id="Code_Tour_owner" value={formData.Code_Tour_owner} onChange={(e) => setFormData({...formData, Code_Tour_owner: e.target.value})} placeholder="รหัสทัวร์ของ Owner" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="Link_Owner">Link Owner</Label>
                        <Input id="Link_Owner" value={formData.Link_Owner} onChange={(e) => setFormData({...formData, Link_Owner: e.target.value})} placeholder="Website Link" />
                    </div>
                     <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="pdf_url">PDF Link</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input id="pdf_url" className="pl-9" value={formData.pdf_url} onChange={(e) => setFormData({...formData, pdf_url: e.target.value})} placeholder="https://.../file.pdf" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ราคาและจำนวน */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">ราคาเริ่มต้น (บาท)</Label>
                <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">ระยะเวลา (วัน)</Label>
                <Input id="duration" type="number" value={formData.duration_days} onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="participants">จำนวนผู้เข้าร่วมสูงสุด</Label>
                <Input id="participants" type="number" value={formData.max_participants} onChange={(e) => setFormData({ ...formData, max_participants: Number(e.target.value) })} required />
              </div>
            </div>

            {/* --- ตารางรอบวันที่ (เพิ่มใหม่) --- */}
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-muted-foreground"/>
                    <h3 className="font-medium">จัดการรอบการเดินทาง (Tour Dates)</h3>
                </div>
                
                {/* Form เพิ่มวันที่ */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                    <div className="space-y-2 md:col-span-2">
                        <Label>วันไป</Label>
                        <Input type="date" value={newDate.start_date} onChange={(e) => setNewDate({ ...newDate, start_date: e.target.value })} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>วันกลับ</Label>
                        <Input type="date" value={newDate.end_date} onChange={(e) => setNewDate({ ...newDate, end_date: e.target.value })} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                         <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>ราคา</Label>
                                <Input type="number" value={newDate.price} onChange={(e) => setNewDate({ ...newDate, price: Number(e.target.value) })} />
                            </div>
                            <div className="flex-1">
                                <Label>สถานะ</Label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    value={newDate.status} onChange={(e) => setNewDate({ ...newDate, status: e.target.value })}>
                                    <option value="available">เปิดรับ</option>
                                    <option value="full">เต็ม</option>
                                    <option value="closed">ปิด</option>
                                </select>
                            </div>
                         </div>
                    </div>
                    <div className="md:col-span-1">
                        <Button type="button" onClick={handleAddDate} className="w-full"><Plus className="h-4 w-4" /></Button>
                    </div>
                </div>

                {/* ตารางแสดงวันที่ */}
                {formData.tour_dates && formData.tour_dates.length > 0 ? (
                    <div className="rounded-md border bg-white overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3">วันที่</th>
                                    <th className="px-4 py-3">ราคา</th>
                                    <th className="px-4 py-3">สถานะ</th>
                                    <th className="px-4 py-3 text-right">ลบ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {formData.tour_dates.map((date, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3">
                                            {new Date(date.start_date).toLocaleDateString('th-TH')} - {new Date(date.end_date).toLocaleDateString('th-TH')}
                                        </td>
                                        <td className="px-4 py-3">฿{date.price.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                date.status === 'available' ? 'bg-green-100 text-green-800' : 
                                                date.status === 'full' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {date.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleRemoveDate(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">ไม่มีรอบการเดินทาง</p>
                )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
              <Label htmlFor="is_active">เปิดใช้งาน (Active)</Label>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={isSaving || isUploading} className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
              </Button>
              <Link href="/admin/tours">
                <Button type="button" variant="outline">ยกเลิก</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}