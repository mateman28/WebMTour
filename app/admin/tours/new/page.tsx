"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Plus, Trash2, Calendar, Link as LinkIcon, Image as ImageIcon, CheckCircle, X } from "lucide-react"
import Link from "next/link"

interface TourDate {
  start_date: string
  end_date: string
  price: number
}

export default function NewTourPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  
  const [tour, setTour] = useState({
    title: "",
    description: "",
    location: "",
    price: 0.00,
    duration_days: 1,
    max_participants: 10,
    is_active: true,
    image_url: "",
    tour_dates: [] as TourDate[],
    
    // 🟢 ฟิลด์ใหม่ที่เพิ่มเข้ามา
    pdf_url: "", 
    OwnerTour: "",
    Code_Tour_owner: "",
    Link_Owner: "",

    // 🟢 เพิ่ม 2 ตัวแปรนี้ (เป็น Array)
    highlights: [] as string[],
    included_services: [] as string[],

  })

  // State สำหรับวันที่และราคาที่กำลังจะกดเพิ่ม (เหมือนเดิม)
  const [newDate, setNewDate] = useState<TourDate>({ 
    start_date: "", 
    end_date: "", 
    price: 0.00 
  })

  // 🟢 State สำหรับรับค่า Input ชั่วคราว (ก่อนกดปุ่มบวก)
  const [tempHighlight, setTempHighlight] = useState("")
  const [tempService, setTempService] = useState("")

  // --- ฟังก์ชันจัดการ Highlights ---
  const addHighlight = () => {
    if (!tempHighlight.trim()) return
    setTour(prev => ({ ...prev, highlights: [...prev.highlights, tempHighlight] }))
    setTempHighlight("") // ล้างช่องกรอก
  }

  const removeHighlight = (index: number) => {
    setTour(prev => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== index) }))
  }

  // --- ฟังก์ชันจัดการ Included Services ---
  const addService = () => {
    if (!tempService.trim()) return
    setTour(prev => ({ ...prev, included_services: [...prev.included_services, tempService] }))
    setTempService("") // ล้างช่องกรอก
  }

  const removeService = (index: number) => {
    setTour(prev => ({ ...prev, included_services: prev.included_services.filter((_, i) => i !== index) }))
  }

  // Helper: กด Enter เพื่อเพิ่มรายการได้เลย (ไม่ Submit Form)
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      action()
    }
  }

  // อัปเดตราคาของ newDate ให้เท่ากับราคาหลัก (Base Price) เมื่อมีการเปลี่ยนราคาหลัก
  useEffect(() => {
    if (newDate.price === 0) {
        setNewDate(prev => ({ ...prev, price: tour.price }))
    }
  }, [tour.price])


  // --- ฟังก์ชันจัดการวันที่และราคา (เหมือนเดิม) ---
  const handleAddDate = () => {
    if (newDate.start_date && newDate.end_date && newDate.price > 0) {
      if (new Date(newDate.end_date) < new Date(newDate.start_date)) {
        alert("วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น")
        return
      }

      setTour({
        ...tour,
        tour_dates: [...tour.tour_dates, newDate],
      })
      setNewDate({ ...newDate, start_date: "", end_date: "" }) 
    } else {
      alert("กรุณาระบุวันเริ่มต้น, วันสิ้นสุด และราคา")
    }
  }

  const handleRemoveDate = (indexToRemove: number) => {
    setTour({
      ...tour,
      tour_dates: tour.tour_dates.filter((_, index) => index !== indexToRemove),
    })
  }

  // --- ฟังก์ชัน Submit (เพิ่มการจัดการ Error และส่งฟิลด์ใหม่) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // 🟢 เลือกเฉพาะฟิลด์ที่ต้องการส่งไป (Exclude tour_dates)
    /*
      const basicTourData = {
          title: tour.title,
          description: tour.description,
          price: tour.price,
          duration_days: tour.duration_days, // Backend รับค่า duration (ต้องเช็คว่า Backend ใช้ duration หรือ duration_days)
          max_participants: tour.max_participants,
          
          // ❌ ของเดิม: location: tour.location, 
          // ✅ ต้องเปลี่ยนเป็น key ว่า destination ตาม Backend
          location: tour.location, 
          
          image_url: tour.image_url,

          // 🟢 เพิ่มฟิลด์ใหม่ที่ต้องการบันทึกไปด้วย
          pdf_url: tour.pdf_url,
          OwnerTour: tour.OwnerTour,
          Code_Tour_owner: tour.Code_Tour_owner,
          Link_Owner: tour.Link_Owner,
          is_active: true

          
      };
      */
      // ----------------------------------------------------

      // 🟢 แก้ตรงนี้: รวม tour_dates เข้าไปใน Object ที่จะส่ง
      const payload = {
            title: tour.title,
            description: tour.description,
            price: tour.price,
            duration_days: tour.duration_days,
            max_participants: tour.max_participants,
            location: tour.location,
            image_url: tour.image_url,
            pdf_url: tour.pdf_url,
            OwnerTour: tour.OwnerTour,
            Code_Tour_owner: tour.Code_Tour_owner,
            Link_Owner: tour.Link_Owner,
            is_active: true,

            // ✅ เพิ่มบรรทัดนี้ ส่ง array รอบวันที่ไปด้วย
            tour_dates: tour.tour_dates,

            // 🟢 เพิ่ม 2 บรรทัดนี้
            highlights: tour.highlights,
            included_services: tour.included_services
      };

    try {
      //console.log("🚀 ข้อมูลที่จะส่งไป API (Basic Data):", basicTourData)
      const response = await fetch("/api/tours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        //body: JSON.stringify(basicTourData), // 🟢 ข้อมูลทั้งหมดใน tour state ถูกส่งไป 
        body: JSON.stringify(payload), // 🟢 ข้อมูลทั้งหมดใน tour state ถูกส่งไป 
      })

      

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP Error: ${response.status} ${response.statusText}` }))
        const errorMessage = errorData.message || "ไม่สามารถบันทึกข้อมูลทัวร์ได้ กรุณาลองใหม่อีกครั้ง"
        throw new Error(errorMessage)
      }

      alert("✅ เพิ่มทัวร์สำเร็จ")
      router.push("/admin/tours")

    } catch (error) {
      console.error("Error creating tour:", error)
      if (error instanceof Error) {
          alert(`❌ เกิดข้อผิดพลาดในการเพิ่มทัวร์: ${error.message}`)
      } else {
          alert("❌ เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุในการเพิ่มทัวร์")
      }
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
            
            {/* --- ส่วนลิงก์รูปภาพ --- */}
            <div className="space-y-2">
              <Label htmlFor="image_url">ลิงก์รูปภาพ (Image URL)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                    <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="image_url" 
                        placeholder="https://example.com/image.jpg"
                        value={tour.image_url}
                        onChange={(e) => setTour({ ...tour, image_url: e.target.value })}
                        className="pl-9"
                    />
                </div>
              </div>
              
              {/* Preview รูปภาพ */}
              {tour.image_url && (
                <div className="mt-2 relative w-full max-w-md h-48 bg-slate-100 rounded-lg overflow-hidden border">
                    <img 
                        src={tour.image_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        Preview
                    </div>
                </div>
              )}
            </div>
            
            {/* --- ข้อมูลพื้นฐาน --- */}
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
            
            {/* 🟢 ส่วน Highlights */}
            <div className="space-y-3">
              <Label>จุดเด่นทัวร์ (Highlights)</Label>
              <div className="flex gap-2">
                <Input 
                  value={tempHighlight}
                  onChange={(e) => setTempHighlight(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, addHighlight)}
                  placeholder="พิมพ์จุดเด่น เช่น 'ชมพระอาทิตย์ขึ้นที่ดอย...'"
                />
                <Button type="button" onClick={addHighlight} variant="secondary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* รายการที่เพิ่มแล้ว */}
              <div className="space-y-2 mt-2">
                {tour.highlights.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{item}</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeHighlight(index)}>
                      <X className="h-4 w-4 text-slate-400 hover:text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* 🟢 ส่วน Included Services (บริการที่รวมในทัวร์) */}
            <div className="space-y-3">
              <Label>บริการที่รวมในทัวร์ (Included Services)</Label>
              <div className="flex gap-2">
                <Input 
                  value={tempService}
                  onChange={(e) => setTempService(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, addService)}
                  placeholder="เช่น 'รถรับส่ง', 'อาหารกลางวัน'"
                />
                <Button type="button" onClick={addService} variant="secondary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* รายการที่เพิ่มแล้ว */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {tour.included_services.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-blue-50/50 p-2 rounded border border-blue-100">
                     <span className="text-sm px-2">{item}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeService(index)}>
                      <X className="h-4 w-4 text-slate-400 hover:text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>  


            {/* 🟢 ส่วนเพิ่มฟิลด์ Owner/Code/Link */}
            <h3 className="text-lg font-semibold pt-4">ข้อมูลผู้ดำเนินการทัวร์</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="OwnerTour">ชื่อผู้ดำเนินการ (OwnerTour)</Label>
                    <Input
                        id="OwnerTour"
                        placeholder="เช่น บริษัท ABC ทัวร์"
                        value={tour.OwnerTour}
                        onChange={(e) => setTour({ ...tour, OwnerTour: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="Code_Tour_owner">รหัสผู้ดำเนินการ (Code_Tour_owner)</Label>
                    <Input
                        id="Code_Tour_owner"
                        placeholder="เช่น ABC-2024"
                        value={tour.Code_Tour_owner}
                        onChange={(e) => setTour({ ...tour, Code_Tour_owner: e.target.value })}
                    />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label htmlFor="Link_Owner">ลิงก์ผู้ดำเนินการ (Link_Owner)</Label>
                    <Input
                        id="Link_Owner"
                        placeholder="ลิงก์เว็บไซต์ของผู้ดำเนินการ"
                        value={tour.Link_Owner}
                        onChange={(e) => setTour({ ...tour, Link_Owner: e.target.value })}
                    />
                </div>
            </div>
            
            {/* 🟢 ส่วนเพิ่มฟิลด์ PDF URL */}
            <h3 className="text-lg font-semibold pt-4">ไฟล์รายละเอียดทัวร์</h3>
            <div className="space-y-2">
                <Label htmlFor="pdf_url">ลิงก์ไฟล์ PDF (pdf_url)</Label>
                <div className="relative">
                    <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="pdf_url"
                        placeholder="https://example.com/detail.pdf"
                        value={tour.pdf_url}
                        onChange={(e) => setTour({ ...tour, pdf_url: e.target.value })}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* --- ราคาและจำนวน (เหมือนเดิม) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">ราคาเริ่มต้น (บาท)</Label>
                <Input
                  id="price"
                  type="number"
                  value={tour.price}
                  onChange={(e) => setTour({ ...tour, price: Number(e.target.value) })}
                  required
                />
                <p className="text-xs text-muted-foreground">ราคานี้จะถูกใช้เป็นค่าเริ่มต้นสำหรับรอบวันที่</p>
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

            {/* --- ส่วนเพิ่มรอบวันที่และราคา (เหมือนเดิม) --- */}
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center space-x-2">
                 <Calendar className="h-5 w-5 text-muted-foreground"/>
                 <h3 className="font-medium">ตารางการเดินทาง & ราคา</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="start_date">วันไป</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newDate.start_date}
                    onChange={(e) => setNewDate({ ...newDate, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="end_date">วันกลับ</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newDate.end_date}
                    onChange={(e) => setNewDate({ ...newDate, end_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="round_price">ราคา (บาท)</Label>
                  <Input
                    id="round_price"
                    type="number"
                    placeholder="ระบุราคา"
                    value={newDate.price}
                    onChange={(e) => setNewDate({ ...newDate, price: Number(e.target.value) })}
                  />
                </div>
                <div className="md:col-span-1">
                    <Button type="button" onClick={handleAddDate} className="w-full">
                    <Plus className="h-4 w-4" /> 
                    </Button>
                </div>
              </div>

              {/* รายการวันที่ที่เพิ่มแล้ว */}
              {tour.tour_dates.length > 0 ? (
                <div className="mt-4">
                    <div className="rounded-md border bg-white dark:bg-slate-800 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 dark:bg-slate-700 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3">รอบที่</th>
                                    <th className="px-4 py-3">วันเดินทาง</th>
                                    <th className="px-4 py-3">ราคา</th>
                                    <th className="px-4 py-3 text-right">ลบ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {tour.tour_dates.map((date, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-3">{index + 1}</td>
                                    <td className="px-4 py-3">
                                        {new Date(date.start_date).toLocaleDateString('th-TH')} - {new Date(date.end_date).toLocaleDateString('th-TH')}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-green-600">
                                        ฿{date.price.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                                            onClick={() => handleRemoveDate(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
                    ยังไม่มีรอบการเดินทาง
                </p>
              )}
            </div>
            {/* ----------------------------------- */}

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={tour.is_active}
                onCheckedChange={(checked) => setTour({ ...tour, is_active: checked })}
              />
              <Label htmlFor="is_active">เปิดใช้งานทันที</Label>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
                {isSaving ? "กำลังบันทึก..." : "สร้างทัวร์"}
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