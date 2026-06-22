import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { PencilEdit01Icon, UserCircleIcon } from "hugeicons-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useAppSelector } from "@/app/store"
import { updatePerfilSchema } from "../schemas"
import {
  useGetMiPerfilQuery,
  useUpdatePerfilMutation,
  useUploadProfileImageMutation,
} from "../store"
import type { PerfilResponseDTO, UpdatePerfilRequestDTO } from "../types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  useGetMiSaldoQuery,
  useGetMiHistorialQuery,
  CreditBalanceCard,
  TransactionHistoryTable
} from "@/app/features/tokens"

type ProfileFormState = {
  nombre: string
  apellido: string
  correo: string
  tipoPerfil: string
  telefono: string
  descripcion: string
  estadoConexion: boolean
  fotoUrl: string
}

const EMPTY_FORM: ProfileFormState = {
  nombre: "",
  apellido: "",
  correo: "",
  tipoPerfil: "",
  telefono: "",
  descripcion: "",
  estadoConexion: false,
  fotoUrl: "",
}

const mapProfileToForm = (profile: PerfilResponseDTO): ProfileFormState => ({
  nombre: profile.nombre ?? "",
  apellido: profile.apellido ?? "",
  correo: profile.correo ?? "",
  tipoPerfil: profile.tipoPerfil ?? "",
  telefono: profile.telefono ?? "",
  descripcion: profile.descripcion ?? "",
  estadoConexion: Boolean(profile.estadoConexion),
  fotoUrl: profile.fotoUrl ?? "",
})

