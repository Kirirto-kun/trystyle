"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import AgentMessageRenderer from "./agent-message-renderer"

export default function ChatDemo() {
  // Sample data for testing - NEW EXTENDED FORMAT with more products
  const searchAgentResponse = JSON.stringify({
    result: {
      products: [
        {
          id: 1,
          name: "Uniqlo Black T-shirt",
          price: "1299 ₽",
          original_price: "1599 ₽",
          description: "Basic cotton t-shirt, ideal for everyday wear. Soft material and classic fit. Made from 100% organic cotton with moisture-wicking properties.",
          image_urls: [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop"
          ],
          store_name: "UNIQLO",
          store_city: "Москва",
          sizes: ["S", "M", "L", "XL", "XXL"],
          colors: ["черный", "белый", "серый"],
          in_stock: true,
          link: "/products/1"
        },
        {
          id: 2,
          name: "Nike Dri-FIT T-shirt",
          price: "$29.99",
          description: "Sports t-shirt with moisture-wicking technology. Great for workouts and active recreation. Features Nike's innovative Dri-FIT fabric.",
          image_urls: [
            "https://images.unsplash.com/photo-1503341960582-b45751874cf0?w=400&h=400&fit=crop"
          ],
          store_name: "Nike Store",
          store_city: "СПб",
          sizes: ["S", "M", "L"],
          colors: ["черный", "синий"],
          in_stock: true,
          link: "https://www.nike.com/products/example2"
        },
        {
          id: 3,
          name: "Zara Essentials T-shirt",
          price: "990 ₽",
          description: "Stylish t-shirt made of organic cotton. Modern silhouette and high-quality material. Perfect for casual wear and layering.",
          image_urls: [
            "https://images.unsplash.com/photo-1485145782098-4f5fd605a66b?w=400&h=400&fit=crop"
          ],
          store_name: "ZARA",
          store_city: "Москва",
          sizes: ["XS", "S", "M"],
          colors: ["белый"],
          in_stock: false,
          link: "/products/3"
        },
        {
          id: 4,
          name: "H&M Cotton Basic Tee",
          price: "799 ₽",
          original_price: "999 ₽",
          description: "Comfortable cotton t-shirt in classic cut. Available in multiple colors. Perfect basic item for any wardrobe.",
          image_urls: [
            "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=400&h=400&fit=crop"
          ],
          store_name: "H&M",
          store_city: "Казань",
          sizes: ["XS", "S", "M", "L"],
          colors: ["черный", "белый", "серый", "красный"],
          in_stock: true,
          link: "/products/4"
        },
        {
          id: 5,
          name: "Adidas Training Shirt",
          price: "2199 ₽",
          description: "Athletic training shirt with Climacool technology. Lightweight and breathable fabric for optimal performance.",
          image_urls: [
            "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop"
          ],
          store_name: "Adidas",
          store_city: "СПб",
          sizes: ["S", "M", "L", "XL"],
          colors: ["черный", "синий"],
          in_stock: true,
          link: "https://www.adidas.com/products/example5"
        },
        {
          id: 6,
          name: "Mango Slim Fit T-shirt",
          price: "1490 ₽",
          description: "Trendy slim fit t-shirt made from premium cotton blend. Modern design perfect for casual occasions.",
          image_urls: [
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop"
          ],
          store_name: "Mango",
          store_city: "Москва",
          sizes: ["S", "M", "L"],
          colors: ["белый", "серый"],
          in_stock: true,
          link: "/products/6"
        }
      ],
      search_query: "черная футболка",
      total_found: 24,
      agent_type: "search",
      processing_time_ms: 1245.6
    }
  })

  const outfitAgentResponse = JSON.stringify({
    result: {
      outfit_description: "Stylish casual look for a city walk",
      items: [
        {
          name: "White shirt",
          category: "Shirts",
          image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop"
        },
        {
          name: "Blue jeans",
          category: "Pants",
          image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop"
        },
        {
          name: "White sneakers",
          category: "Shoes",
          image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop"
        }
      ],
      reasoning: "These items go well together: white and blue is a classic combination, and white sneakers add modernity and comfort to the look. This outfit is suitable for both a business meeting and a casual walk."
    }
  })

  const generalAgentResponse = JSON.stringify({
    result: {
      response: "Fashion is a way of expressing yourself without words. It reflects our personality, mood, and culture. In the modern world, fashion has become more democratic and diverse, allowing everyone to find their unique style.\n\nBasic principles of good style:\n• Comfort and convenience\n• Appropriateness for the occasion\n• Quality of materials\n• Personal preferences\n• Ability to combine colors and textures\n\nRemember: the best outfit is the one in which you feel confident!"
    }
  })

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">TryStyle Chat - Demonstration</h1>
        <p className="text-muted-foreground">
          Examples of responses from all three system agents with compact mobile-optimized format
        </p>
      </div>

      <div className="space-y-8">
        {/* Search Agent Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🛍️ Search Agent - Product Search (COMPACT FORMAT)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Example query: "Find me a black t-shirt" → Now with compact cards, 3-column grid, mobile-optimized layout
            </p>
          </CardHeader>
          <CardContent>
            <AgentMessageRenderer content={searchAgentResponse} />
          </CardContent>
        </Card>

        <Separator />

        {/* Outfit Agent Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👗 Outfit Agent - Outfit Recommendations
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Example query: "What should I wear for a walk in the city?"
            </p>
          </CardHeader>
          <CardContent>
            <AgentMessageRenderer content={outfitAgentResponse} />
          </CardContent>
        </Card>

        <Separator />

        {/* General Agent Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💬 General Agent - General Questions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Example query: "Tell me about modern fashion"
            </p>
          </CardHeader>
          <CardContent>
            <AgentMessageRenderer content={generalAgentResponse} />
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-8">
        <Button asChild>
          <a href="/dashboard/chat">
            Go to the real chat
          </a>
        </Button>
      </div>
    </div>
  )
} 