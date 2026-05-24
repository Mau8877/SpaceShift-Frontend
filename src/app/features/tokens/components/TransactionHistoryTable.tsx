import { motion } from "framer-motion"
import { GiftIcon, RefreshIcon, PlayIcon, Coins01Icon } from "hugeicons-react"
import type { TransaccionCreditoDTO, TipoTransaccion } from "../types/token.types"

interface TransactionHistoryTableProps {
  transactions: TransaccionCreditoDTO[]
  isLoading: boolean
}

const getTransactionStyles = (tipo: TipoTransaccion) => {
  switch (tipo) {
    case "REGISTRO_INICIAL":
      return {
        label: "Bono de Registro",
        icon: GiftIcon,
        bgColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
        badgeColor: "text-emerald-600 bg-emerald-500/10",
        prefix: "+",
        amountColor: "text-emerald-600 font-bold",
      }
    case "CONSUMO_PROCESAMIENTO":
      return {
        label: "Consumo de IA",
        icon: PlayIcon,
        bgColor: "bg-rose-50 text-rose-700 border-rose-100",
        badgeColor: "text-rose-600 bg-rose-500/10",
        prefix: "-",
        amountColor: "text-rose-600 font-bold",
      }
    case "REEMBOLSO":
      return {
        label: "Reembolso",
        icon: RefreshIcon,
        bgColor: "bg-blue-50 text-blue-700 border-blue-100",
        badgeColor: "text-blue-600 bg-blue-500/10",
        prefix: "+",
        amountColor: "text-blue-600 font-bold",
      }
    default:
      return {
        label: "Transacción",
        icon: Coins01Icon,
        bgColor: "bg-slate-50 text-slate-700 border-slate-100",
        badgeColor: "text-slate-600 bg-slate-500/10",
        prefix: "",
        amountColor: "text-slate-600 font-bold",
      }
  }
}

export function TransactionHistoryTable({ transactions, isLoading }: TransactionHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white animate-pulse">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-slate-100" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded bg-slate-100" />
                <div className="h-3 w-20 rounded bg-slate-100" />
              </div>
            </div>
            <div className="h-4 w-12 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
        <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-3">
          <Coins01Icon className="size-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-900">Sin transacciones</h4>
        <p className="mt-1 text-xs text-slate-500 max-w-[240px]">
          Tu historial de tokens se mostrará aquí cuando realices operaciones de procesamiento.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">Operación</th>
              <th className="px-6 py-4">Detalle</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4 text-right">Cantidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx, idx) => {
              const styles = getTransactionStyles(tx.tipo)
              const Icon = styles.icon
              const formattedDate = new Date(tx.createdDate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })

              return (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  key={tx.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex size-9 items-center justify-center rounded-lg border ${styles.bgColor}`}>
                        <Icon className="size-4" />
                      </div>
                      <span className="font-semibold text-slate-900">{styles.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-600 max-w-xs truncate">{tx.descripcion || "Sin descripción"}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                    {formattedDate}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <span className={styles.amountColor}>
                      {styles.prefix}
                      {tx.cantidad.toLocaleString()} SST
                    </span>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
