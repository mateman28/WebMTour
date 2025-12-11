"use client"

import React, { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

// ใช้ Interface เดียวกับที่คุณนิยามไว้
interface Tour {
  id: string
  title: string
  location: string
  price: number
  image_url: string
  duration_days: number
}

interface HeroCarouselProps {
  tours: Tour[]
}

export function HeroCarousel({ tours }: HeroCarouselProps) {
  // ตั้งค่า Autoplay ให้เลื่อนทุก 10 วินาที
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 10000, stopOnInteraction: false })
  ])

  // ถ้าไม่มีทัวร์ หรือกำลังโหลด ให้แสดงภาพ default ไปก่อน
  if (!tours || tours.length === 0) {
    return (
      <div className="relative w-full h-[500px] bg-gray-200 flex items-center justify-center">
         <p className="text-gray-500">กำลังโหลดโปรแกรมทัวร์แนะนำ...</p>
      </div>
    )
  }

  // เลือกมาโชว์แค่ 5 อันดับแรก (เพื่อ performance)
  const featuredTours = tours.slice(0, 5)

  return (
    <div className="relative w-full overflow-hidden bg-black" ref={emblaRef}>
      <div className="flex h-[500px] md:h-[600px]">
        {featuredTours.map((tour) => (
          <div className="relative flex-[0_0_100%] min-w-0" key={tour.id}>
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={tour.image_url || "/hero-bg.jpg"} // Fallback image
                alt={tour.title}
                fill
                className="object-cover opacity-60"
                priority // โหลดรูปนี้ก่อนเสมอเพื่อ LCP ที่ดี
              />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-10">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-600/80 text-white text-sm mb-4 backdrop-blur-sm">
                {tour.location} • {tour.duration_days} วัน
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-md max-w-4xl">
                {tour.title}
              </h1>
              <p className="text-xl text-white/90 mb-8 font-medium drop-shadow-md">
                ราคาเริ่มต้น {tour.price.toLocaleString()} บาท
              </p>
              <div className="flex gap-4">
                 <Link href={`/tours/${tour.id}`}>
                    <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                      ดูรายละเอียด
                    </Button>
                 </Link>
                 <a 
                    href="https://www.facebook.com/p/NP-Travel-%E0%B9%80%E0%B8%AD%E0%B9%87%E0%B8%99%E0%B8%9E%E0%B8%B5%E0%B8%97%E0%B8%A3%E0%B8%B2%E0%B9%80%E0%B8%A7%E0%B8%A5-100043116431945/"
                    target="_blank"
                    rel="noopener noreferrer"
                 >
                    <Button size="lg" variant="outline" className="text-white border-white bg-transparent hover:bg-white/20">
                      ติดต่อเรา
                    </Button>
                 </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}