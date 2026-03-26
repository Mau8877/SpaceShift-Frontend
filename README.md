# SpaceShift | Hub Inmobiliario & AR

Plataforma de comunidad inmobiliaria de alto rendimiento que integra **Realidad Aumentada (AR)** e **Inteligencia Artificial**. Diseñada bajo una arquitectura modular y 100% Type-safe.

---

## 🛠️ Stack Tecnológico

- **Runtime:** [Bun](https://bun.sh/)
- **Frontend:** [TanStack Start](https://tanstack.com/start) (React 19 + SSR)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **UI & UX:** [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS 4
- **Validation:** [Zod](https://zod.dev/)

---

## 📂 Estructura del Proyecto

- `src/app/`: Configuración de rutas y entry points de TanStack Start.
- `src/components/ui/`: Componentes atómicos basados en el preset `b5KIUwbPE`.
- `src/store/`: Estado global de la aplicación (Inmuebles, Usuario, AR).
- `docs/`: Documentación técnica específica (Redux, TanStack, Guía de UI).

---

## 🚀 Inicio Rápido

1. **Instalar Dependencias:**
   ```bash
   bun install
   ```
2. **Levantar Entorno de Desarrollo:**
   ```bash
   bun dev
   ```
3. **Build para Produccion:**
   ```bash
   bun build
   ```

---

## 📖 Documentación Técnica

Para detalles específicos sobre la implementación, consulta los módulos de documentación interna:

- [🎨 Sistema de Diseño y Preset](./docs/Shadcn.md)
- [📦 Catálogo de Componentes UI](./docs/Components-Guide.md)
- [🚀 Arquitectura TanStack (Router/Form/Table)](./docs/TanStack.md)
- [🏪 Gestión de Estado Global](./docs/Redux.md)

> **Nota de Integración:** Este frontend se conecta de forma híbrida con servicios de **Spring Boot** (Core Business Logic) y **Django** (Engine de IA).
