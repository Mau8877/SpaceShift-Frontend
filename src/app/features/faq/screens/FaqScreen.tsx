import { CustomerService01Icon } from "hugeicons-react"
import { FaqAccordion } from "../components/FaqAccordion"

export const FaqScreen = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/30 px-4 py-12">
      <div className="mx-auto w-full max-w-3xl">
        {/* Cabecera de la Página */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CustomerService01Icon size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Preguntas Frecuentes
          </h1>
          <p className="mt-4 text-slate-600">
            ¿Tienes alguna duda sobre cómo funciona SpaceShift? Aquí te
            respondemos las preguntas más comunes de nuestra comunidad.
          </p>
        </div>

        {/* El Acordeón */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <FaqAccordion />
        </div>

        {/* Pie de Ayuda Adicional */}
        <div className="mt-12 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
          <h3 className="text-lg font-semibold text-slate-800">
            ¿No encontraste lo que buscabas?
          </h3>
          <p className="mb-4 text-slate-600">
            Estamos aquí para ayudarte 24/7.
          </p>
          <button className="rounded-lg bg-primary px-6 py-2 font-bold text-white shadow-lg transition-colors hover:bg-primary/90">
            Hablar con Soporte
          </button>
        </div>
      </div>
    </div>
  )
}
