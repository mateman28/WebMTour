import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
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

interface TourCardProps {
  tour: Tour
}

export function TourCard({ tour }: TourCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={tour.image_url || `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(tour.title)}`}
            alt={tour.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-white/90 text-foreground">
              {tour.duration_days} วัน
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-blue-600 text-white">
              {tour.location}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-balance">{tour.title}</h3>
        <p className="text-muted-foreground mb-4 text-pretty line-clamp-2">{tour.description}</p>

        {/* Highlights */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">{"จุดเด่น:"}</h4>
          <div className="flex flex-wrap gap-1">
            {tour.highlights.slice(0, 3).map((highlight, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {highlight}
              </Badge>
            ))}
            {tour.highlights.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tour.highlights.length - 3} อื่นๆ
              </Badge>
            )}
          </div>
        </div>

        {/* Price and Participants */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-2xl font-bold text-blue-600">฿{tour.price.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground ml-1">/ คน</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {"สูงสุด"} {tour.max_participants} {"คน"}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link href={`/tours/${tour.id}`} className="w-full">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">{"ดูรายละเอียดและจอง"}</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
