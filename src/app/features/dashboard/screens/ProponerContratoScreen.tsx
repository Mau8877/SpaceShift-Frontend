import * as React from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { useAppSelector } from "@/app/store"
import { useGetPublicacionesQuery } from "../../home/store/homeApi"
import { useGetMisPublicacionesQuery } from "../../publicaciones/store/publicacionApi"
import { useGetUsuariosQuery } from "../../admin/gestionar_usuarios/store/gestionarUsuariosApi"
import { useCrearContratoMutation } from "../store/contratoApi"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  Add01Icon, 
  Delete02Icon, 
  QuillWrite02Icon,
  ArrowLeft01Icon,
  AlertCircleIcon
} from "hugeicons-react"
import type { ContractType } from "../types/mis-contratos.types"

export function ProponerContratoScreen() {
  const navigate = useNavigate()
  const currentUser = useAppSelector((state) => state.auth.user)
  const isAdmin = currentUser?.rol === "ROLE_ADMIN"

  // Queries
  const { data: misPublicaciones = [], isLoading: isLoadingPubs } =
    useGetMisPublicacionesQuery()
  const { data: publicaciones = [], isLoading: isLoadingAllPubs } =
    useGetPublicacionesQuery(undefined, { skip: !isAdmin })
  const { data: usuariosData, isLoading: isLoadingUsers } = useGetUsuariosQuery({
    size: 100,
  })
  const [crearContrato, { isLoading: isCreating }] = useCrearContratoMutation()

  // Form States
  const [inmuebleId, setInmuebleId] = React.useState("")
  const [publicacionId, setPublicacionId] = React.useState("")
  const [idCliente, setIdCliente] = React.useState("")
  const [tipoContrato, setTipoContrato] = React.useState<ContractType>("ALQUILER")
  const [fechaInicio, setFechaInicio] = React.useState("")
  const [fechaFin, setFechaFin] = React.useState("")
  const [monto, setMonto] = React.useState<number>(0)
  const [moneda, setMoneda] = React.useState("Bs.")
  const [reglasContrato, setReglasContrato] = React.useState("")
  const [sancionesContrato, setSancionesContrato] = React.useState("")
  const [dispositivosContrato, setDispositivosContrato] = React.useState<any[]>([])

  // Especificaciones dinámicas
  const [specKey, setSpecKey] = React.useState("")
  const [specVal, setSpecVal] = React.useState("")
  const [specs, setSpecs] = React.useState<Record<string, string>>({
    garantia: "0",
    mascotasPermitidas: "No",
    serviciosIncluidos: "Luz, Agua",
  })

  // Filtros de inmuebles
  const availableProperties = React.useMemo(() => {
    const source = isAdmin ? publicaciones : misPublicaciones

    return source.filter((p: any) =>
      p.estadoPublicacion !== "ELIMINADO" &&
      p.inmueble?.estadoOperativo !== "ELIMINADO"
    )
  }, [isAdmin, misPublicaciones, publicaciones])

  const selectedProperty = React.useMemo(() => {
    if (!publicacionId) return null

    return availableProperties.find(
      (p: any) =>
        p.id?.toString().toLowerCase() === publicacionId.toLowerCase() ||
        p.inmueble?.id?.toString().toLowerCase() === publicacionId.toLowerCase()
    )
  }, [availableProperties, publicacionId])

  // Lista de clientes
  const clientsList = React.useMemo(() => {
    return usuariosData?.content || []
  }, [usuariosData])

  const handleAddSpec = () => {
    if (!specKey.trim() || !specVal.trim()) {
      toast.warning("Cláusula incompleta", {
        description: "Especifica tanto el nombre como el valor de la cláusula.",
      })
      return
    }
    setSpecs((prev) => ({ ...prev, [specKey.trim().toLowerCase()]: specVal.trim() }))
    setSpecKey("")
    setSpecVal("")
  }

  const handleRemoveSpec = (key: string) => {
    setSpecs((prev) => {
      const updated = { ...prev }
      delete updated[key]
      return updated
    })
  }

  const handleToggleContractDevice = (device: any) => {
    setDispositivosContrato((prev) => {
      const exists = prev.some((item) => item.id === device.id)

      if (exists) {
        return prev.filter((item) => item.id !== device.id)
      }

      return [
        ...prev,
        {
          id: device.id,
          nombre: device.nombre,
          configuracionTiempo: device.configuracionTiempo,
          horarioInicio: device.horarioInicio,
          horarioFin: device.horarioFin,
          descripcion: device.descripcion,
          precioContrato: 0,
          cantidad: 1,
          fechaInicioUso: fechaInicio,
          fechaFinUso: fechaFin,
          horaInicioUso: device.horarioInicio || "",
          horaFinUso: device.horarioFin || "",
          sancionIncumplimiento: device.sancionIncumplimiento,
        },
      ]
    })
  }

  const handleUpdateContractDevice = (id: string, key: string, value: any) => {
    setDispositivosContrato((prev) =>
      prev.map((device) => (device.id === id ? { ...device, [key]: value } : device))
    )
  }

  const handlePropertyChange = (selectedPubId: string) => {
    setPublicacionId(selectedPubId)
    setDispositivosContrato([])
    if (!selectedPubId) {
      setInmuebleId("")
      return
    }

    const selectedPub = availableProperties.find(
      (p: any) =>
        p.id?.toString().toLowerCase() === selectedPubId.toLowerCase() ||
        p.inmueble?.id?.toString().toLowerCase() === selectedPubId.toLowerCase()
    )

    if (selectedPub) {
      setInmuebleId(selectedPub.inmueble.id)
      
      // Auto-completar tipo de contrato normalizando a mayúsculas
      const transType = (selectedPub.tipoTransaccion || "").trim().toUpperCase()
      if (transType === "VENTA" || transType === "ALQUILER" || transType === "ANTICRETICO" || transType === "ALOJAMIENTO") {
        setTipoContrato(transType as ContractType)
      } else if (transType === "RESERVA_TEMPORAL" || transType === "AIRBNB") {
        setTipoContrato("ALOJAMIENTO")
      }
      
      // Auto-completar precio y moneda
      if (selectedPub.precio) {
        setMonto(selectedPub.precio)
      }
      if (selectedPub.moneda) {
        setMoneda(selectedPub.moneda)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inmuebleId || !publicacionId) {
      toast.error("Falta información", { description: "Selecciona un inmueble." })
      return
    }
    if (!idCliente) {
      toast.error("Falta información", { description: "Selecciona un cliente." })
      return
    }
    if (tipoContrato !== "VENTA" && !fechaInicio) {
      toast.error("Falta información", { description: "Selecciona la fecha de inicio." })
      return
    }
    if (monto <= 0) {
      toast.error("Monto inválido", { description: "El monto debe ser mayor a 0." })
      return
    }

    const invalidDeviceDates = dispositivosContrato.some((device) => {
      const startsBeforeContract = fechaInicio && device.fechaInicioUso && device.fechaInicioUso < fechaInicio
      const startsAfterContract = fechaFin && device.fechaInicioUso && device.fechaInicioUso > fechaFin
      const endsAfterContract = fechaFin && device.fechaFinUso && device.fechaFinUso > fechaFin
      const endsBeforeContract = fechaInicio && device.fechaFinUso && device.fechaFinUso < fechaInicio
      const endsBeforeDeviceStart = device.fechaInicioUso && device.fechaFinUso && device.fechaFinUso < device.fechaInicioUso

      return startsBeforeContract || startsAfterContract || endsAfterContract || endsBeforeContract || endsBeforeDeviceStart
    })

    if (invalidDeviceDates) {
      toast.error("Fechas de dispositivo inválidas", {
        description: "Las fechas de uso deben estar dentro de la vigencia del contrato.",
      })
      return
    }

    try {
      // Usar exactamente los nombres de atributos esperados por ContratoRequestDTO en el backend
      const payload = {
        idInmueble: inmuebleId,
        idPublicacion: publicacionId,
        idCliente,
        tipoContrato,
        fechaInicio: tipoContrato === "VENTA" ? undefined : fechaInicio,
        fechaFin: (tipoContrato === "VENTA" || !fechaFin) ? undefined : fechaFin,
        montoAcordado: monto,
        moneda,
        especificaciones: {
          ...specs,
          reglasContrato,
          sancionesContrato,
          dispositivosContrato,
        },
      }

      await crearContrato(payload).unwrap()
      toast.success("Propuesta de contrato creada", {
        description: "Se ha enviado la propuesta de firma al cliente.",
      })
      navigate({ to: "/dashboard/contratos" })
    } catch (error: any) {
      toast.error("Error al crear propuesta", {
        description: error?.data?.message || "Ocurrió un error inesperado.",
      })
    }
  }

  return (
    <section className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Botón Volver */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard/contratos">
          <Button variant="ghost" className="gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft01Icon className="h-5 w-5" />
            <span>Volver a Contratos</span>
          </Button>
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <QuillWrite02Icon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-950 font-heading">
              Redactar Propuesta de Contrato
            </h2>
            <p className="text-sm text-slate-500">
              Establece las especificaciones del acuerdo para la firma digital del cliente.
            </p>
          </div>
        </div>

        <Separator className="my-6 bg-slate-100" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seleccionar Inmueble */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Inmueble</label>
              {isLoadingPubs || (isAdmin && isLoadingAllPubs) ? (
                <div className="h-11 animate-pulse bg-slate-100 rounded-xl" />
              ) : (
                <select
                  value={publicacionId}
                  onChange={(e) => handlePropertyChange(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Selecciona propiedad --</option>
                  {availableProperties.map((p: any) => {
                    const optionVal = p.id || p.inmueble?.id
                    const tipoLabel = (p.tipoTransaccion || "").toLowerCase()
                    const tipoInmuebleLabel = (p.inmueble?.tipoInmueble || "").toLowerCase()
                    const ownerLabel = isAdmin && p.correoUsuario ? ` - ${p.correoUsuario}` : ""
                    return (
                      <option key={optionVal} value={optionVal}>
                        {p.titulo} ({tipoInmuebleLabel} - {tipoLabel}{ownerLabel})
                      </option>
                    )
                  })}
                </select>
              )}
            </div>

            {selectedProperty?.inmueble && (
              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Dispositivos disponibles del inmueble
                </h4>
                {selectedProperty.inmueble.dispositivos?.length > 0 && (
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      {selectedProperty.inmueble.dispositivos.map((device: any) => (
                        <div key={device.id || device.nombre} className="rounded-xl border border-slate-100 bg-white p-3 text-sm">
                          <label className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={dispositivosContrato.some((item) => item.id === device.id)}
                              onChange={() => handleToggleContractDevice(device)}
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="flex-1">
                              <span className="block font-bold text-slate-900">{device.nombre}</span>
                              <span className="block text-xs text-slate-500">{device.descripcion}</span>
                              {device.sancionIncumplimiento && (
                                <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                                  <AlertCircleIcon className="h-3.5 w-3.5 text-rose-500" />
                                  <span>Sanción: {device.sancionIncumplimiento}</span>
                                </span>
                              )}
                              <span className="mt-1 block text-xs font-semibold text-indigo-600">
                                Precio a definir en este contrato
                              </span>
                            </span>
                          </label>

                          {dispositivosContrato.some((item) => item.id === device.id) && (
                            <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 md:grid-cols-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Precio pactado</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={dispositivosContrato.find((item) => item.id === device.id)?.precioContrato || 0}
                                  onChange={(e) => handleUpdateContractDevice(device.id, "precioContrato", Number(e.target.value))}
                                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cantidad</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={dispositivosContrato.find((item) => item.id === device.id)?.cantidad || 1}
                                  onChange={(e) => handleUpdateContractDevice(device.id, "cantidad", Number(e.target.value))}
                                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Inicio uso</label>
                                <input
                                  type="date"
                                  min={fechaInicio || undefined}
                                  max={fechaFin || undefined}
                                  value={dispositivosContrato.find((item) => item.id === device.id)?.fechaInicioUso || ""}
                                  onChange={(e) => handleUpdateContractDevice(device.id, "fechaInicioUso", e.target.value)}
                                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fin uso</label>
                                <input
                                  type="date"
                                  min={fechaInicio || undefined}
                                  max={fechaFin || undefined}
                                  value={dispositivosContrato.find((item) => item.id === device.id)?.fechaFinUso || ""}
                                  onChange={(e) => handleUpdateContractDevice(device.id, "fechaFinUso", e.target.value)}
                                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hora inicio</label>
                                <input
                                  type="time"
                                  value={dispositivosContrato.find((item) => item.id === device.id)?.horaInicioUso || ""}
                                  onChange={(e) => handleUpdateContractDevice(device.id, "horaInicioUso", e.target.value)}
                                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hora fin</label>
                                <input
                                  type="time"
                                  value={dispositivosContrato.find((item) => item.id === device.id)?.horaFinUso || ""}
                                  onChange={(e) => handleUpdateContractDevice(device.id, "horaFinUso", e.target.value)}
                                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!selectedProperty.inmueble.dispositivos?.length && (
                  <p className="mt-2 rounded-xl border border-dashed border-slate-200 bg-white p-3 text-sm text-slate-500">
                    Este inmueble no tiene dispositivos registrados.
                  </p>
                )}
              </div>
            )}

            {/* Seleccionar Cliente */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Cliente (Usuario Registrado)</label>
              {isLoadingUsers ? (
                <div className="h-11 animate-pulse bg-slate-100 rounded-xl" />
              ) : (
                <select
                  value={idCliente}
                  onChange={(e) => setIdCliente(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Selecciona cliente --</option>
                  {clientsList.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.apellido} ({c.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tipo de Contrato */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Tipo de Contrato</label>
              <select
                value={tipoContrato}
                disabled={!!publicacionId}
                onChange={(e) => setTipoContrato(e.target.value as ContractType)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="ALQUILER">Alquiler</option>
                <option value="VENTA">Venta</option>
                <option value="ANTICRETICO">Anticrético</option>
                <option value="ALOJAMIENTO">Alojamiento (Airbnb/Temporal)</option>
              </select>
            </div>

            {/* Moneda */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Moneda</label>
              <select
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Bs.">Bolivianos (Bs.)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>

            {/* Monto de la Transacción */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {tipoContrato === "VENTA" ? "Monto Total de Venta" : "Monto Mensual / Alquiler"}
              </label>
              <input
                type="number"
                min="1"
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Margen espaciador para alinear con la cuadrícula */}
            <div className="hidden md:block"></div>

            {tipoContrato !== "VENTA" && (
              <>
                {/* Fecha Inicio */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Fecha Fin */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Fecha de Finalización</label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </>
            )}
          </div>

          <Separator className="my-6 bg-slate-100" />

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 font-heading">Reglas y Sanciones del Contrato</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Reglas / Condiciones</label>
                <textarea
                  rows={5}
                  value={reglasContrato}
                  onChange={(e) => setReglasContrato(e.target.value)}
                  placeholder="Ej: 1. Prohibido fumar dentro del inmueble.&#10;2. Horas de silencio de 22:00 a 08:00."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Sanciones</label>
                <textarea
                  rows={5}
                  value={sancionesContrato}
                  onChange={(e) => setSancionesContrato(e.target.value)}
                  placeholder="Ej: 1. Fumar: multa de 150 USD.&#10;2. Ruido en horas de silencio: corte de altavoz inteligente."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          <Separator className="my-6 bg-slate-100" />

          {/* Cláusulas / Especificaciones Adicionales */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 font-heading">Cláusulas del Contrato (Especificaciones)</h4>
            
            {/* Listar cláusulas actuales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {Object.entries(specs).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-600 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{val}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(key)}
                      className="p-1 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors"
                    >
                      <Delete02Icon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Inputs para nueva cláusula */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-slate-50/50 p-4 rounded-2xl border border-dashed border-slate-200">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nombre Cláusula</label>
                <input
                  type="text"
                  placeholder="Ej: garantia, mascotas"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Valor Cláusula</label>
                <input
                  type="text"
                  placeholder="Ej: 3000, Permitidas"
                  value={specVal}
                  onChange={(e) => setSpecVal(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddSpec}
                className="w-full h-9.5 gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-lg"
              >
                <Add01Icon className="h-4 w-4" />
                Agregar Cláusula
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Link to="/dashboard/contratos">
              <Button type="button" variant="outline" className="rounded-xl font-bold px-6 h-11">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isCreating} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 h-11">
              {isCreating ? "Creando propuesta..." : "Enviar Propuesta"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
