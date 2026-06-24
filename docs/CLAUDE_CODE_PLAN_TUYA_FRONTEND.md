# Plan complementario — Integración Tuya Cloud API + Frontend React
> Complementa el plan CLAUDE_CODE_PLAN_IOT_SPACESHIFT.md
> Ejecutar DESPUÉS de que las fases 0-8 del plan base estén completas

---

## Contexto

El técnico de SpaceShift usa la app **Smart Life** (cuenta corporativa) para hacer
el pairing físico del enchufe Dimax al WiFi del inmueble. Una vez conectado,
el enchufe aparece en Tuya Cloud vinculado a la cuenta SpaceShift.

Este plan cubre:
1. Backend Spring Boot — integración con Tuya Cloud API
2. Frontend React — panel del técnico con flujo de escaneo y asignación

**Frontend stack:** React + TanStack Query + Redux Toolkit + shadcn/ui

---

## Instrucción inicial para Claude Code

```
Lee este documento completo antes de escribir cualquier línea de código.
Este plan complementa el plan base de IoT. Asume que las entidades
SmartPlug, PlugAssignment, Appliance, ApplianceCondition e InstallationTicket
ya existen en el proyecto con sus repositorios y servicios base.

Tu tarea ahora es:
1. Agregar la integración con Tuya Cloud API al backend
2. Construir el panel del técnico en React

Antes de empezar, verificar:
- Que el plan base está implementado (buscar SmartPlugService)
- Que existe pom.xml para agregar dependencias
- Que existe la estructura de carpetas del frontend React
```

---

## PARTE 1 — Backend: Integración Tuya Cloud API

---

### Fase T1 — Dependencias y configuración

#### Agregar al `pom.xml`:
```xml
<!-- HTTP client para llamadas a Tuya API -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>

<!-- Para el HMAC-SHA256 que requiere Tuya para autenticación -->
<dependency>
    <groupId>commons-codec</groupId>
    <artifactId>commons-codec</artifactId>
    <version>1.16.0</version>
</dependency>
```

#### Agregar al `application.yml` (o `application.properties`):
```yaml
tuya:
  api:
    base-url: https://openapi.tuyaus.com
    # Región Western America — ajustar si el proyecto en iot.tuya.com
    # usa otra región (eu = openapi.tuyaeu.com, cn = openapi.tuyacn.com)
    client-id: ${TUYA_CLIENT_ID}
    client-secret: ${TUYA_CLIENT_SECRET}
    # Estos valores vienen de iot.tuya.com → tu proyecto → Overview
```

#### Crear clase de configuración `TuyaProperties.java`:
```java
@ConfigurationProperties(prefix = "tuya.api")
@Component
public class TuyaProperties {
    private String baseUrl;
    private String clientId;
    private String clientSecret;
    // getters y setters
}
```

---

### Fase T2 — Cliente Tuya Cloud API

Tuya usa un esquema de autenticación propio con HMAC-SHA256.
Crear el cliente en el subpaquete `infrastructure.tuya`.

#### `TuyaAuthService.java` — Manejo de access token
```
Responsabilidades:
- Obtener access token: GET /v1.0/token?grant_type=1
- Cachear el token en memoria (expira en 7200 segundos)
- Renovar automáticamente cuando esté por vencer
- Construir la firma HMAC-SHA256 que requiere cada request de Tuya

Lógica de firma Tuya (implementar exactamente así):
  stringToSign = clientId + accessToken + timestamp + nonce + httpMethod
                 + "\n" + sha256(body) + "\n" + "" + "\n" + path
  signature    = HMAC-SHA256(stringToSign, clientSecret).toUpperCase()

Headers requeridos en cada request:
  client_id   : tu clientId
  sign        : la firma calculada
  t           : timestamp en milisegundos
  sign_method : HMAC-SHA256
  access_token: el token obtenido (excepto en el request inicial de token)
```

