import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import {
  createUsuarioSchema,
  updateUsuarioSchema,
} from "../schemas"
import {
  useCreateUsuarioMutation,
  useGetUsuarioByIdQuery,
  useUpdateUsuarioMutation,
} from "../store"
import type { UsuarioListItem, UsuarioPatchRequest, UsuarioRequest } from "../types"

type UsuarioFormDialogProps = {
  open: boolean
  mode: "create" | "edit"
  user?: UsuarioListItem | null
  onOpenChange: (open: boolean) => void
}

type UsuarioFormState = {
  correo: string
  password: string
  rol: string
  tipoPerfil: string
  nombre: string
  apellido: string
  telefono: string
  descripcion: string
}

const EMPTY_FORM: UsuarioFormState = {
  correo: "",
  password: "",
  rol: "ROLE_USER",
  tipoPerfil: "PERSONAL",
  nombre: "",
  apellido: "",
  telefono: "",
  descripcion: "",
}

export const UsuarioFormDialog = ({
  open,
  mode,
  user,
  onOpenChange,
}: UsuarioFormDialogProps) => {
  const [form, setForm] = useState<UsuarioFormState>(EMPTY_FORM)
  const [createUsuario, { isLoading: isCreating }] = useCreateUsuarioMutation()
  const [updateUsuario, { isLoading: isUpdating }] = useUpdateUsuarioMutation()
  const { data: userDetail } = useGetUsuarioByIdQuery(user?.id ?? "", {
    skip: !open || mode !== "edit" || !user?.id,
  })

  const isPending = isCreating || isUpdating

  useEffect(() => {
    if (!open) {
      return
    }

    if (mode === "edit" && user) {
      setForm({
        correo: user.correo ?? "",
        password: "",
        rol: user.rol ?? "ROLE_USER",
        tipoPerfil: user.tipoPerfil ?? "PERSONAL",
        nombre: user.nombre ?? "",
        apellido: user.apellido ?? "",
        telefono: user.telefono ?? "",
        descripcion: "",
      })
      return
    }

    setForm(EMPTY_FORM)
  }, [mode, open, user])

  useEffect(() => {
    if (!open || mode !== "edit" || !userDetail) {
      return
    }

    setForm({
      correo: userDetail.correo ?? "",
      password: "",
      rol: userDetail.rol ?? "ROLE_USER",
      tipoPerfil: userDetail.tipoPerfil ?? "PERSONAL",
      nombre: userDetail.nombre ?? "",
      apellido: userDetail.apellido ?? "",
      telefono: userDetail.telefono ?? "",
      descripcion: userDetail.descripcion ?? "",
    })
  }, [mode, open, userDetail])

  const title = useMemo(
    () => (mode === "create" ? "Crear usuario" : "Editar usuario"),
    [mode]
  )

  const description =
    mode === "create"
      ? "Completa los datos para registrar un nuevo usuario."
      : "Actualiza los campos permitidos del usuario."

  const onChangeField = (key: keyof UsuarioFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const normalizeOptional = (value: string): string | null => {
    const trimmed = value.trim()
    return trimmed.length === 0 ? null : trimmed
  }

  const handleSubmit = async () => {
    if (mode === "create") {
      const payload: UsuarioRequest = {
        correo: form.correo.trim(),
        password: form.password,
        rol: form.rol,
        tipoPerfil: form.tipoPerfil,
        nombre: form.nombre.trim(),
        apellido: normalizeOptional(form.apellido),
        telefono: normalizeOptional(form.telefono),
        descripcion: normalizeOptional(form.descripcion),
      }

      const parsed = createUsuarioSchema.safeParse(payload)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? "Datos invalidos")
        return
      }

      try {
        await createUsuario(parsed.data).unwrap()
        toast.success("Usuario creado correctamente")
        onOpenChange(false)
      } catch (error: any) {
        toast.error("No se pudo crear el usuario", {
          description: error?.data?.message ?? "Intenta nuevamente.",
        })
      }

      return
    }

    if (!user) {
      return
    }

    const payload: UsuarioPatchRequest = {
      correo: form.correo.trim(),
      nombre: form.nombre.trim(),
      apellido: normalizeOptional(form.apellido),
      telefono: normalizeOptional(form.telefono),
      descripcion: normalizeOptional(form.descripcion),
      tipoPerfil: form.tipoPerfil,
    }

    const parsed = updateUsuarioSchema.safeParse(payload)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos invalidos")
      return
    }

    try {
      await updateUsuario({
        id: user.id,
        data: parsed.data,
      }).unwrap()
      toast.success("Usuario actualizado correctamente")
      onOpenChange(false)
    } catch (error: any) {
      toast.error("No se pudo actualizar el usuario", {
        description: error?.data?.message ?? "Intenta nuevamente.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-1">
          <div className="grid gap-2">
            <Label htmlFor="usuario-correo">Correo</Label>
            <Input
              id="usuario-correo"
              value={form.correo}
              onChange={(event) => onChangeField("correo", event.target.value)}
            />
          </div>

          {mode === "create" ? (
            <div className="grid gap-2">
              <Label htmlFor="usuario-password">Contrasena</Label>
              <Input
                id="usuario-password"
                type="password"
                value={form.password}
                onChange={(event) => onChangeField("password", event.target.value)}
              />
            </div>
          ) : null}

          {mode === "create" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Rol</Label>
                <Select value={form.rol} onValueChange={(value) => onChangeField("rol", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROLE_USER">ROLE_USER</SelectItem>
                    <SelectItem value="ROLE_ADMIN">ROLE_ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Tipo perfil</Label>
                <Select
                  value={form.tipoPerfil}
                  onValueChange={(value) => onChangeField("tipoPerfil", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSONAL">PERSONAL</SelectItem>
                    <SelectItem value="EMPRESA">EMPRESA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label>Tipo perfil</Label>
              <Select
                value={form.tipoPerfil}
                onValueChange={(value) => onChangeField("tipoPerfil", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERSONAL">PERSONAL</SelectItem>
                  <SelectItem value="EMPRESA">EMPRESA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="usuario-nombre">Nombre</Label>
              <Input
                id="usuario-nombre"
                value={form.nombre}
                onChange={(event) => onChangeField("nombre", event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="usuario-apellido">Apellido</Label>
              <Input
                id="usuario-apellido"
                value={form.apellido}
                onChange={(event) => onChangeField("apellido", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="usuario-telefono">Telefono</Label>
            <Input
              id="usuario-telefono"
              value={form.telefono}
              onChange={(event) => onChangeField("telefono", event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="usuario-descripcion">Descripcion</Label>
            <Textarea
              id="usuario-descripcion"
              value={form.descripcion}
              onChange={(event) => onChangeField("descripcion", event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
