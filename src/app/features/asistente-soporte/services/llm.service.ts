const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api"

// La llamada al LLM va al backend (POST /api/asistente/chat), que añade el system
// prompt y la API key del servidor. Así la key de OpenRouter no está en el cliente.

/**
 * Envía el mensaje del usuario al backend y devuelve el texto de respuesta del LLM.
 * `pagina` es la ruta actual (ej. "/publicar") para darle contexto de pantalla al modelo.
 */
export async function ask(message: string, pagina?: string): Promise<string> {
  const response = await fetch(`${API_BASE}/asistente/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, pagina }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Asistente chat error ${response.status}: ${err}`)
  }

  const data = await response.json()
  return data.response as string
}
