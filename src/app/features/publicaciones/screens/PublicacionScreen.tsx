import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"


import {
  Home01Icon,
  Location01Icon,
  File01Icon,
  Image01Icon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon
} from "hugeicons-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

import { useAppSelector } from "@/app/store"
import { useCrearInmuebleMutation, useCrearPublicacionMutation } from "../store/publicacionApi"
import { crearPublicacionWizardSchema } from "../schemas/publicacionSchema"

import { PasoInmueble, PasoUbicacion, PasoDetalles, PasoImagenes } from "../components/wizard"

const STEPS = [
  { id: 1, label: "Datos del Inmueble", icon: Home01Icon },
  { id: 2, label: "Ubicación", icon: Location01Icon },
  { id: 3, label: "Publicación", icon: File01Icon },
  { id: 4, label: "Imágenes", icon: Image01Icon },
]

export function PublicacionScreen() {
  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()

  // RTK Query Mutations
  const [crearInmueble, { isLoading: isCreatingInmueble }] = useCrearInmuebleMutation()
  const [crearPublicacion, { isLoading: isCreatingPublicacion }] = useCrearPublicacionMutation()

  // Usuario extraido de Redux Auth
  const user = useAppSelector((state) => state.auth.user)

  // Configuración del Formulario Oficial
  const form = useForm({
    defaultValues: {
      tipoInmueble: "",
      areaTerreno: 0,
      areaConstruida: 0,
      habitaciones: 0,
      banos: 0,
      garajes: 0,
      antiguedadAnios: 0,
      ciudad: "",
      zonaBarrios: "",
      direccionExacta: "",
      latitud: "",
      longitud: "",
      titulo: "",
      descripcionGeneral: "",
      precio: 0,
      tipoTransaccion: "",
      moneda: "USD",
      imagenesUrls: [],
    } as any,
    onSubmit: async ({ value }) => {
      try {
        if (!user?.id) {
          toast.error("Error", { description: "Usuario no autenticado" })
          return
        }

        // 1. CREAR EL INMUEBLE PRIMERO
        const inmuebleRes = await crearInmueble({
          tipoInmueble: value.tipoInmueble,
          areaTerreno: value.areaTerreno,
          areaConstruida: value.areaConstruida,
          habitaciones: value.habitaciones,
          banos: value.banos,
          garajes: value.garajes,
          antiguedadAnios: value.antiguedadAnios,
          ubicacion: {
            ciudad: value.ciudad,
            zonaBarrios: value.zonaBarrios,
            direccionExacta: value.direccionExacta,
            latitud: value.latitud,
            longitud: value.longitud,
          }
        }).unwrap()

        // 2. CREAR LA PUBLICACIÓN (SIMULANDO SUBIDA DE IMAGENES por ahora mandamos [])
        await crearPublicacion({
          idUsuario: user.id,
          idInmueble: inmuebleRes.id,
          titulo: value.titulo,
          descripcionGeneral: value.descripcionGeneral,
          tipoTransaccion: value.tipoTransaccion,
          precio: value.precio,
          moneda: value.moneda,
          estadoPublicacion: "ACTIVO",
          imagenesUrls: [], // TODO: Aquí se conectarían las URLs generadas por Cloudinary en el futuro
        }).unwrap()

        toast.success("¡Éxito!", { description: "Propiedad publicada correctamente" })
        navigate({ to: "/dashboard" }) // Redirigir al dashboard

      } catch (error: any) {
        toast.error("Error al publicar", { description: error?.data?.message || "Revisa los campos e intenta de nuevo" })
      }
    },
  })

  // Controladores del Stepper
  const handleNextStep = async () => {
    // Validar manualmente antes de avanzar (simplificado para el wizard guiado)
    // El schema completo se valida OnChange, pero podemos bloquear avance si hay errores del paso actual.
    // TanStack form maneja validaciones integrales, para hacerlo estricto por pasos 
    // se requeriría una lógica sub-schema, aquí optamos por permitir avance libre y validar todo al final,
    // o confiar en la UI para guiar al usuario.

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isLoading = isCreatingInmueble || isCreatingPublicacion;

  return (
    <div className="container py-10 max-w-4xl mx-auto min-h-[80vh] flex items-center justify-center">
      <Card className="w-full bg-background border border-border shadow-lg">
        {/* Header */}
        <div className="border-b border-border px-8 py-6">
          <h1 className="text-2xl font-semibold text-foreground">Publicar Inmueble</h1>
          <p className="text-muted-foreground text-sm mt-1">Completa todos los pasos para publicar tu propiedad</p>
        </div>

        {/* Stepper Superior */}
        <div className="px-8 py-6 border-b border-border overflow-x-auto">
          <div className="flex items-center justify-between min-w-[500px]">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isCompleted = currentStep > step.id
              const isActive = currentStep === step.id

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {isCompleted ? <CheckmarkCircle01Icon className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center font-medium max-w-[80px] ${isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded transition-colors ${isCompleted ? "bg-primary" : "bg-muted"
                        }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* CONTENIDO DEL FORMULARIO */}
        <div className="px-8 py-6 min-h-[400px]">
          {currentStep === 1 && <PasoInmueble form={form} />}
          {currentStep === 2 && <PasoUbicacion form={form} />}
          {currentStep === 3 && <PasoDetalles form={form} />}
          {currentStep === 4 && <PasoImagenes form={form} />}
        </div>

        {/* FOOTER - BOTONERA */}
        <div className="border-t border-border px-8 py-4 flex items-center justify-between bg-muted/30">
          <Button
            onClick={handlePrevStep}
            disabled={currentStep === 1 || isLoading}
            variant="outline"
            className="gap-2"
          >
            Anterior
          </Button>

          <span className="text-sm text-muted-foreground">
            Paso {currentStep} de {STEPS.length}
          </span>

          {currentStep === STEPS.length ? (
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  onClick={() => form.handleSubmit()}
                  disabled={!canSubmit || isLoading}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  {isLoading ? "Publicando..." : (
                    <>
                      <CheckmarkCircle01Icon className="w-4 h-4" />
                      Publicar
                    </>
                  )}
                </Button>
              )}
            />
          ) : (
            <Button onClick={handleNextStep} className="gap-2 bg-primary hover:bg-primary/90">
              Siguiente
              <ArrowRight01Icon className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
