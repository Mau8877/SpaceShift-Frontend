# Arquitectura: TanStack Ecosystem

Este proyecto utiliza el ecosistema de **TanStack** para gestionar el enrutamiento, el estado del servidor y la lógica de formularios, garantizando una aplicación 100% "Type-safe" y de alto rendimiento.

## Qué es TanStack?

**TanStack** es un conjunto de librerías de código abierto e independientes del framework, diseñadas para resolver los problemas más complejos del desarrollo web: el manejo de rutas, la sincronización de datos con el servidor y la manipulación de tablas o formularios masivos.

### ¿Por qué lo elegimos para SpaceShift?

1. **Type-Safety Total:** Al usar TypeScript, TanStack nos avisa de errores antes de ejecutar el código (ej: si intentamos navegar a una ruta que no existe).
2. **Rendimiento SSR:** Con **TanStack Start**, la página carga desde el servidor, lo cual es vital para el SEO y la velocidad inicial de la comunidad.
3. **Productividad:** Elimina la necesidad de configurar manualmente manejadores de carga (loaders) o estados de error complejos.

---

## Herramientas Implementadas

### 1. TanStack Start

- **Función:** Framework Full-stack construido sobre **TanStack Router**.
- **Uso en SpaceShift:** Es el esqueleto del frontend. Maneja el renderizado híbrido y la comunicación eficiente con los backends (Spring Boot y Django).

### 2. TanStack Router

- **Función:** Gestor de rutas basado en el sistema de archivos (File-based routing).
- **Uso en SpaceShift:** Define las URLs de la plataforma (ej: `/inmuebles/$id`, `/admin/perfil`). Al ser tipado, garantiza que los parámetros de la URL siempre sean correctos.

### 3. TanStack Form

- **Función:** Manejo de formularios de alto rendimiento.
- **Uso en SpaceShift:** Utilizado en el registro de nuevos inmuebles. En conjunto con **Zod**, valida que los datos de Venta, Alquiler o Anticrético cumplan con los requisitos técnicos antes de enviarse.

### 4. TanStack Table

- **Función:** Motor para la creación de tablas y datagrids potentes.
- **Uso en SpaceShift:** Para el panel administrativo donde se listan cientos de inmuebles, permitiendo ordenar, filtrar y paginar con latencia cero.

---

## Flujo de Trabajo

Para mantener la consistencia en el desarrollo, seguimos estas reglas:

- **Rutas:** Todos los archivos de ruta deben crearse dentro de `src/routes/`.
- **Validación:** Cada formulario de TanStack Form debe estar vinculado a un esquema de **Zod**.
- **Navegación:** Usar siempre el componente `<Link />` de TanStack para mantener la carga instantánea entre páginas.

---

## Integración con shadcn/ui

Una de las mayores ventajas competitivas de **SpaceShift** es la integración de la lógica de **TanStack** con la estética de **shadcn/ui**. No son herramientas que compiten, sino que se complementan:

### 1. TanStack Form + shadcn/ui

- **El Cerebro (TanStack Form):** Maneja el estado del formulario, las validaciones con **Zod**, los mensajes de error y el envío de datos a **Spring Boot**.
- **La Interfaz (shadcn/ui):** Proporciona los componentes visuales como `<Input />`, `<Label />`, `<Select />` y `<FormMessage />`.
- **Resultado:** Formularios de publicación de inmuebles que son visualmente profesionales y técnicamente robustos.

### 2. TanStack Table + shadcn/ui

- **El Cerebro (TanStack Table):** Gestiona la lógica de ordenamiento, filtros por precio (Venta/Anticrético), paginación y selección de filas.
- **La Interfaz (shadcn/ui):** Ofrece los componentes de tabla estilizados (`<Table />`, `<TableHeader />`, `<TableCell />`) y elementos de interacción como `<DropdownMenu />` para acciones rápidas.
- **Resultado:** Tablas de administración de inmuebles con alto rendimiento y diseño coherente con el resto de la plataforma.

---

### Regla de Oro del Proyecto

Para mantener la calidad técnica exigida, **nunca** utilizaremos componentes de formulario nativos de HTML (`<input>`, `<select>`). Siempre envolveremos la lógica de **TanStack** dentro de los componentes de **shadcn/ui**.

Para más información consulta la documentación oficial: [https://tanstack.com/](https://tanstack.com/)
