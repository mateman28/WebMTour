"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

interface FilterValues {
  location: string
  //priceRange: string
  duration: string
}

interface TourFiltersProps {
  onFilter: (filters: FilterValues) => void
}

export function TourFilters({ onFilter }: TourFiltersProps) {
  const [location, setLocation] = useState("")
  //const [priceRange, setPriceRange] = useState("")
  const [duration, setDuration] = useState("")

  const handleSearch = () => {
    onFilter({
      location,
      //priceRange,
      duration,
    })
  }

  const handleReset = () => {
    setLocation("")
    //setPriceRange("")
    setDuration("")
    onFilter({
      location: "",
      //priceRange: "",
      duration: "",
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="location">{"จุดหมาย"}</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกจุดหมาย" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{"ทั้งหมด"}</SelectItem>
                <SelectItem value="เชียงใหม่">{"เชียงใหม่"}</SelectItem>
                <SelectItem value="ภูเก็ต">{"ภูเก็ต"}</SelectItem>
                <SelectItem value="กรุงเทพมหานคร">{"กรุงเทพมหานคร"}</SelectItem>
                <SelectItem value="เชียงราย">{"เชียงราย"}</SelectItem>
                <SelectItem value="ญี่ปุ่น">{"ทัวร์ญี่ปุ่น"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/*
          <div className="space-y-2">
            <Label htmlFor="price-range">{"ช่วงราคา"}</Label>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกช่วงราคา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{"ทั้งหมด"}</SelectItem>
                <SelectItem value="0-5000">{"ต่ำกว่า 5,000 บาท"}</SelectItem>
                <SelectItem value="5000-10000">{"5,000 - 10,000 บาท"}</SelectItem>
                <SelectItem value="10000-15000">{"10,000 - 15,000 บาท"}</SelectItem>
                <SelectItem value="15000">{"มากกว่า 15,000 บาท"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        */}

          <div className="space-y-2">
            <Label htmlFor="duration">{"ระยะเวลา"}</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกระยะเวลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{"ทั้งหมด"}</SelectItem>
                <SelectItem value="1-2">{"1-2 วัน"}</SelectItem>
                <SelectItem value="3-4">{"3-4 วัน"}</SelectItem>
                <SelectItem value="5-7">{"5-7 วัน"}</SelectItem>
                <SelectItem value="7">{"มากกว่า 7 วัน"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
            {"ค้นหา"}
          </Button>

          <Button onClick={handleReset} variant="outline">
            {"รีเซ็ต"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
