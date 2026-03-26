# 📚 Guía Completa de Componentes UI - SpaceShift

Este documento detalla la utilidad y el contexto de uso de cada componente de la librería **shadcn/ui** implementado en la plataforma.

---

## 🏗️ Navegación y Estructura

### **Sidebar**

- **¿Qué es?:** Un panel lateral colapsable para navegación.
- **¿Para qué sirve?:** Organizar el acceso a las funciones principales sin saturar el centro de la pantalla.
- **¿Cuándo utilizar?:** Como menú principal para navegar entre "Explorar", "Mis Inmuebles" y el "Panel de AR".

### **Navigation Menu**

- **¿Qué es?:** Una barra de navegación con submenús desplegables.
- **¿Para qué sirve?:** Presentar enlaces jerárquicos de forma elegante.
- **¿Cuándo utilizar?:** En la cabecera (Header) de la página principal para secciones como "Comprar" o "Alquilar".

### **Menubar**

- **¿Qué es?:** Una barra de menús horizontal estilo aplicación de escritorio.
- **¿Para qué sirve?:** Agrupar una gran cantidad de comandos en categorías lógicas.
- **¿Cuándo utilizar?:** En el panel administrativo de SpaceShift para gestionar usuarios y bases de datos.

### **Breadcrumb**

- **¿Qué es?:** Un indicador de ruta jerárquica (migas de pan).
- **¿Para qué sirve?:** Facilitar la navegación de regreso hacia niveles superiores de forma rápida.
- **¿Cuándo utilizar?:** En la vista detallada de una casa (ej: Inicio > Venta > Departamentos > Equipetrol).

### **Pagination**

- **¿Qué es?:** Controles de navegación entre páginas de resultados.
- **¿Para qué sirve?:** Dividir grandes cantidades de datos en bloques manejables.
- **¿Cuándo utilizar?:** Al final del catálogo de inmuebles cuando existen cientos de publicaciones.

### **Separator**

- **¿Qué es?:** Una línea sutil de división visual.
- **¿Para qué sirve?:** Separar secciones de contenido para mejorar la legibilidad.
- **¿Cuándo utilizar?:** Para dividir la descripción del inmueble de las características técnicas (baños, m², etc.).

### **Scroll Area**

- **¿Qué es?:** Un contenedor con barra de desplazamiento personalizada.
- **¿Para qué sirve?:** Mantener la estética del diseño incluso en listas muy largas dentro de espacios pequeños.
- **¿Cuándo utilizar?:** En la lista de mensajes del chat o filtros laterales extensos.

---

## 🖼️ Visualización y Contenido

### **Card**

- **¿Qué es?:** Un contenedor flexible con secciones de cabecera, cuerpo y pie.
- **¿Para qué sirve?:** Agrupar información relacionada en un bloque visual independiente.
- **¿Cuándo utilizar?:** Es el componente base para cada ficha de inmueble en el catálogo.

### **Carousel**

- **¿Qué es?:** Un componente deslizante para múltiples elementos.
- **¿Para qué sirve?:** Mostrar varias imágenes o tarjetas en un espacio limitado.
- **¿Cuándo utilizar?:** Para la galería de fotos de un departamento o casa.

### **Badge**

- **¿Qué es?:** Una pequeña etiqueta de estado o categoría.
- **¿Para qué sirve?:** Resaltar una información clave de forma rápida y visual.
- **¿Cuándo utilizar?:** Para indicar visualmente si el negocio es **"Venta"**, **"Alquiler"** o **"Anticrético"**.

### **Avatar**

- **¿Qué es?:** Un círculo para imágenes de perfil con respaldo de iniciales.
- **¿Para qué sirve?:** Identificar visualmente a los usuarios, compradores o agentes.
- **¿Cuándo utilizar?:** En la sección de contacto del vendedor o en el perfil del usuario.

### **Accordion**

- **¿Qué es?:** Una lista de secciones colapsables.
- **¿Para qué sirve?:** Ocultar información secundaria que solo se expande a petición del usuario.
- **¿Cuándo utilizar?:** Para la sección de "Preguntas Frecuentes" o detalles de servicios básicos.

### **Chart**

- **¿Qué es?:** Un motor de visualización de datos estadísticos.
- **¿Para qué sirve?:** Representar información numérica de forma gráfica (barras, líneas, etc.).
- **¿Cuándo utilizar?:** En el dashboard del vendedor para ver el rendimiento de sus publicaciones.

### **Aspect Ratio / Direction**

- **¿Qué es?:** Utilidades para controlar las proporciones y la orientación del contenido.
- **¿Para qué sirve?:** Asegurar que las imágenes de los inmuebles no se deformen.
- **¿Cuándo utilizar?:** Al renderizar las fotos de portada de los anuncios.

---

## 📝 Formularios e Interacción

### **Button / Button Group**

- **¿Qué es?:** Elementos de acción simples o agrupados.
- **¿Para qué sirve?:** Permitir que el usuario ejecute acciones mediante clics.
- **¿Cuándo utilizar?:** Para "Publicar", "Contactar" o "Ver Recorrido AR".

### **Input / Input Group**

- **¿Qué es?:** Campos de entrada de texto y variantes combinadas con iconos.
- **¿Para qué sirve?:** Capturar datos del usuario de forma limpia y validada.
- **¿Cuándo utilizar?:** En el buscador de zonas o en los formularios de registro.