#### `TuyaApiClient.java` — Llamadas a la API
```
Implementar con WebClient (Spring WebFlux).
Métodos a implementar:

getDeviceList()
  GET /v1.0/users/{uid}/devices
  - uid es el ID de usuario de la cuenta Smart Life vinculada al proyecto
  - Retorna lista de dispositivos con: id, name, online, category, product_id
  - Filtrar solo los de category "cz" (socket/enchufe en Tuya)

getDeviceDetail(String deviceId)
  GET /v1.0/devices/{device_id}
  - Retorna: id, name, online, status[], create_time, update_time
  - Útil para verificar que el device_id existe antes de guardarlo

getDeviceStatus(String deviceId)
  GET /v1.0/devices/{device_id}/status
  - Retorna lista de data points (dps): código y valor
  - Para enchufes: dp "switch_1" = true/false (encendido/apagado)

sendCommand(String deviceId, boolean on)
  POST /v1.0/devices/{device_id}/commands
  Body: { "commands": [{ "code": "switch_1", "value": true/false }] }
  - Enciende o apaga el enchufe

Manejo de errores:
  - Si Tuya retorna success: false, lanzar TuyaApiException con el mensaje
  - Si el device está offline, lanzar DeviceOfflineException
  - Reintentar automáticamente 1 vez si falla por token expirado (renovar y reintentar)
```

---

### Fase T3 — Nuevos endpoints en SmartPlugService y Controller

#### Métodos nuevos en `SmartPlugService`:

```
scanTuyaDevices()
  - Llama a TuyaApiClient.getDeviceList()
  - Filtra los que ya están registrados en smart_plug (por tuya_device_id)
  - Retorna lista de TuyaDeviceScanResult:
      { tuyaDeviceId, name, online, alreadyRegistered (boolean) }
  - El técnico verá cuáles son nuevos y cuáles ya están en el sistema

verifyAndRegisterPlug(SmartPlugCreateRequest)
  - Llama a TuyaApiClient.getDeviceDetail(tuyaDeviceId) para verificar que existe
  - Si el dispositivo no existe en Tuya → lanzar PlugNotFoundException
  - Si ya está registrado en BD → lanzar PlugAlreadyRegisteredException
  - Guardar en smart_plug con status = AVAILABLE
  - Retornar SmartPlugResponse

testPlugConnection(UUID plugId)
  - Obtener tuyaDeviceId del plug
  - Llamar getDeviceStatus() para verificar que está online
  - Enviar comando ON, esperar 2 segundos, enviar comando OFF
  - Retornar { online: true/false, testPassed: true/false }

sendCommand(UUID plugId, boolean on)
  - Obtener tuyaDeviceId del plug
  - Verificar que el plug tiene asignación activa
  - Llamar TuyaApiClient.sendCommand()
  - Registrar el comando en un log (opcional, para auditoría)
  - Retornar confirmación
```

#### Endpoints nuevos en `SmartPlugController`:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/iot/plugs/scan` | Escanear cuenta Tuya y listar dispositivos nuevos |
| POST | `/api/iot/plugs/verify-register` | Verificar en Tuya y registrar enchufe |
| POST | `/api/iot/plugs/{id}/test` | Test de encendido/apagado |
| POST | `/api/iot/plugs/{id}/command` | Enviar comando ON u OFF |

Body para `/command`:
```json
{ "action": "ON" }
// o
{ "action": "OFF" }
```

---

### Fase T4 — Excepciones nuevas

```java
// El dispositivo existe en BD pero está offline en Tuya
DeviceOfflineException extends RuntimeException  → HTTP 503

// Error de comunicación con Tuya Cloud API
TuyaApiException extends RuntimeException        → HTTP 502

// El device_id no existe en la cuenta Tuya de SpaceShift
TuyaDeviceNotFoundException extends RuntimeException → HTTP 404
```

---

## PARTE 2 — Frontend React: Panel del técnico

---

### Fase F0 — Exploración del proyecto frontend

```
Antes de crear archivos, Claude Code debe:

1. Identificar la estructura de carpetas del proyecto React
   ¿Usa feature-based? ¿Por tipo (components/pages/hooks)?

2. Verificar que están instaladas las dependencias necesarias:
   - @tanstack/react-query
   - @reduxjs/toolkit + react-redux
   - shadcn/ui (verificar cuáles componentes ya están generados)
   - react-router-dom (para rutas)

3. Verificar cómo se hacen las llamadas HTTP actualmente:
   ¿Axios? ¿Fetch nativo? ¿Hay un apiClient base configurado?

4. Verificar cómo está configurado el QueryClient de TanStack
   ¿Hay un QueryClientProvider en main.tsx o App.tsx?

5. Identificar si hay un layout de panel admin existente
   para usar como referencia visual

Reportar hallazgos antes de continuar.
```