export function ProfileScreen() {
  const user = useAppSelector((state) => state.auth.user)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM)
  const [draft, setDraft] = useState<ProfileFormState>(EMPTY_FORM)
  const [photoPreview, setPhotoPreview] = useState("")
  const [draftPhotoPreview, setDraftPhotoPreview] = useState("")

  const {
    data: perfil,
    isLoading,
    isFetching,
    error,
  } = useGetMiPerfilQuery(undefined, {
    skip: !user?.id,
  })

  const [updatePerfil, { isLoading: isUpdating }] = useUpdatePerfilMutation()
  const [uploadProfileImage] = useUploadProfileImageMutation()

  useEffect(() => {
    if (!perfil) return
    const mapped = mapProfileToForm(perfil)
    setForm(mapped)
    setDraft(mapped)
    setPhotoPreview(mapped.fotoUrl)
    setDraftPhotoPreview(mapped.fotoUrl)
  }, [perfil])

  const isPristine = useMemo(() => {
    if (!perfil) return true
    const original = mapProfileToForm(perfil)
    return (
      draft.correo === original.correo &&
      draft.estadoConexion === original.estadoConexion &&
      draft.tipoPerfil === original.tipoPerfil &&
      draft.telefono === original.telefono &&
      draft.descripcion === original.descripcion &&
      draft.nombre === original.nombre &&
      draft.apellido === original.apellido &&
      draft.fotoUrl === original.fotoUrl
    )
  }, [draft, perfil])

  const fullName = [form.nombre, form.apellido].filter(Boolean).join(" ")

  const handleOpenEdit = () => {
    setDraft(form)
    setDraftPhotoPreview(form.fotoUrl)
    setIsEditOpen(true)
  }

  const handleCancelEdit = () => {
    setDraft(form)
    setDraftPhotoPreview(form.fotoUrl)
    setIsEditOpen(false)
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const localPreview = URL.createObjectURL(file)
    setDraftPhotoPreview(localPreview)
    setIsUploadingPhoto(true)

    try {
      const uploadedUrl = await uploadProfileImage(file).unwrap()
      setDraft((prev) => ({ ...prev, fotoUrl: uploadedUrl }))
      setDraftPhotoPreview(uploadedUrl)
      toast.success("Foto subida correctamente")
    } catch (error: any) {
      setDraftPhotoPreview(draft.fotoUrl || "")
      toast.error("No se pudo subir la foto", {
        description: error?.data?.message || "Intenta con otra imagen.",
      })
    } finally {
      setIsUploadingPhoto(false)
      URL.revokeObjectURL(localPreview)
      event.target.value = ""
    }
  }

  const buildPatchPayload = (): UpdatePerfilRequestDTO => {
    if (!perfil) return {}
    const original = mapProfileToForm(perfil)
    const payload: UpdatePerfilRequestDTO = {}

    if (draft.correo !== original.correo) payload.correo = draft.correo
    if (draft.estadoConexion !== original.estadoConexion) {
      payload.estadoConexion = draft.estadoConexion
    }
    if (draft.tipoPerfil !== original.tipoPerfil) payload.tipoPerfil = draft.tipoPerfil
    if (draft.telefono !== original.telefono) payload.telefono = draft.telefono.trim()
    if (draft.descripcion !== original.descripcion) {
      payload.descripcion = draft.descripcion.trim()
    }
    if (draft.nombre !== original.nombre) payload.nombre = draft.nombre
    if (draft.apellido !== original.apellido) payload.apellido = draft.apellido.trim()
    if (draft.fotoUrl !== original.fotoUrl) payload.fotoUrl = draft.fotoUrl.trim()

    return payload
  }

  const handleSave = async () => {
    if (!user?.id || !perfil) return

    const payload = buildPatchPayload()
    const parsed = updatePerfilSchema.safeParse(payload)
    if (!parsed.success) {
      toast.error("Revisa los datos del perfil", {
        description: parsed.error.issues[0]?.message,
      })
      return
    }

    if (Object.keys(payload).length === 0) {
      toast.info("No hay cambios para guardar")
      setIsEditOpen(false)
      return
    }

    try {
      const updated = await updatePerfil({ idUsuario: user.id, data: payload }).unwrap()
      const mapped = mapProfileToForm(updated)
      setForm(mapped)
      setDraft(mapped)
      setPhotoPreview(mapped.fotoUrl)
      setDraftPhotoPreview(mapped.fotoUrl)
      setIsEditOpen(false)
      toast.success("Perfil actualizado correctamente")
    } catch (err: any) {
      const status = err?.status
      const backendMessage = err?.data?.message

      if (status === 400) {
        toast.error("Datos inválidos", {
          description: backendMessage ?? "Correo duplicado o tipo de perfil inválido.",
        })
        return
      }
      if (status === 403) {
        toast.error("No tienes permiso para editar este perfil")
        return
      }
      if (status === 404) {
        toast.error("Perfil no encontrado")
        return
      }
      if (status === 401) {
        toast.error("Sesión inválida", {
          description: backendMessage ?? "Debes volver a iniciar sesión.",
        })
        return
      }

      toast.error("No se pudo actualizar el perfil", {
        description: backendMessage ?? "Intenta nuevamente en unos minutos.",
      })
    }
  }

  if (isLoading || isFetching) {
    return (
      <section className="mx-auto w-full max-w-3xl space-y-4">
        <div className="h-8 w-60 animate-pulse rounded bg-slate-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </section>
    )
  }

  if (error || !perfil) {
    return (
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-900">
          No pudimos cargar tu perfil
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Verifica tu sesión y vuelve a intentarlo.
        </p>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <Tabs defaultValue="perfil" className="w-full space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Configuración de Cuenta</h2>
            <p className="text-xs text-slate-500">Administra la información de tu perfil y monedero de tokens.</p>
          </div>
          <TabsList>
            <TabsTrigger value="perfil" className="px-4 py-1.5 text-xs">Mi Información</TabsTrigger>
            <TabsTrigger value="monedero" className="px-4 py-1.5 text-xs">Mi Monedero</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="perfil" className="space-y-6 mt-0">
          <Card className="relative overflow-hidden border-slate-200 p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50" />
            <div className="relative">
              <div className="absolute right-0 top-0">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={handleOpenEdit}
                  aria-label="Editar perfil"
                >
                  <PencilEdit01Icon className="size-4" />
                </Button>
              </div>

              <div className="mt-6 flex flex-col items-center gap-6 sm:mt-8 sm:flex-row sm:items-start">
                <Avatar className="h-28 w-28 border-4 border-white shadow-sm sm:h-32 sm:w-32">
                  <AvatarImage src={photoPreview || undefined} alt={fullName || "Perfil"} />
                  <AvatarFallback className="text-base">
                    <UserCircleIcon className="size-6 text-slate-500" />
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 grid-cols-1 gap-x-6 gap-y-3 text-center sm:grid-cols-2 sm:text-left">
                  <div className="sm:col-span-2">
                    <p className="text-xl font-semibold text-slate-950">
                      {fullName || "Usuario sin nombre"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Correo</p>
                    <p className="text-sm text-slate-800">{form.correo || "No disponible"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Rol</p>
                    <p className="text-sm text-slate-800">{form.tipoPerfil || "No disponible"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Estado</p>
                    <p className="text-sm text-slate-800">
                      {form.estadoConexion ? "Conectado" : "Desconectado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Teléfono
                    </p>
                    <p className="text-sm text-slate-800">{form.telefono || "No disponible"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Descripción
                    </p>
                    <p className="text-sm text-slate-800">{form.descripcion || "No disponible"}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="monedero" className="mt-0">
          <MonederoSection fullName={fullName} />
        </TabsContent>
      </Tabs>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => (!open ? handleCancelEdit() : setIsEditOpen(true))}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
            <DialogDescription>
              Actualiza tus datos y guarda los cambios cuando estés listo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border border-slate-200">
                <AvatarImage src={draftPhotoPreview || undefined} alt={draft.nombre} />
                <AvatarFallback>
                  {(draft.nombre?.[0] ?? "U").toUpperCase()}
                  {(draft.apellido?.[0] ?? "").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="w-full space-y-1.5">
                <Label htmlFor="profilePhoto">Imagen de perfil</Label>
                <Input
                  id="profilePhoto"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploadingPhoto}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={draft.nombre}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, nombre: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  value={draft.apellido}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, apellido: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="correo">Correo</Label>
                <Input
                  id="correo"
                  type="email"
                  value={draft.correo}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, correo: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tipoPerfil">Rol / tipo de usuario</Label>
                <Input
                  id="tipoPerfil"
                  value={draft.tipoPerfil}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, tipoPerfil: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={draft.telefono}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, telefono: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={draft.descripcion}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, descripcion: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Estado de conexión</p>
                <p className="text-xs text-slate-500">Visible como conectado.</p>
              </div>
              <Switch
                checked={draft.estadoConexion}
                onCheckedChange={(checked) =>
                  setDraft((prev) => ({ ...prev, estadoConexion: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUpdating || isUploadingPhoto || isPristine}
            >
              {isUpdating ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function MonederoSection({ fullName }: { fullName: string }) {
  const { data: saldoData, isLoading: isLoadingSaldo } = useGetMiSaldoQuery()
  const { data: historialData, isLoading: isLoadingHistorial } = useGetMiHistorialQuery()

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1 space-y-6">
        <CreditBalanceCard
          saldo={saldoData?.saldoCreditos ?? 0}
          fullName={fullName}
        />
        
        <Card className="p-5 border-slate-200/80 bg-slate-50/50 shadow-none">
          <h4 className="text-sm font-semibold text-slate-900 mb-2.5">
            ¿Cómo funcionan los créditos?
          </h4>
          <ul className="text-xs text-slate-600 space-y-2.5 list-disc pl-4">
            <li>
              <span className="font-semibold text-slate-800">Costo de Generación:</span> Cada segundo de video procesado consume <span className="font-semibold text-slate-800">2 créditos</span>.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Bono de Bienvenida:</span> Al registrarte por primera vez, recibes <span className="font-semibold text-slate-800">1,000 créditos gratis</span>.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Garantía SpaceShift:</span> Si el procesamiento de la IA llega a fallar por algún error de digitalización, tus créditos serán <span className="font-semibold text-slate-800">reembolsados de inmediato</span>.
            </li>
          </ul>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-slate-900">Historial de Tokens</h3>
          <p className="text-xs text-slate-500">Consulta los movimientos y consumos de tu saldo.</p>
        </div>
        <TransactionHistoryTable
          transactions={historialData ?? []}
          isLoading={isLoadingHistorial}
        />
      </div>
    </div>
  )
}

