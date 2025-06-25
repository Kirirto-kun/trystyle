import React from 'react'

// Leaf SVG component
export const LeafSVG = ({ className = "", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
)

// Flower SVG component
export const FlowerSVG = ({ className = "", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M12 22a1 1 0 01-1-1v-3h2v3a1 1 0 01-1 1zM12 2a1 1 0 011 1v3h-2V3a1 1 0 011-1zM21 13h-3v-2h3a1 1 0 010 2zM6 13H3a1 1 0 010-2h3v2zM16.24 7.76a1 1 0 01-1.41-1.41l2.12-2.12a1 1 0 011.41 1.41l-2.12 2.12zM7.76 16.24a1 1 0 01-1.41 1.41l-2.12-2.12a1 1 0 011.41-1.41l2.12 2.12zM16.24 16.24l2.12 2.12a1 1 0 01-1.41 1.41l-2.12-2.12a1 1 0 011.41-1.41zM7.76 7.76L5.64 5.64a1 1 0 011.41-1.41l2.12 2.12a1 1 0 01-1.41 1.41z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

// Component with floating decorations
export const FloatingNatureElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Leaves */}
      <div className="absolute top-20 left-16 animate-float">
        <LeafSVG className="h-5 w-5 text-forest-500 opacity-60" />
      </div>
      <div className="absolute top-40 right-24 animate-leaf-dance" style={{ animationDelay: '0.8s' }}>
        <LeafSVG className="h-4 w-4 text-forest-400 opacity-40" />
      </div>
      <div className="absolute top-60 left-1/3 animate-float" style={{ animationDelay: '1.2s' }}>
        <LeafSVG className="h-6 w-6 text-forest-500 opacity-50" />
      </div>
      <div className="absolute bottom-40 right-20 animate-leaf-dance" style={{ animationDelay: '1.8s' }}>
        <FlowerSVG className="h-5 w-5 text-forest-400 opacity-60" />
      </div>
      <div className="absolute bottom-60 left-20 animate-float" style={{ animationDelay: '2.2s' }}>
        <LeafSVG className="h-4 w-4 text-forest-500 opacity-35" />
      </div>
      <div className="absolute top-1/3 right-1/4 animate-leaf-dance" style={{ animationDelay: '0.4s' }}>
        <FlowerSVG className="h-3 w-3 text-forest-600 opacity-50" />
      </div>
      
      {/* Circles and dots */}
      <div className="absolute top-32 right-1/3 w-2 h-2 bg-forest-500 rounded-full opacity-40 animate-pulse-gentle"></div>
      <div className="absolute bottom-48 left-1/4 w-3 h-3 bg-cream-300 rounded-full opacity-50 animate-pulse-gentle" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-12 w-1 h-1 bg-forest-400 rounded-full opacity-60 animate-pulse-gentle" style={{ animationDelay: '0.6s' }}></div>
      <div className="absolute bottom-32 right-12 w-2 h-2 bg-forest-300 rounded-full opacity-45 animate-pulse-gentle" style={{ animationDelay: '1.4s' }}></div>
    </div>
  )
}

// Component for large decorative elements
export const LargeNatureDecoration = ({ position = "top-right" }: { position?: "top-right" | "bottom-left" | "center" }) => {
  const positionClasses = {
    "top-right": "top-8 right-8",
    "bottom-left": "bottom-8 left-8", 
    "center": "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
  }

  return (
    <div className={`absolute ${positionClasses[position]} pointer-events-none`}>
      <div className="relative">
        <div className="absolute inset-0 bg-forest-200 rounded-full blur-3xl opacity-30 w-32 h-32 animate-pulse-gentle"></div>
        <div className="relative z-10 flex items-center justify-center w-24 h-24">
          <FlowerSVG className="h-16 w-16 text-forest-500 opacity-20 animate-gentle-bounce" />
        </div>
      </div>
    </div>
  )
}

// Component for a pattern of dots and leaves
export const NaturePattern = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <div className="absolute inset-0 opacity-10">
        <div className="dots-pattern w-full h-full"></div>
      </div>
      <div className="absolute inset-0 leaf-pattern opacity-5"></div>
    </div>
  )
} 