---

### Fase F1 — Tipos TypeScript

Crear en `src/features/iot/types/` (o el equivalente según estructura del proyecto):

```typescript
// Estado del enchufe en el sistema SpaceShift
export type PlugStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE';

// Resultado de escanear la cuenta Tuya
export interface TuyaDeviceScanResult {
  tuyaDeviceId: string;
  name: string;
  online: boolean;
  alreadyRegistered: boolean;
  // true = ya está en el sistema, mostrar como deshabilitado
}

// Enchufe registrado en SpaceShift
export interface SmartPlug {
  id: string;
  tuyaDeviceId: string;
  alias: string;
  status: PlugStatus;
  currentAssignment?: {
    applianceId: string;
    applianceName: string;
    propertyName: string;
    assignedAt: string;
  } | null;
}

// Request para registrar enchufe
export interface SmartPlugCreateRequest {
  tuyaDeviceId: string;
  alias: string;
  notes?: string;
}

// Resultado del test de conexión
export interface PlugTestResult {
  online: boolean;
  testPassed: boolean;
  message: string;
}

// Ticket de instalación
export interface InstallationTicket {
  id: string;
  propertyId: string;
  propertyName: string;
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED';
  requestedAt: string;
  scheduledAt?: string | null;
}
```

---

### Fase F2 — API layer (TanStack Query)

Crear en `src/features/iot/api/`:

#### `plugApi.ts`
```typescript
// Usar el apiClient existente del proyecto (axios o fetch configurado)
// Si no existe, crear uno con la base URL del backend

export const plugApi = {
  // Escanear dispositivos Tuya disponibles
  scanTuyaDevices: () =>
    apiClient.get<TuyaDeviceScanResult[]>('/api/iot/plugs/scan'),

  // Registrar enchufe verificado
  registerPlug: (data: SmartPlugCreateRequest) =>
    apiClient.post<SmartPlug>('/api/iot/plugs/verify-register', data),

  // Listar enchufes registrados
  getPlugs: () =>
    apiClient.get<SmartPlug[]>('/api/iot/plugs'),

  // Listar solo disponibles
  getAvailablePlugs: () =>
    apiClient.get<SmartPlug[]>('/api/iot/plugs/available'),

  // Test de enchufe
  testPlug: (plugId: string) =>
    apiClient.post<PlugTestResult>(`/api/iot/plugs/${plugId}/test`),

  // Asignar enchufe a appliance
  assignPlug: (plugId: string, applianceId: string) =>
    apiClient.post(`/api/iot/plugs/${plugId}/assign`, { applianceId }),

  // Desasignar enchufe
  unassignPlug: (plugId: string) =>
    apiClient.post(`/api/iot/plugs/${plugId}/unassign`),
}

export const ticketApi = {
  getPendingTickets: () =>
    apiClient.get<InstallationTicket[]>('/api/iot/tickets/pending'),

  updateTicketStatus: (ticketId: string, data: object) =>
    apiClient.put(`/api/iot/tickets/${ticketId}/status`, data),
}
```

#### `plugQueries.ts` — Query keys y hooks TanStack
```typescript
export const plugKeys = {
  all: ['plugs'] as const,
  lists: () => [...plugKeys.all, 'list'] as const,
  available: () => [...plugKeys.all, 'available'] as const,
  scan: () => [...plugKeys.all, 'scan'] as const,
  detail: (id: string) => [...plugKeys.all, 'detail', id] as const,
}

// Hook: listar todos los enchufes
export const usePlugs = () =>
  useQuery({
    queryKey: plugKeys.lists(),
    queryFn: plugApi.getPlugs,
  })

// Hook: escanear dispositivos Tuya
// staleTime: 0 para que siempre refetche al abrir el modal de escaneo
export const useScanTuyaDevices = (enabled: boolean) =>
  useQuery({
    queryKey: plugKeys.scan(),
    queryFn: plugApi.scanTuyaDevices,
    enabled,
    staleTime: 0,
  })

// Mutation: registrar enchufe
export const useRegisterPlug = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: plugApi.registerPlug,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plugKeys.lists() })
      queryClient.invalidateQueries({ queryKey: plugKeys.scan() })
    },
  })
}

// Mutation: test de enchufe
export const useTestPlug = () =>
  useMutation({
    mutationFn: plugApi.testPlug,
  })

// Mutation: asignar
export const useAssignPlug = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ plugId, applianceId }: { plugId: string; applianceId: string }) =>
      plugApi.assignPlug(plugId, applianceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plugKeys.all })
    },
  })
}

export const ticketKeys = {
  pending: ['tickets', 'pending'] as const,
}

export const usePendingTickets = () =>
  useQuery({
    queryKey: ticketKeys.pending,
    queryFn: ticketApi.getPendingTickets,
    refetchInterval: 60_000, // refetch cada minuto
  })
```

