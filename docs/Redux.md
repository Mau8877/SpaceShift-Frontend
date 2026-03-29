# Gestión de Estado: Redux Toolkit & Arquitectura Modular

Este proyecto utiliza **Redux Toolkit (RTK)** como la única fuente de verdad para el estado global de la aplicación, garantizando una comunicación fluida entre el Frontend, los microservicios de **Spring Boot** y el motor de **IA en Django**.

## ¿Qué es Redux Toolkit?

**Redux Toolkit** es la forma moderna y estandarizada de escribir lógica de Redux. En **SpaceShift**, lo utilizamos bajo una arquitectura de **Módulos Independientes**, lo que nos permite separar la lógica de autenticación de la lógica de inmuebles o servicios de IA.

### ¿Por qué lo elegimos para SpaceShift?

1. **Arquitectura Modular:** Cada funcionalidad (Auth, Properties, IA) tiene su propio espacio, evitando el "código espagueti".
2. **Persistencia con Cookies:** A diferencia del `localStorage` común, usamos **Cookies con JS-Cookie** para el token JWT, aumentando la seguridad contra ataques XSS.
3. **Decodificación de JWT:** Utilizamos `jwt-decode` en el Slice de Auth para extraer los datos del usuario (Nombre, Rol, ID) directamente del token sin peticiones extra al servidor.
4. **RTK Query (Sistema Nervioso):** Centralizamos las peticiones HTTP en una "Base API" que maneja automáticamente el **Auto-Refresh** del token y notificaciones de error.

---

## Estructura del Store (Tree)

Para mantener la escalabilidad, el `store/` se organiza de la siguiente manera:

- **`📂api/`**: Contiene la `api.ts` (configuración global) y `createBaseApi.ts` (lógica de interceptores, headers y logs).
- **`📂hooks/`**: Hooks personalizados (`useAppDispatch`, `useAppSelector`) para interactuar con React de forma tipada.
- **`📂types/`**: Contratos de TypeScript divididos en `auth.types.ts` (negocio) y `api.types.ts` (comunicación).
- **`📜authSlice.ts`**: El cerebro de la sesión. Maneja el estado de login, logout y la persistencia en Cookies.
- **`📜redux.ts`**: El archivo que unifica todos los reducers y middlewares en el Store final.

---

## Comunicación e Invalidez de Datos (Tags)

En **SpaceShift**, utilizamos el sistema de **Tags** de RTK Query para mantener la interfaz sincronizada con el servidor sin necesidad de recargar la página manualmente.

### ¿Qué es un Tag?

Un **Tag** es una "etiqueta" que le ponemos a un conjunto de datos en la memoria caché. Sirve para decirle a Redux: _"Si pasa X cosa, esta información ya no es válida y debes pedirla de nuevo al servidor"_.

### ¿Dónde se configuran?

1. **Definición Global:** Los tags se registran primero en el archivo `src/store/api/api.ts` dentro del array `tagTypes`.
   ```typescript
   tagTypes: ['Auth', 'User', 'Property'],
   ```

---

### Provisión e Invalidación de Datos (Tags)

En **SpaceShift**, utilizamos el sistema de **Tags** de RTK Query para mantener la interfaz sincronizada con el servidor de forma automática:

- **Provisión (`providesTags`):** En un endpoint de lectura (**GET**), marcamos que esos datos "proveen" una etiqueta específica.
- **Invalidación (`invalidatesTags`):** En un endpoint de escritura (**POST, PUT, DELETE**), marcamos que esa acción "rompe" o invalida la etiqueta.
- **Ejemplo:** Si un Agente elimina un inmueble, el tag `Property` se invalida y Redux automáticamente vuelve a pedir la lista actualizada de inmuebles al backend de **Spring Boot**.

---

### Integración con shadcn/ui y Sonner

- **Feedback en tiempo real:** Hemos integrado **Sonner** directamente en el middleware de la API (`createBaseApi`). Si el servidor responde un error (401, 403, 500), aparecerá un Toast automático en la UI sin necesidad de programar la lógica de error en cada pantalla.
- **Estado de Carga:** Los componentes de **shadcn/ui** consumen el estado `status` (`'loading'`, `'succeeded'`, `'failed'`) para mostrar esqueletos de carga (_skeletons_) o deshabilitar botones mientras la **IA de Django** procesa una imagen o un modelo 3D.

---

### Herramientas de Desarrollo

Para inspeccionar el estado y el flujo de los Tokens en tiempo real, utilizamos **Redux DevTools**:

- **Monitoreo del Auto-Refresh:** Es posible ver en la consola los logs de colores cuando el sistema detecta un token vencido y ejecuta la renovación de forma invisible para el usuario.
- **Verificación de Cookies:** El Store inicializa el estado leyendo directamente la persistencia de las **Cookies** en el navegador, garantizando que la sesión se mantenga tras recargar la página.

---

Para más información consulta la documentación oficial: [https://redux-toolkit.js.org/](https://redux-toolkit.js.org/)
