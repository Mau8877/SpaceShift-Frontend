import { useState } from "react"

import { Upload01Icon } from "hugeicons-react"

export function PasoImagenes({ form }: { form: any }) {
  const [imagePreviews, setImagePreviews] = useState<{ src: string; file: File }[]>([])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldChange: (value: any[]) => void) => {
    if (!e.target.files) return

    const newFiles = Array.from(e.target.files)

    // Procesar previews localmente
    const base64Promises = newFiles.map(
      (file) =>
        new Promise<{ src: string; file: File }>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve({ src: reader.result as string, file })
          }
          reader.readAsDataURL(file)
        })
    )

    Promise.all(base64Promises).then((newPreviews) => {
      const allPreviews = [...imagePreviews, ...newPreviews].slice(0, 10) // Limit to 10
      setImagePreviews(allPreviews)

      // Actualizar el valor en el estado del formulario general
      fieldChange(allPreviews.map((p) => p.file))
    })
  }

  const removeImage = (index: number, fieldChange: (value: any[]) => void) => {
    const updated = imagePreviews.filter((_, i) => i !== index)
    setImagePreviews(updated)
    fieldChange(updated.map((p) => p.file))
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-lg font-semibold text-foreground mb-6">Imágenes del Inmueble</h2>

      <form.Field
        name="imagenesUrls"
        children={(field: any) => (
          <>
            <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors ${field.state.meta.errors.length ? 'border-red-500 bg-red-500/5' : 'border-border'}`}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e, field.handleChange)}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload01Icon className="w-8 h-8 text-primary" />
                <p className="font-medium text-foreground">Sube tus imágenes aquí</p>
                <p className="text-xs text-muted-foreground">o haz clic para seleccionar archivos</p>
                <p className="text-xs text-muted-foreground mt-2">Máximo 10 imágenes, formato JPG o PNG</p>
              </label>
            </div>

            {field.state.meta.errors ? <p className="text-xs text-red-500 mt-1">{field.state.meta.errors.join(", ")}</p> : null}

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group rounded-md overflow-hidden border border-border">
                    <img
                      src={preview.src}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index, field.handleChange)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <span className="text-white text-sm font-medium">Eliminar</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-4 text-right">
              Imágenes cargadas: {imagePreviews.length}/10
            </p>
          </>
        )}
      />
    </div>
  )
}