---

### Fase F3 — Redux slice (estado local del flujo de escaneo)

El flujo de registro de un enchufe tiene varios pasos (escanear → seleccionar → nombrar → registrar → testear). Redux maneja el estado de este wizard.

Crear `src/features/iot/store/plugWizardSlice.ts`:

```typescript
interface PlugWizardState {
  step: 'idle' | 'scanning' | 'selecting' | 'naming' | 'registering' | 'testing' | 'done'
  selectedTuyaDevice: TuyaDeviceScanResult | null
  alias: string
  notes: string
  registeredPlugId: string | null
  testResult: PlugTestResult | null
}

const initialState: PlugWizardState = {
  step: 'idle',
  selectedTuyaDevice: null,
  alias: '',
  notes: '',
  registeredPlugId: null,
  testResult: null,
}

// Actions a implementar:
// startScan()       → step: 'scanning'
// selectDevice(device) → step: 'naming', selectedTuyaDevice: device
// setAlias(alias)   → alias: alias
// setNotes(notes)   → notes: notes
// confirmRegister() → step: 'registering'
// setRegisteredId(id) → registeredPlugId: id, step: 'testing'
// setTestResult(result) → testResult: result, step: 'done'
// reset()           → initialState
```

Agregar el slice al store Redux existente del proyecto.

---

### Fase F4 — Componentes UI

Crear en `src/features/iot/components/`:

---

#### `PlugScanDialog.tsx` — Modal principal del flujo de registro

Es un `Dialog` de shadcn/ui que contiene el wizard de 4 pasos.
Leer el step actual desde Redux y renderizar el paso correspondiente.

```
Estructura visual:

[Dialog]
  [DialogHeader] — título cambia según el step
  [DialogContent]
    step === 'scanning'   → <ScanStep />
    step === 'selecting'  → <SelectDeviceStep />
    step === 'naming'     → <NamingStep />
    step === 'testing'    → <TestStep />
    step === 'done'       → <DoneStep />
  [DialogFooter]
    Botones contextuales según step

Trigger: botón "Vincular nuevo enchufe" en la página de inventario
```

---

#### `ScanStep.tsx` — Paso 1: Escaneo

```
Comportamiento:
- Al montar, activar useScanTuyaDevices(true)
- Mientras carga: mostrar Skeleton de shadcn (3-4 filas)
- Si hay error: Alert destructive con botón "Reintentar"
- Cuando carga: ir automáticamente a SelectDeviceStep
  (despachar selectDevice no, solo cambiar step a 'selecting')

UI:
  <div className="flex flex-col items-center gap-4 py-6">
    <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
    <p className="text-sm text-muted-foreground">
      Buscando dispositivos en tu cuenta Tuya...
    </p>
  </div>
```

---

#### `SelectDeviceStep.tsx` — Paso 2: Selección del dispositivo

