import React from "react"

interface SearchFieldProps {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const SearchField = ({ label, icon, children, className, onClick }: SearchFieldProps) => (
  <div
    onClick={onClick}
    className={`group flex min-w-0 flex-1 flex-col justify-center rounded-full px-2 py-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 sm:px-8 cursor-pointer ${className}`}
  >
    <label className="ml-1 text-[10px] font-bold tracking-tighter text-slate-500 uppercase sm:text-xs pointer-events-none">
      {label}
    </label>
    <div className="flex items-center gap-2">
      <div className="text-primary transition-transform group-hover:scale-110 shrink-0">
        {icon}
      </div>
      {children}
    </div>
  </div>
)
