import { Loading01Icon } from "hugeicons-react"

type DataTableLoaderProps = {
  label?: string
}

export const DataTableLoader = ({
  label = "Cargando...",
}: DataTableLoaderProps) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <Loading01Icon className="animate-spin text-slate-950" size={38} />

        <p className="animate-pulse text-sm font-bold tracking-widest text-slate-700 uppercase">
          {label}
        </p>
      </div>
    </div>
  )
}
