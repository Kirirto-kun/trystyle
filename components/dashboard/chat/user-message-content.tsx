"use client"
import Image from "next/image"

interface UserMessageContentProps {
  content: string
}

export default function UserMessageContent({ content }: UserMessageContentProps) {
  // Parse content to extract uploaded images
  const parseContent = (text: string) => {
    const imageRegex = /\[Uploaded image: (https?:\/\/[^\]]+)\]/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = imageRegex.exec(text)) !== null) {
      // Add text before the image
      if (match.index > lastIndex) {
        const textPart = text.slice(lastIndex, match.index).trim()
        if (textPart) {
          parts.push({ type: 'text', content: textPart })
        }
      }

      // Add the image
      parts.push({ type: 'image', content: match[1] })
      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const textPart = text.slice(lastIndex).trim()
      if (textPart) {
        parts.push({ type: 'text', content: textPart })
      }
    }

    // If no images found, return original text
    if (parts.length === 0) {
      parts.push({ type: 'text', content: text })
    }

    return parts
  }

  const contentParts = parseContent(content)

  return (
    <div className="space-y-3">
      {contentParts.map((part, index) => {
        if (part.type === 'image') {
          return (
            <div key={index} className="relative">
              <img
                src={part.content}
                alt="Uploaded image"
                className="max-w-48 max-h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.jpg'
                }}
              />
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Фото
              </div>
            </div>
          )
        } else {
          return (
            <p key={index} className="text-sm md:text-base leading-relaxed">
              {part.content}
            </p>
          )
        }
      })}
    </div>
  )
}