```
Recibe: lista de TuyaDeviceScanResult desde useScanTuyaDevices

UI — lista de dispositivos:
  Para cada dispositivo mostrar una Card clickeable:
  ┌─────────────────────────────────────────────┐
  │ 🔌 [nombre del dispositivo]    [badge online/offline] │
  │ ID: ebd2a7a7...                [badge "Ya registrado"] │
  └─────────────────────────────────────────────┘

  - Si alreadyRegistered === true:
      Card con opacity-50, cursor-not-allowed, no clickeable
      Badge: "Ya en sistema" (secondary)
  - Si online === false:
      Badge: "Offline" (destructive outline)
      Sí se puede seleccionar (el técnico puede querer registrarlo igual)
  - Si es nuevo y online:
      Badge: "Online" (success — usar className manual verde)
      Card clickeable, al click: dispatch(selectDevice(device))

  Nota: si la lista viene vacía, mostrar:
  <Alert>
    <AlertTitle>No se encontraron dispositivos nuevos</AlertTitle>
    <AlertDescription>
      Asegúrate de haber conectado el enchufe con Smart Life
      antes de escanear.
    </AlertDescription>
  </Alert>
```

---

#### `NamingStep.tsx` — Paso 3: Nombrar el enchufe

```
Muestra resumen del dispositivo seleccionado + formulario.

UI:
  [Card] resumen del dispositivo seleccionado
    - Nombre Tuya
    - device_id (truncado: primeros 8 + "...")
    - Estado online/offline

  [Form]
    Label: "Alias del enchufe"
    Input: placeholder "Ej: Enchufe TV Habitación 1"
    value: alias desde Redux
    onChange: dispatch(setAlias(value))

    Label: "Notas (opcional)"
    Textarea: placeholder "Observaciones de instalación"
    value: notes desde Redux
    onChange: dispatch(setNotes(value))

  Validación: alias es requerido, mínimo 3 caracteres
  Botón "Registrar enchufe" → dispatch(confirmRegister())
    luego llamar useRegisterPlug.mutate({ tuyaDeviceId, alias, notes })
```

---

#### `TestStep.tsx` — Paso 4: Test de encendido

```
Se ejecuta automáticamente al montar:
  useEffect(() => {
    testMutation.mutate(registeredPlugId)
  }, [])

UI mientras ejecuta:
  Loader + texto "Probando conexión... encendiendo y apagando el enchufe"

UI cuando termina — resultado exitoso:
  <Alert variant="default" className="border-green-500">
    <CheckCircle2 className="h-4 w-4 text-green-500" />
    <AlertTitle>Test exitoso</AlertTitle>
    <AlertDescription>El enchufe respondió correctamente.</AlertDescription>
  </Alert>

UI cuando termina — resultado fallido:
  <Alert variant="destructive">
    <XCircle className="h-4 w-4" />
    <AlertTitle>El enchufe no respondió</AlertTitle>
    <AlertDescription>
      Verifica que esté conectado al WiFi y en la red correcta.
    </AlertDescription>
  </Alert>
  [Botón "Reintentar test"]

En ambos casos mostrar botón "Finalizar" → dispatch(reset()) + cerrar dialog
```

---

#### `PlugInventoryTable.tsx` — Tabla de inventario de enchufes

Usar `Table` de shadcn/ui.

```
Columnas:
  Alias | Device ID | Estado | Asignado a | Acciones

Fila por enchufe:
  - Alias: texto plano
  - Device ID: Badge con font-mono, truncado (8 chars + "...")
               con Tooltip mostrando el ID completo al hover
  - Estado: Badge con color según status:
      AVAILABLE   → success (verde)
      ASSIGNED    → blue (usar className manual)
      MAINTENANCE → warning (amarillo)
  - Asignado a: si tiene currentAssignment → "TV · Hab 1 · Inmueble X"
                si no → "—"
  - Acciones: DropdownMenu con:
      - "Ver historial" → navegar a ruta de historial
      - "Desasignar" → solo si status === ASSIGNED
      - "Marcar en mantenimiento" → solo si status !== MAINTENANCE
      Separator
      - "Test de conexión" → abre TestDialog inline

Header de la tabla:
  [h2] Inventario de enchufes
  [Button] "Vincular nuevo enchufe" → abre PlugScanDialog
```

---

#### `PendingTicketsPanel.tsx` — Panel de tickets pendientes

