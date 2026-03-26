# Gestión de Estado: Redux Toolkit

Este proyecto utiliza **Redux Toolkit (RTK)** como la única fuente de verdad para el estado global de la aplicación, garantizando una comunicación fluida entre el Frontend, los microservicios de **Spring Boot** y el motor de **IA en Django**.

## ¿Qué es Redux Toolkit?

**Redux Toolkit** es la forma moderna y estandarizada de escribir lógica de Redux. Elimina la complejidad innecesaria (boilerplate) y proporciona herramientas poderosas para gestionar datos que deben ser compartidos entre múltiples componentes sin necesidad de pasar "props" manualmente.

### ¿Por qué lo elegimos para SpaceShift?

1. **Estado Global Centralizado:** Datos como la sesión del usuario, los filtros de búsqueda y los resultados de la IA son accesibles desde cualquier parte de la app.
2. **Predecibilidad:** El flujo de datos es unidireccional (Action -> Reducer -> Store), lo que facilita la depuración de errores complejos en el catálogo de inmuebles.
3. **Persistencia:** Permite guardar estados clave (como favoritos o el progreso de un formulario) para que no se pierdan al recargar la página.
4. **RTK Query:** Aunque el núcleo es Redux, aprovechamos su capacidad para cachear respuestas del backend, reduciendo la carga en los servidores.

---

## Arquitectura del Store

El Store de **SpaceShift** se divide en "Slices" (rebanadas) de lógica independiente:

### 1. User Slice

- **Responsabilidad:** Gestionar la autenticación, tokens JWT y perfil del usuario.
- **Dato Clave:** Roles de usuario (Comprador/Vendedor).

### 2. Properties Slice

- **Responsabilidad:** Almacenar la lista de inmuebles activos y los detalles del inmueble seleccionado.
- **Dato Clave:** Filtros por modalidad (**Venta, Alquiler, Anticrético**).

### 3. AR & AI Slice

- **Responsabilidad:** Gestionar el estado de los modelos 3D y las respuestas del motor de IA en Django.
- **Dato Clave:** Estado de carga del visor de Realidad Aumentada.

---

## Integración con shadcn/ui y TanStack

Redux actúa como el pegamento que une la lógica y la interfaz:

- **Con shadcn/ui:** Componentes como el `Sidebar` o el `Avatar` consumen datos directamente del Store de Redux para mostrar la información del usuario en tiempo real.
- **Con TanStack Table:** Redux almacena los filtros seleccionados en la tabla de administración para que persistan incluso si el usuario navega a otra sección y regresa.
- **Con TanStack Form:** Una vez validado un formulario de publicación, los datos se despachan a Redux para actualizar la lista global de inmuebles instantáneamente.

---

## Herramientas de Desarrollo

Para inspeccionar el estado en tiempo real, utilizamos **Redux DevTools**. Esto permite:

- Hacer "Time Travel Debugging" (volver atrás en las acciones realizadas).
- Ver exactamente qué datos están llegando desde el backend de **Spring Boot**.
- Monitorear el rendimiento de las actualizaciones de estado.

---

Para más información consulta la documentación oficial: [https://redux-toolkit.js.org/](https://redux-toolkit.js.org/)
