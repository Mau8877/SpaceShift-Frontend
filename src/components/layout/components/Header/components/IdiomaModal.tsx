import { useTranslation } from "react-i18next"
import { CheckmarkCircle01Icon } from "hugeicons-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Props {
  isOpen: boolean
  onClose: () => void
}

const idiomas = [
  {
    code: "es",
    label: "Español",
    flag: "https://flagcdn.com/w40/bo.png",
  },
  {
    code: "en",
    label: "English",
    flag: "https://flagcdn.com/w40/us.png",
  },
]

export function IdiomaModal({ isOpen, onClose }: Props) {
  const { i18n, t } = useTranslation()

  const cambiarIdioma = (code: string) => {
    i18n.changeLanguage(code)
    onClose() // Cerramos el modal después de elegir
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold text-slate-800">
            {i18n.language.includes("en")
              ? "Select Language"
              : "Selecciona tu idioma"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {idiomas.map((idioma) => {
            const activo = i18n.language.includes(idioma.code)

            return (
              <button
                key={idioma.code}
                onClick={() => cambiarIdioma(idioma.code)}
                className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                  activo
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50"
                } `}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={idioma.flag}
                    alt={idioma.label}
                    className="h-5 w-8 rounded object-cover shadow-sm"
                  />
                  <span
                    className={`font-semibold ${activo ? "text-primary" : "text-slate-700"}`}
                  >
                    {idioma.label}
                  </span>
                </div>

                {activo && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                    <CheckmarkCircle01Icon size={14} strokeWidth={3} />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
