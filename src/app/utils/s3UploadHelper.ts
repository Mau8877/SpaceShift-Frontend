/**
 * Extrae la duración de un archivo de video en segundos utilizando un elemento de video HTML5 temporal.
 * @param file Archivo de video (File)
 * @returns Promesa con la duración en segundos (number)
 */
export const obtenerDuracionVideo = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      reject(new Error("No se pudo cargar los metadatos del video. Asegúrate de que el formato sea válido."));
    };
    video.src = URL.createObjectURL(file);
  });
};

/**
 * Realiza la subida binaria directa a S3 utilizando la URL firmada (PUT)
 * @param uploadUrl URL firmada recibida del backend
 * @param file Archivo a subir
 * @param contentType Tipo MIME del archivo
 * @param onProgress Callback opcional para monitorear el progreso de la subida
 */
export const subirArchivoAS3 = async (
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress?: (porcentaje: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", contentType);

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const porcentaje = Math.round((event.loaded / event.total) * 100);
          onProgress(porcentaje);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        resolve();
      } else {
        reject(new Error(`Error al subir archivo a S3. Código HTTP: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Error de red durante la subida a S3."));
    xhr.send(file);
  });
};
