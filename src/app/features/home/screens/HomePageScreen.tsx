import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FiltrosTipoInmueble, InmueblesList, HomeSearchBar } from "../components"

export const HomePageScreen = () => {
  const { t } = useTranslation()
  const [filtro, setFiltro] = useState<string>("")

  // Mapeo de IDs a Títulos visuales
  const titulos: Record<string, string> = {
    venta: t("home.filter.venta"),
    alquiler: t("home.filter.alquiler"),
    anticretico: t("home.filter.anticretico"),
    alojamiento: t("home.filter.alojamiento"),
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/30">
      {/* Pasamos el estado y la función para cambiarlo */}
      <FiltrosTipoInmueble value={filtro} onFilterChange={setFiltro} />

      <HomeSearchBar />

      <div className="mx-auto mt-6 w-full max-w-screen-xl px-4">
        <h1 className="text-2xl font-bold text-slate-800 transition-all">
          {t("home.menu.title.inmuebles")} {filtro ? titulos[filtro] : ""}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {filtro
            ? t("home.description.cantidad", { type: titulos[filtro] })
            : t("home.description.default")}
        </p>

        {/* Mapeo de inmuebles delegado al nuevo subcomponente */}
        <InmueblesList filtro={filtro} />
      </div>
    </div>
  )
}

