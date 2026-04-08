import * as React from "react"
import { cn } from "@/lib/utils"
import { type CarouselApi } from "@/components/ui/carousel"

interface PropertyCardPaginationProps {
  api?: CarouselApi
  current: number
  count: number
  className?: string
}

export function PropertyCardPagination({
  api,
  current,
  count,
  className
}: PropertyCardPaginationProps) {
  if (count <= 1) return null;

  return (
    <div className={cn("absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 z-10", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-1.5 cursor-pointer rounded-full transition-all duration-300",
            index === current 
              ? "w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" 
              : "w-1.5 bg-white/40 hover:bg-white/60"
          )}
          onClick={(e) => {
            e.preventDefault();
            api?.scrollTo(index);
          }}
        />
      ))}
    </div>
  )
}
