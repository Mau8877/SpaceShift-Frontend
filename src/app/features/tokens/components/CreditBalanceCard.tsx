import { motion } from "framer-motion"
import { Coins01Icon, Wallet02Icon, ArrowRight01Icon } from "hugeicons-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface CreditBalanceCardProps {
  saldo: number
  fullName: string
}

export function CreditBalanceCard({ saldo, fullName }: CreditBalanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl shadow-indigo-950/20 border border-slate-800"
    >
      {/* Glow Effects */}
      <div className="absolute -right-16 -top-16 size-48 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute -left-16 -bottom-16 size-48 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative flex flex-col justify-between h-48">
        {/* Card Top */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Monedero Virtual
            </span>
            <h3 className="text-sm font-medium text-slate-200">SpaceShift Tokens</h3>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <Wallet02Icon className="size-5 text-indigo-400" />
          </div>
        </div>

        {/* Card Chip Illustration */}
        <div className="my-2 flex items-center gap-3">
          <div className="h-8 w-11 rounded-md bg-gradient-to-r from-amber-400 to-amber-200 opacity-80 relative overflow-hidden shadow-inner border border-amber-500/30">
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-amber-600/30" />
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-amber-600/30" />
          </div>
          <div className="h-6 w-[2px] bg-slate-700/50" />
          <Coins01Icon className="size-5 text-indigo-400 animate-pulse" />
        </div>

        {/* Card Bottom / Balance */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400">Saldo Disponible</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                {saldo.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-indigo-300">SST</span>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400 block mb-1">
              Propietario
            </span>
            <span className="text-sm font-semibold text-slate-100 block max-w-[180px] truncate">
              {fullName || "Cliente SpaceShift"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
