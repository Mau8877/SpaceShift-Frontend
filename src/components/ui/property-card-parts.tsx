import * as React from "react"
import { cn } from "@/lib/utils"
import { ArrowRight01Icon } from "hugeicons-react"

const PropertyCardRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group relative flex flex-col overflow-hidden rounded-[36px] bg-card text-card-foreground shadow-xl border border-slate-200/60 dark:border-slate-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(28,28,130,0.3)] active:scale-[0.98]",
      className
    )}
    {...props}
  />
))
PropertyCardRoot.displayName = "PropertyCardRoot"

const PropertyCardThumbnail = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { src?: string; alt?: string }
>(({ className, src, alt, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative aspect-[3/4] w-full overflow-hidden", className)}
    {...props}
  >
    {src && (
      <img
        src={src}
        alt={alt || "Property thumbnail"}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
    )}
    {/* Top Gradient for Badges and Actions legibility */}
    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-0" />

    {/* Dark Overlay Gradient (Bottom) */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/100 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none z-0" />

    <div className="relative z-10 h-full w-full">
      {children}
    </div>
  </div>
))
PropertyCardThumbnail.displayName = "PropertyCardThumbnail"

const PropertyCardBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "navy" | "gold" }
>(({ className, variant = "navy", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm",
      variant === "navy" && "bg-primary text-white shadow-md",
      variant === "gold" && "bg-accent text-primary-foreground shadow-md font-black",
      className
    )}
    {...props}
  />
))
PropertyCardBadge.displayName = "PropertyCardBadge"

const PropertyCardAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: React.ElementType }
>(({ className, icon: Icon, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition-all duration-300 hover:bg-black/60 hover:scale-110 active:scale-95",
      className
    )}
    {...props}
  >
    <Icon size={16} strokeWidth={2} />
  </button>
))
PropertyCardAction.displayName = "PropertyCardAction"

const PropertyCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    location?: string;
    title: string;
    price: string;
    locationIcon?: React.ElementType
  }
>(({ className, location, title, price, locationIcon: LocationIcon, ...props }, ref) => (
  <div
    ref={ref}
    //
    className={cn("absolute bottom-[100px] left-5 w-full px-6 text-white z-20 pointer-events-none ", className)}
    {...props}
  >
    {location && (
      //
      <div className="mb-1 flex items-center gap-1.5 opacity-90">
        {LocationIcon && <LocationIcon size={14} className="text-accent" />}
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{location}</span>
      </div>
    )}
    <h3 className="mb-0.5 line-clamp-1 text-xl font-bold tracking-tight md:text-2xl">{title}</h3>
    <div className="flex items-baseline gap-1">
      <span className="text-[10px] font-medium uppercase tracking-widest opacity-70">DESDE</span>
      <span className="text-2xl font-black md:text-3xl tracking-tighter text-white drop-shadow-sm">{price}</span>
    </div>
  </div>
))
PropertyCardContent.displayName = "PropertyCardContent"

const PropertyCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("absolute bottom-10 left-0 w-full px-6 z-20", className)}
    {...props}
  />
))
PropertyCardFooter.displayName = "PropertyCardFooter"

const PropertyCardButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "group/btn flex h-[46px] w-full relative z-20 items-center justify-between rounded-full bg-[#161668] pl-6 pr-1.5 py-1.5 text-[12px] font-bold uppercase tracking-widest text-white shadow-[0_4px_14px_0_rgba(28,28,130,0.39)] transition-all duration-300 hover:bg-[#1C1C82] hover:shadow-[0_6px_20px_rgba(28,28,130,0.5)] hover:scale-[1.02] active:scale-[0.98]",
      className
    )}
    {...props}
  >
    <span>{children}</span>
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover/btn:translate-x-1">
      <ArrowRight01Icon size={16} strokeWidth={2.5} />
    </div>
  </button>
))
PropertyCardButton.displayName = "PropertyCardButton"

export {
  PropertyCardRoot,
  PropertyCardThumbnail,
  PropertyCardBadge,
  PropertyCardAction,
  PropertyCardContent,
  PropertyCardFooter,
  PropertyCardButton,
}
