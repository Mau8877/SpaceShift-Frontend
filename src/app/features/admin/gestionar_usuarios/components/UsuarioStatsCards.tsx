import type { UsuarioStats } from "../types"

type UsuarioStatsCardsProps = {
  stats: UsuarioStats
}

export const UsuarioStatsCards = ({ stats }: UsuarioStatsCardsProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Total usuarios</p>
        <p className="mt-3 text-2xl font-bold text-slate-950">{stats.totalUsuarios}</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Usuarios activos</p>
        <p className="mt-3 text-2xl font-bold text-slate-950">{stats.usuariosActivos}</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Usuarios inactivos</p>
        <p className="mt-3 text-2xl font-bold text-slate-950">{stats.usuariosInactivos}</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Total publicaciones</p>
        <p className="mt-3 text-2xl font-bold text-slate-950">{stats.totalPublicaciones}</p>
      </article>
    </div>
  )
}