### **Label**

- **¿Qué es?:** Una etiqueta de texto vinculada a un control de formulario.
- **¿Para qué sirve?:** Identificar claramente qué información debe ir en cada campo.
- **¿Cuándo utilizar?:** Siempre acompañando a Inputs, Selects o Textareas.

### **Textarea**

- **¿Qué es?:** Un campo de entrada de texto de varias líneas.
- **¿Para qué sirve?:** Capturar descripciones extensas o comentarios detallados.
- **¿Cuándo utilizar?:** En el campo de "Descripción del Inmueble" al crear un anuncio.

### **Select / Native Select**

- **¿Qué es?:** Menús desplegables de opciones únicas.
- **¿Para qué sirve?:** Limitar la selección del usuario a una lista controlada.
- **¿Cuándo utilizar?:** Para elegir el número de habitaciones, baños o el tipo de moneda.

### **Switch / Checkbox**

- **¿Qué es?:** Controles de selección binaria (activado/desactivado).
- **¿Para qué sirve?:** Capturar preferencias de tipo Sí/No.
- **¿Cuándo utilizar?:** Para filtros como "¿Tiene piscina?" o "¿Es amoblado?".

### **Calendar / Date Picker**

- **¿Qué es?:** Un selector de fecha visual.
- **¿Para qué sirve?:** Facilitar la elección de días evitando errores de formato manual.
- **¿Cuándo utilizar?:** Para programar citas de visitas presenciales.

### **Toggle**

- **¿Qué es?:** Un botón de dos estados.
- **¿Para qué sirve?:** Alternar entre dos estados visuales o lógicos de forma inmediata.
- **¿Cuándo utilizar?:** Para cambiar entre vista de "Lista" y vista de "Mapa" en los inmuebles.

---

## 🔔 Feedback y Mensajes

### **Sonner**

- **¿Qué es?:** Sistema de notificaciones flotantes (Toasts).
- **¿Para qué sirve?:** Dar avisos rápidos que no bloquean la pantalla.
- **¿Cuándo utilizar?:** "¡Publicación creada exitosamente!" o "Inmueble guardado".

### **Alert / Alert Dialog**

- **¿Qué es?:** Cuadros de mensaje críticos que requieren atención inmediata.
- **¿Para qué sirve?:** Mostrar advertencias o pedir confirmaciones de seguridad.
- **¿Cuándo utilizar?:** Al intentar eliminar una publicación o advertir sobre precios fuera de rango.

### **Progress**

- **¿Qué es?:** Una barra de carga porcentual.
- **¿Para qué sirve?:** Indicar el progreso de una tarea de larga duración.
- **¿Cuándo utilizar?:** Mientras se sube o procesa el archivo de **Realidad Aumentada (AR)**.

### **Skeleton**

- **¿Qué es?:** Marcadores de posición que imitan la forma del contenido final.
- **¿Para qué sirve?:** Mostrar una estructura de carga visualmente atractiva mientras llega la data del backend.
- **¿Cuándo utilizar?:** Al cargar la lista de inmuebles desde Spring Boot.

### **Spinner / Empty**

- **¿Qué es?:** Indicadores de carga circular y estados de "sin resultados".
- **¿Para qué sirve?:** Informar que el sistema está trabajando o que no hay datos disponibles.
- **¿Cuándo utilizar?:** En búsquedas de inmuebles que no arrojan resultados.

---

## 🖱️ Menús, Diálogos y Utilidades

### **Dialog / Sheet**

- **¿Qué es?:** Ventanas modales centradas y paneles laterales deslizantes.
- **¿Para qué sirve?:** Realizar tareas complejas sin salir de la página actual.
- **¿Cuándo utilizar?:** Formulario de contacto (Dialog) o filtros avanzados en móviles (Sheet).

### **Popover / Hover Card**

- **¿Qué es?:** Contenedores flotantes que aparecen por clic o proximidad del cursor.
- **¿Para qué sirve?:** Mostrar información extra sin interrumpir el flujo.
- **¿Cuándo utilizar?:** Ver detalles rápidos de un agente o dueño al pasar el ratón sobre su nombre.

### **Command / ComboBox**

- **¿Qué es?:** Buscador de opciones interactivo con soporte de teclado.
- **¿Para qué sirve?:** Filtrar y seleccionar opciones de una lista larga rápidamente.
- **¿Cuándo utilizar?:** Para seleccionar barrios o zonas específicas de la ciudad.

### **Context Menu**

- **¿Qué es?:** Menú de acciones al hacer clic derecho.
- **¿Para qué sirve?:** Ofrecer atajos específicos sobre un objeto.
- **¿Cuándo utilizar?:** Acciones rápidas sobre una Card de inmueble (Copiar link, Guardar).

### **Tooltip**

- **¿Qué es?:** Pequeño texto descriptivo al pasar el cursor sobre un icono.
- **¿Para qué sirve?:** Explicar botones que no tienen texto descriptivo.
- **¿Cuándo utilizar?:** En el icono de "AR" para explicar la funcionalidad de Realidad Aumentada.

---

Para más información consulta su documentación: https://ui.shadcn.com/docs/components
