import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Image from "next/image"
import type { WaitListItemResponse } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"

interface WaitlistItemCardProps {
  item: WaitListItemResponse
}

export default function WaitlistItemCard({ item }: WaitlistItemCardProps) {
  const placeholderImg = `/placeholder.svg?width=300&height=200&query=${encodeURIComponent(item.status || "fashion idea")}`

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      return "Invalid Date"
    }
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardHeader className="p-0 relative aspect-video">
        <Image
          src={item.image_url || placeholderImg}
          alt={`Waitlist item - ${item.status}`}
          layout="fill"
          objectFit="cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = placeholderImg
          }}
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        {item.status && (
          <Badge variant={item.status === "pending" ? "default" : "secondary"} className="mb-2">
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
        )}
        <div className="text-xs text-muted-foreground flex items-center">
          <CalendarDays size={14} className="mr-1" />
          Added: {formatDate(item.created_at)}
        </div>
      </CardContent>
      {/* <CardFooter className="p-4 pt-0">
        <Button variant="outline" size="sm" className="w-full">View Details</Button>
      </CardFooter> */}
    </Card>
  )
}
