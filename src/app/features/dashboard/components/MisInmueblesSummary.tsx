type MisInmueblesSummaryProps = {
  total: number
  publicados: number
  disponibles: number
  ocupados: number
}

export const MisInmueblesSummary = ({
  total,
  publicados,
  disponibles,
  ocupados,
}: MisInmueblesSummaryProps) => {
  const items = [
    {
      label: "Total",
      value: total,
      helper: "Inmuebles registrados",
    },
    {
      label: "Publicados",
      value: publicados,
      helper: "Visibles actualmente",
    },
    {
      label: "Disponibles",
      value: disponibles,
      helper: "Listos para contrato",
    },
    {
      label: "Ocupados",
      value: ocupados,
      helper: "Con uso o contrato activo",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">{item.label}</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">{item.value}</p>
          <p className="mt-2 text-sm text-slate-500">{item.helper}</p>
        </article>
      ))}
    </div>
  )
}
