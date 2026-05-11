import { useEffect, useRef, useState } from "react"
import { Download02Icon, Loading01Icon, SentIcon, SparklesIcon } from "hugeicons-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

const N8N_URL =
  "https://lptmjaja.app.n8n.cloud/webhook/3ed60612-2ce4-41fd-baa7-dc4d25b03c5c"

const BINARY_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/pdf",
  "application/octet-stream",
]

type FileAttachment = { blob: Blob; filename: string; ext: string }
type Message =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; file?: FileAttachment }

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function guessFilename(contentType: string, contentDisposition: string | null) {
  if (contentDisposition) {
    const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
    if (match?.[1]) return match[1].replace(/['"]/g, "")
  }
  if (contentType.includes("pdf")) return "reporte.pdf"
  return "reporte.xlsx"
}

export function ReporteChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", text: userMsg }])
    setLoading(true)
    try {
      const res = await fetch(N8N_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: userMsg }),
      })

      const contentType = res.headers.get("content-type") ?? ""
      const isBinary = BINARY_TYPES.some((t) => contentType.includes(t))

      if (isBinary) {
        const blob = await res.blob()
        const filename = guessFilename(contentType, res.headers.get("content-disposition"))
        const ext = filename.endsWith(".pdf") ? "pdf" : "xlsx"
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: "Reporte generado. Haz clic para descargarlo.", file: { blob, filename, ext } },
        ])
      } else {
        const text = await res.text()
        let reply: string
        try {
          const data = JSON.parse(text)
          const extracted = data.output ?? data.text ?? data.message ?? data.response
          reply = extracted != null ? String(extracted) : text || "Sin respuesta del asistente."
        } catch {
          reply = text || "Respuesta vacía del asistente."
        }
        setMessages((prev) => [...prev, { role: "assistant", text: reply }])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Error al conectar con el asistente." },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSend()
  }

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
            <SparklesIcon size={16} />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">
              Asistente de Reportes
            </CardTitle>
            <p className="mt-0.5 text-xs text-slate-500">
              Genera reportes personalizados con lenguaje natural
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-0">
        <ScrollArea className="h-64 rounded-md border border-slate-100 bg-slate-50 p-3">
          {messages.length === 0 ? (
            <p className="text-center text-xs text-slate-400 mt-24">
              Escribe una pregunta sobre los datos de la plataforma.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {msg.text}
                    {msg.role === "assistant" && msg.file && (
                      <button
                        className="mt-2 flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                        onClick={() => downloadBlob(msg.file!.blob, msg.file!.filename)}
                      >
                        <Download02Icon size={12} />
                        {msg.file.filename}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-400">
                    <Loading01Icon size={12} className="animate-spin" />
                    Procesando...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder="Ej: ¿Cuántos contratos activos hay este mes?"
            className="h-9 text-xs"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <Button
            size="sm"
            className="h-9 gap-1.5 bg-slate-900 text-white hover:bg-slate-700"
            disabled={loading || !input.trim()}
            onClick={handleSend}
          >
            {loading ? (
              <Loading01Icon size={14} className="animate-spin" />
            ) : (
              <SentIcon size={14} />
            )}
            Enviar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
