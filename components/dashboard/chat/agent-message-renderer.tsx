"use client"
import ProductCard from "./product-card"
import OutfitDisplay from "./outfit-display"
import GeneralResponse from "./general-response"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, ShoppingBag, Shirt, MessageCircle } from "lucide-react"
import { 
  isSearchAgentResult, 
  isOutfitAgentResult, 
  isGeneralAgentResult,
  type AgentResponse
} from "@/lib/chat-types"

interface AgentMessageRendererProps {
  content: string
}

export default function AgentMessageRenderer({ content }: AgentMessageRendererProps) {
  try {
    const parsed: AgentResponse = JSON.parse(content)
    
    if (!parsed.result) {
      throw new Error("Invalid response format: missing 'result' field")
    }

    const result = parsed.result

    // Search Agent - Products
    if (isSearchAgentResult(result)) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShoppingBag className="w-4 h-4" />
            <span>Products found: {result.products.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.products.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        </div>
      )
    }

    // Outfit Agent - Outfit recommendations
    if (isOutfitAgentResult(result)) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shirt className="w-4 h-4" />
            <span>Outfit Recommendation</span>
          </div>
          <OutfitDisplay outfit={result} />
        </div>
      )
    }

    // General Agent - Text response
    if (isGeneralAgentResult(result)) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span>General Response</span>
          </div>
          <GeneralResponse result={result} />
        </div>
      )
    }

    // Unknown format
    throw new Error("Unknown response format")

  } catch (error) {
    console.error("Failed to parse agent response:", error)
    console.error("Content:", content)
    
    return (
      <Card className="w-full max-w-2xl border-destructive/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-sm text-destructive mb-2">
                Error processing response
              </h4>
              <p className="text-sm text-muted-foreground">
                Could not process the response from the agent. Try rephrasing your question.
              </p>
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer">
                  Error details
                </summary>
                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                  {content}
                </pre>
              </details>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
} 