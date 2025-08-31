import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface Tour {
  id: string
  title: string
  description: string
  price: number
  duration_days: number
  max_participants: number
  location: string
  highlights: string[]
  included_services: string[]
  image_url: string
}

interface TourDetailsProps {
  tour: Tour
}

export function TourDetails({ tour }: TourDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Hero Image */}
      <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden">
        <Image
          src={tour.image_url || `/placeholder.svg?height=400&width=800&query=${encodeURIComponent(tour.title)}`}
          alt={tour.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant="secondary" className="bg-white/90 text-foreground">
            {tour.duration_days} วัน
          </Badge>
          <Badge variant="secondary" className="bg-blue-600 text-white">
            {tour.location}
          </Badge>
        </div>
      </div>

      {/* Title and Description */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">{tour.title}</h1>
        <p className="text-lg text-muted-foreground text-pretty">{tour.description}</p>
      </div>

      {/* Tour Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{"จุดเด่นของทัวร์"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tour.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{highlight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{"บริการที่รวมอยู่"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tour.included_services.map((service, index) => (
                <li key={index} className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{service}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{"ข้อมูลเพิ่มเติม"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{tour.duration_days}</div>
              <div className="text-sm text-muted-foreground">วัน</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{tour.max_participants}</div>
              <div className="text-sm text-muted-foreground">คน สูงสุด</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">฿{tour.price.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">ต่อคน</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
