"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import AgentMessageRenderer from "./agent-message-renderer"

export default function ChatDemo() {
  // Sample data for testing - Search agent now without products, only outfits or description
  const searchAgentResponse = JSON.stringify({
    result: {
      search_description: "Я проанализировал ваш запрос и нашёл несколько образов, которые подойдут к черной футболке.",
      suggested_outfits: [
        {
          outfit_description: "Кэжуал образ с черной футболкой",
          items: [
            {
              id: 101,
              name: "Черные джинсы slim fit",
              image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop",
              link: "/products/101",
              price: "3490 ₽"
            },
            {
              id: 102,
              name: "Белые кеды",
              image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
              link: "/products/102",
              price: "4990 ₽"
            }
          ]
        }
      ],
      agent_type: "search"
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