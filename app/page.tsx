"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { TourCard } from "@/components/tour-card"
import { TourFilters } from "@/components/tour-filters"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

interface Tour {
  id: string
  title: string
  description: string
  location: string
  price: number
  duration: number
  image_url: string
  is_active: boolean
  created_at: string
  duration_days: number // เพิ่มตาม Type requirement
    max_participants: number // เพิ่มตาม Type requirement
    highlights: string[] // เพิ่มตาม Type requirement
    included_services: string[] // เพิ่มตาม Type requirement
    pdf_url: string // เพิ่มตาม Type requirement

}

interface FilterValues {
  location: string
  //priceRange: string
  duration: string
}

export default function HomePage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [filteredTours, setFilteredTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchTours()
  }, [])

  const fetchTours = async () => {
    try {
      const { data, error } = await supabase
        .from("tours")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) throw error

      setTours(data || [])
      setFilteredTours(data || [])
    } catch (err) {
      console.error("Error fetching tours:", err)
      setError("ไม่สามารถโหลดข้อมูลทัวร์ได้")
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = (filters: FilterValues) => {
    let filtered = [...tours]

    // กรองตามจุดหมาย
    if (filters.location && filters.location !== "all") {
      filtered = filtered.filter((tour) => tour.location.includes(filters.location))
    }

    // กรองตามช่วงราคา
    /*
    if (filters.priceRange && filters.priceRange !== "all") {
      const [min, max] = filters.priceRange.split("-").map(Number)
      if (max) {
        filtered = filtered.filter((tour) => tour.price >= min && tour.price <= max)
      } else {
        filtered = filtered.filter((tour) => tour.price >= min)
      }
    }
    */

    // กรองตามระยะเวลา
    if (filters.duration && filters.duration !== "all") {
      const [min, max] = filters.duration.split("-").map(Number)
      if (max) {
        filtered = filtered.filter((tour) => tour.duration >= min && tour.duration <= max)
      } else {
        filtered = filtered.filter((tour) => tour.duration >= min)
      }
    }

    setFilteredTours(filtered)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/Logo1.jpg" // <-- Next.js จะรู้เองว่าไฟล์นี้อยู่ใน /public
                alt="WebMTour Logo"
                width={140}
                height={40}
                className="object-contain"
              />
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                {"ระบบจัดการ"}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative text-white py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div> 
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">{"ค้นพบประสบการณ์การเดินทางที่ไม่เหมือนใคร"}</h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto text-pretty">
            {"เลือกแพ็คเกจทัวร์ที่ใช่สำหรับคุณ พร้อมบริการครบครันและประสบการณ์ที่น่าจดจำ"}
          </p>
        </div>
      </section>

      {/* Tours Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{"แพ็คเกจทัวร์ยอดนิยม"}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {"เลือกจากแพ็คเกจทัวร์หลากหลายที่เราคัดสรรมาเป็นพิเศษ"}
            </p>
          </div>

          <TourFilters onFilter={handleFilter} />

          {/* Tours Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <p className="text-lg text-muted-foreground">{"กำลังโหลด..."}</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-lg text-red-500">{error}</p>
              </div>
            ) : filteredTours && filteredTours.length > 0 ? (
              filteredTours.map((tour) => <TourCard key={tour.id} tour={tour} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-lg text-muted-foreground">{"ไม่พบแพ็คเกจทัวร์ที่ตรงกับเงื่อนไขการค้นหา"}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {"ลองเปลี่ยนเงื่อนไขการค้นหาหรือรันสคริปต์ฐานข้อมูลเพื่อเพิ่มข้อมูลตัวอย่าง"}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{"ทำไมต้องเลือกเรา"}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{"บริการมาตรฐานสูง"}</h3>
              <p className="text-muted-foreground">{"ทีมงานมืออาชีพพร้อมให้บริการตลอด 24 ชั่วโมง"}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{"ราคาคุ้มค่า"}</h3>
              <p className="text-muted-foreground">{"แพ็คเกจครบครันในราคาที่เหมาะสม"}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{"จุดหมายหลากหลาย"}</h3>
              <p className="text-muted-foreground">{"เลือกเที่ยวได้ทั่วประเทศไทยและต่างประเทศ"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{"จองทัวร์ออนไลน์"}</h3>
              <p className="text-gray-400 text-sm">{"ผู้ให้บริการทัวร์ออนไลน์ที่น่าเชื่อถือ พร้อมประสบการณ์การเดินทางที่ไม่เหมือนใคร"}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{"บริการ"}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>{"ทัวร์ในประเทศ"}</li>
                <li>{"ทัวร์ต่างประเทศ"}</li>
                <li>{"แพ็คเกจครอบครัว"}</li>
                <li>{"ทัวร์กลุ่ม"}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{"ช่วยเหลือ"}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>{"วิธีการจอง"}</li>
                <li>{"เงื่อนไขการใช้บริการ"}</li>
                <li>{"นโยบายความเป็นส่วนตัว"}</li>
                <li>{"ติดต่อเรา"}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{"ติดต่อ"}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>{"โทร: 02-xxx-xxxx"}</li>
                <li>{"อีเมล: info@example.com"}</li>
                <li>{"LINE: @tourexample"}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>{"© 2024 จองทัวร์ออนไลน์. สงวนลิขสิทธิ์."}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
