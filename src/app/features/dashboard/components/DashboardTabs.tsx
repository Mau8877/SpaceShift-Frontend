import { Link, useNavigate, useRouterState } from "@tanstack/react-router"

type DashboardAction = {
  label: string
  path: string
}

type DashboardTab = {
  label: string
  title: string
  description: string
  path: string
  end?: boolean
  action?: DashboardAction
}

const dashboardTabs: DashboardTab[] = [
  {
    label: "Dashboard",
    title: "Dashboard",
    description:
      "Visualiza el resumen general de tus inmuebles, contratos y actividad reciente.",
    path: "/dashboard",
    end: true,
  },
  {
    label: "Mis Inmuebles",
    title: "Mis Inmuebles",
    description:
      "Administra las propiedades que tienes registradas dentro de SpaceShift.",
    path: "/dashboard/inmuebles",
    action: {
      label: "+ Nuevo inmueble",
      path: "/publicar",
    },
  },
  {
    label: "Mis Clientes",
    title: "Mis Clientes",
    description:
      "Consulta las personas relacionadas con tus contratos, alquileres, ventas o reservas.",
    path: "/dashboard/clientes",
  },
  {
    label: "Mis Contratos",
    title: "Mis Contratos",
    description:
      "Revisa y gestiona contratos de venta, alquiler, anticretico o reservas temporales.",
    path: "/dashboard/contratos",
    action: {
      label: "+ Nuevo contrato",
      path: "/leases",
    },
  },
]

const getCurrentDashboardTab = (pathname: string) => {
  return (
    dashboardTabs.find((tab) => {
      if (tab.end) {
        return pathname === tab.path
      }

      return pathname.startsWith(tab.path)
    }) ?? dashboardTabs[0]
  )
}

export const DashboardTabs = () => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const navigate = useNavigate()
  const currentTab = getCurrentDashboardTab(pathname)

  return (
    <header className="relative z-10">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">Panel de usuario</p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {currentTab.title}
          </h1>

          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            {currentTab.description}
          </p>
        </div>

        {currentTab.action ? (
          <button
            type="button"
            onClick={() => navigate({ to: currentTab.action?.path })}
            className="inline-flex w-fit items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
          >
            {currentTab.action.label}
          </button>
        ) : null}
      </div>

      <div className="hidden md:block">
        <nav className="flex items-end gap-2 border-b border-slate-200">
          {dashboardTabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              activeOptions={{ exact: Boolean(tab.end) }}
              className="relative rounded-t-lg border border-slate-200 border-b-transparent bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              activeProps={{
                className:
                  "z-20 -mb-px rounded-t-lg border border-slate-200 border-b-white bg-white px-3 py-2 text-sm font-semibold text-slate-950 shadow-[0_-1px_0_rgba(255,255,255,1)]",
              }}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="md:hidden">
        <label
          htmlFor="dashboard-tab"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Sección
        </label>

        <select
          id="dashboard-tab"
          value={currentTab.path}
          onChange={(event) => navigate({ to: event.target.value })}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-xs transition outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
        >
          {dashboardTabs.map((tab) => (
            <option key={tab.path} value={tab.path}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  )
}
