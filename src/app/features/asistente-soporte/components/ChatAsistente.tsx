import { useCallback, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SentIcon, Mic01Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useReconocimientoVoz } from "../hooks/useReconocimientoVoz"

interface ChatAsistenteProps {
  /** Se llama con la pregunta cuando el usuario la envía. */
  onAsk: (question: string) => void
  /** True mientras el asistente está pensando (deshabilita el envío). */
  isThinking: boolean
}

export function ChatAsistente({ onAsk, isThinking }: ChatAsistenteProps) {
  const [question, setQuestion] = useState("")

  const handleSend = useCallback(
    (text?: string) => {
      const q = (text ?? question).trim()
      if (!q || isThinking) return
      onAsk(q)
      setQuestion("")
    },
    [question, isThinking, onAsk],
  )

  const { supported, isListening, toggleListen } = useReconocimientoVoz({
    onTranscript: setQuestion,
    onFinal: (text) => handleSend(text),
  })

  return (
    <div className="flex items-center gap-2">
      <Input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
          }
        }}
        placeholder="Escribe tu pregunta..."
        disabled={isThinking}
        className="flex-1"
      />

      {supported && (
        <Button
          type="button"
          size="icon"
          variant={isListening ? "default" : "outline"}
          onClick={toggleListen}
          disabled={isThinking}
          aria-label="Dictar por voz"
          className={isListening ? "animate-pulse" : ""}
        >
          <HugeiconsIcon icon={Mic01Icon} strokeWidth={2} />
        </Button>
      )}

      <Button
        type="button"
        size="icon"
        onClick={() => handleSend()}
        disabled={isThinking || !question.trim()}
        aria-label="Enviar"
      >
        <HugeiconsIcon icon={SentIcon} strokeWidth={2} />
      </Button>
    </div>
  )
}

export default ChatAsistente
