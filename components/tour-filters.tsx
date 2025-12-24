"use client"
import { format } from "date-fns" // อย่าลืมลง date-fns: npm install date-fns
import { th } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input" // อย่าลืม import Input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, X } from "lucide-react" // ใช้ Icon เพื่อความสวยงาม (ถ้ามี)
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface FilterValues {
  query: string // เพิ่มค่าสำหรับ Text Search
  location: string
  duration_days: string
  date: Date | undefined // เพิ่มค่า Date
  
}

interface TourFiltersProps {
  onFilter: (filters: FilterValues) => void
}

export function TourFilters({ onFilter }: TourFiltersProps) {
  // State สำหรับเก็บค่าต่างๆ
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("all") // default เป็น all เพื่อให้จัดการง่าย
  const [duration_days, setDuration] = useState("all")
  const [date, setDate] = useState<Date | undefined>(undefined) // State สำหรับวันที่
  // ฟังก์ชันส่งค่า Filter กลับไปทำงานทันที (Real-time)
  // เราจะเรียกใช้ฟังก์ชันนี้ทุกครั้งที่มีการเปลี่ยนค่าใน input/select
  const triggerFilter = (newQuery: string, newLocation: string, newDuration: string ,newDate: Date | undefined) => {
    onFilter({
      query: newQuery,
      location: newLocation,
      duration_days: newDuration,
      date: newDate,
    })
  }

  // จัดการเมื่อพิมพ์ค้นหา
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    triggerFilter(newQuery, location, duration_days,date)
  }

  // จัดการเมื่อเลือกสถานที่
  const handleLocationChange = (value: string) => {
    setLocation(value)
    triggerFilter(query, value, duration_days,date)
  }

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    triggerFilter(query, location, duration_days, newDate)
  }
  // จัดการเมื่อเลือกระยะเวลา
  const handleDurationChange = (value: string) => {
    setDuration(value)
    triggerFilter(query, location, value, date)
  }

  // ปุ่ม Reset
  const handleReset = () => {
    setQuery("")
    setLocation("all")
    setDuration("all")
    setDate(undefined)
    triggerFilter("", "all", "all", undefined)
  }

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="p-4">
        {/* ใช้ Grid 12 คอลัมน์เพื่อความยืดหยุ่นในการจัดสัดส่วน */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          
          {/* 1. ช่องค้นหา (Text) - ให้พื้นที่เยอะหน่อย (4 ส่วน) */}
          <div className="md:col-span-4 space-y-2">
            <Label htmlFor="search">{"ค้นหา"}</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="ชื่อทัวร์, จุดหมาย..."
                value={query}
                onChange={handleQueryChange}
                className="pl-8" // เว้นที่ให้ icon
              />
            </div>
          </div>

          {/* 2. เลือกจุดหมาย (Select) - พื้นที่ปานกลาง (3 ส่วน) */}
          <div className="md:col-span-3 space-y-2">
            <Label htmlFor="location">{"ประเทศ"}</Label>
            <Select value={location} onValueChange={handleLocationChange}>
              <SelectTrigger>
                <SelectValue placeholder="ทุกประเทศ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{"ทั้งหมด"}</SelectItem>
                <SelectItem value="เกาหลี">{"ทัวร์เกาหลี"}</SelectItem>
                <SelectItem value="ญี่ปุ่น">{"ทัวร์ญี่ปุ่น"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 3. เลือกวันที่เดินทาง (NEW) */}
          <div className="md:col-span-3 space-y-2">
            <Label className="font-semibold text-gray-700">วันที่เดินทาง</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: th }) : <span>ระบุวันที่เดินทาง</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 3. เลือกระยะเวลา (Select) - พื้นที่ปานกลาง (3 ส่วน) */}
          <div className="md:col-span-3 space-y-2">
            <Label htmlFor="duration">{"ระยะเวลา"}</Label>
            <Select value={duration_days} onValueChange={handleDurationChange}>
              <SelectTrigger>
                <SelectValue placeholder="ทุกช่วงเวลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{"ทั้งหมด"}</SelectItem>
                <SelectItem value="1-1">{"1 วัน"}</SelectItem>
                <SelectItem value="2-2">{"2 วัน"}</SelectItem>
                <SelectItem value="3-3">{"3 วัน"}</SelectItem>
                <SelectItem value="4-4">{"4 วัน"}</SelectItem>
                <SelectItem value="5-5">{"5 วัน"}</SelectItem>
                <SelectItem value="6-6">{"6 วัน"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 4. ปุ่ม Reset - พื้นที่ที่เหลือ (2 ส่วน) */}
          <div className="md:col-span-2 flex">
            <Button 
              onClick={handleReset} 
              variant="outline" 
              className="w-full border-dashed text-muted-foreground hover:text-foreground"
            >
              <X className="mr-2 h-4 w-4" />
              {"ล้างค่า"}
            </Button>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
