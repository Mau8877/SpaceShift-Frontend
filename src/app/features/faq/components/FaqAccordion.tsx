import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FAQItem {
  question: string
  answer: string
}

const faqs: Array<FAQItem> = [
  {
    question: "¿Cómo publico mi inmueble en SpaceShift?",
    answer:
      "Es muy sencillo. Haz clic en el botón 'Publica tu inmueble' en el header, completa el formulario con las fotos y detalles de tu propiedad, y ¡listo! Nuestro equipo lo revisará en menos de 24 horas.",
  },
  {
    question: "¿Qué es el sistema de Anticrético?",
    answer:
      "El anticrético es una modalidad donde el inquilino entrega una suma de dinero al propietario a cambio del uso de la vivienda por un tiempo determinado, sin pagar alquiler mensual. Al finalizar el contrato, el dinero se devuelve íntegramente.",
  },
  {
    question: "¿Es seguro realizar transacciones por la plataforma?",
    answer:
      "SpaceShift actúa como un catálogo verificado. Recomendamos siempre realizar los pagos legales y firmas de contrato ante un notario de fe pública para garantizar la seguridad de ambas partes.",
  },
  {
    question: "¿Cómo puedo contactar con un agente?",
    answer:
      "Dentro de cada ficha de inmueble encontrarás un botón de 'Contactar'. Podrás enviarle un mensaje directo por WhatsApp o llamarlo para agendar una visita presencial.",
  },
]

export function FaqAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="border-slate-200"
        >
          <AccordionTrigger className="py-4 text-left font-semibold text-slate-700 hover:text-primary hover:no-underline">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="pb-4 leading-relaxed text-slate-600">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