```
Usar usePendingTickets() para obtener los tickets.

UI:
  [Card]
    [CardHeader]
      "Instalaciones pendientes"
      Badge con count de tickets PENDING

    [CardContent]
      Lista de tickets:
      ┌────────────────────────────────────────────┐
      │ Inmueble: [nombre]                          │
      │ Solicitado: [fecha relativa, ej "hace 2h"]  │
      │ [Badge status]    [Botón "Programar visita"]│
      └────────────────────────────────────────────┘

      Al hacer click en "Programar visita":
        Abrir un Popover con DatePicker de shadcn
        Al confirmar fecha → llamar ticketApi.updateTicketStatus()
        con status: SCHEDULED y scheduledAt: fecha seleccionada

      Si no hay tickets pendientes:
        <p className="text-muted-foreground text-sm">
          No hay instalaciones pendientes
        </p>
```

---

### Fase F5 — Página del panel técnico

Crear `src/features/iot/pages/TechnicianDashboard.tsx` (o similar según rutas del proyecto):

```
Layout:
  [PageHeader] "Panel técnico — Gestión IoT"

  [Grid 2 columnas en desktop, 1 en mobile]
    Columna izquierda (2/3):
      <PlugInventoryTable />

    Columna derecha (1/3):
      <PendingTicketsPanel />

Agregar la ruta en el router del proyecto:
  /admin/iot  o  /technician/dashboard
  Protegida por rol ADMIN o TECHNICIAN
```

---

### Fase F6 — Estados de carga y error globales

```
Usar el ErrorBoundary existente del proyecto si hay uno.
Si no, crear manejo de errores en cada componente:

Para errores de Tuya API (502):
  Mostrar Alert con mensaje:
  "No se pudo conectar con Tuya Cloud. Verifica la conexión a internet."

Para dispositivo offline (503):
  Mostrar Alert con mensaje:
  "El enchufe está fuera de línea. Verifica que esté conectado al WiFi."

Para errores 409 (ya registrado):
  Mostrar en el NamingStep:
  "Este enchufe ya está registrado en el sistema."

Todos los errores deben mostrarse dentro del Dialog/componente
correspondiente, nunca navegar a una página de error.
```

---

## Orden de ejecución sugerido para Claude Code

```
PARTE 1 — Backend
  T1 → Dependencias y configuración (application.yml + TuyaProperties)
  T2 → TuyaAuthService (token + firma HMAC)
      → TuyaApiClient (getDeviceList, getDeviceDetail, getDeviceStatus, sendCommand)
  T3 → Nuevos métodos en SmartPlugService
      → Nuevos endpoints en SmartPlugController
  T4 → Excepciones nuevas
  Verificar con Postman antes de continuar al frontend

PARTE 2 — Frontend
  F0 → Explorar estructura y reportar
  F1 → Tipos TypeScript
  F2 → API layer (plugApi.ts + plugQueries.ts)
  F3 → Redux slice (plugWizardSlice)
  F4 → Componentes (en este orden):
        SelectDeviceStep → ScanStep → NamingStep → TestStep
        → PlugScanDialog (que los une)
        → PlugInventoryTable
        → PendingTicketsPanel
  F5 → Página TechnicianDashboard + ruta
  F6 → Manejo de errores

Confirmar con el usuario al final de cada fase antes de continuar.
```

---

## Notas importantes para Claude Code

1. **La firma HMAC-SHA256 de Tuya es estricta** — si el orden de los campos
   en el string a firmar no es exacto, todos los requests fallarán con
   error de autenticación. Implementar exactamente como se describe en T2.

2. **El access token de Tuya expira en 7200 segundos** — implementar
   renovación automática en TuyaAuthService antes de que expire.
   Guardar `expireTime` y renovar cuando queden menos de 60 segundos.

3. **En el frontend, el wizard es stateful** — si el usuario cierra el
   Dialog a mitad del flujo, llamar dispatch(reset()) en el onOpenChange
   del Dialog para limpiar el estado de Redux.

4. **El escaneo (GET /scan) puede tardar 2-3 segundos** — siempre mostrar
   un estado de carga, nunca dejar la UI bloqueada sin feedback.

5. **No mostrar el `tuya_device_id` completo** en la UI — truncar a los
   primeros 8 caracteres con "..." y usar Tooltip para el valor completo.
   Es un identificador interno sensible.

6. **El test de conexión (TestStep) es destructivo si el enchufe ya tiene
   algo conectado** — en la UI advertir: "Asegúrate de que nada esté
   conectado al enchufe durante el test."
```
