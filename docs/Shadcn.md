# Sistema de Diseño: SpaceShift + shadcn/ui

Este proyecto utiliza **shadcn/ui** como base para su sistema de diseño, configurado específicamente para la comunidad inmobiliaria **SpaceShift**.

## Configuración del shadcn

- **Preset de Diseño:** `b5KIUwbPE`

## ¿Qué es shadcn/ui?

A diferencia de las librerías de componentes tradicionales (como MUI o Bootstrap), **shadcn/ui** no es una dependencia que se instala en el `node_modules`. Es una **colección de componentes reutilizables** que se copian directamente en nuestro código fuente.

### ¿Por qué lo elegimos para SpaceShift?

1. **Control Total:** Al ser dueños del código de cada componente (`button.tsx`, `card.tsx`, etc.), podemos modificarlos libremente para adaptarlos a las necesidades de **Realidad Aumentada (AR)** sin pelear con estilos externos.
2. **Accesibilidad (Radix UI):** Todos los componentes cumplen con los estándares de accesibilidad, algo vital para una plataforma profesional.
3. **Identidad Visual:** Gracias al preset `b5KIUwbPE`, cada componente que añadimos adopta automáticamente los colores, radios de borde y tipografías de **SpaceShift**.
4. **Rendimiento:** Solo incluimos el código que realmente usamos, manteniendo el frontend ligero y rápido.

---

## Gestión de Componentes

### 1. Añadir nuevos componentes

Para expandir nuestra librería de UI, utiliza el comando de Bun especificando el componente:

```bash
bunx --bun shadcn@latest add [nombre-del-componente]

```
