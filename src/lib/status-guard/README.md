# Status guard: pantalla de fuera de servicio para sitios de clientes

Kit para copiar y pegar en los proyectos de los clientes (frontend **React + TanStack Query**, backend **NestJS**).
Consulta el endpoint público de estado de KODARY y, si el proyecto está **suspendido** o **inactivo**:

- el **frontend** muestra una pantalla completa de fuera de servicio en lugar del sitio;
- el **backend** responde **503 Service Unavailable** a todas las rutas (salvo las que se excluyan).

No hace falta compilar nada aparte ni instalar paquetes nuevos: son archivos TypeScript que se copian dentro del
proyecto del cliente.

```
kits/status-guard/
├── react/   → se copia al frontend (p. ej. src/lib/status-guard/)
└── nest/    → se copia al backend  (p. ej. src/status-guard/)
```

## Cómo se comporta

| Estado del proyecto en el panel | `status` en el endpoint | Frontend                | Backend                  |
| ------------------------------- | ----------------------- | ----------------------- | ------------------------ |
| En desarrollo / Activo          | `active`                | Muestra el sitio        | Atiende normal           |
| Suspendido (manual o por cobro) | `suspended`             | Pantalla fuera de servicio | 503 `{ status, message }` |
| Inactivo                        | `inactive`              | Pantalla fuera de servicio | 503 `{ status, message }` |
| No se pudo consultar            | (`unknown`, interno)    | Muestra el sitio        | Atiende normal           |

El texto de la pantalla es el **mensaje de fuera de servicio** del proyecto (se edita en el panel: Proyecto → Editar).
Si está vacío, KODARY envía un texto por defecto según el estado.

### Fail-open

Si el endpoint no responde, tarda más de la cuenta, devuelve un error o un JSON que no cumple el contrato, el kit
**no bloquea**: el sitio sigue funcionando como si estuviera activo. Una caída de KODARY nunca debe tumbar el sitio
de un cliente al día con sus pagos.

Un **404** también es fail-open, pero se avisa una vez en la consola (navegador) o en el log (Nest): casi siempre es
una clave mal copiada o una clave que se regeneró en el panel.

### Frecuencia de consulta

- **Frontend:** al cargar, cada **60 s** y al volver a la pestaña. Configurable con `intervalMs`.
- **Backend:** como mucho una consulta cada **60 s** (caché en memoria; `cacheTtlMs`). Tras una falla se reintenta
  a los 10 s. Las consultas simultáneas comparten una sola petición, con un tiempo máximo de **3 s** (`timeoutMs`).

El endpoint ya responde con `Cache-Control: public, max-age=60`, así que consultar más seguido no aporta nada.

## La URL de estado

En el panel de KODARY, abre el proyecto: en la tarjeta **"Fuera de servicio"** aparece **"Endpoint de estado para el sitio del
cliente"** con un botón para copiarla. Tiene esta forma:

```
https://<api-de-kodary>/api/status/<clave-del-proyecto>
```

La clave es pública (va en el JavaScript del sitio) pero aleatoria: no permite adivinar otros proyectos. Si se
regenera en el panel, hay que actualizar las variables de entorno del cliente.

## Frontend (React + TanStack Query)

Requisitos: React 18 o superior y `@tanstack/react-query` v5 con un `QueryClientProvider` ya montado (lo normal en
estos proyectos).

1. Copia la carpeta `react/` en el proyecto, por ejemplo en `src/lib/status-guard/`.
2. Agrega la variable de entorno (Vite):

   ```bash
   # .env.production
   VITE_KODARY_STATUS_URL=https://<api-de-kodary>/api/status/<clave-del-proyecto>
   ```

3. Envuelve la aplicación, **dentro** del `QueryClientProvider`:

   ```tsx
   import { StatusGuard } from './lib/status-guard';

   <QueryClientProvider client={queryClient}>
     <StatusGuard url={import.meta.env.VITE_KODARY_STATUS_URL}>
       <App />
     </StatusGuard>
   </QueryClientProvider>;
   ```

   Con **TanStack Router**, ponlo en el componente de la ruta raíz alrededor del `<Outlet />`:

   ```tsx
   export const Route = createRootRoute({
     component: () => (
       <StatusGuard url={import.meta.env.VITE_KODARY_STATUS_URL}>
         <Outlet />
       </StatusGuard>
     ),
   });
   ```

Mientras la primera consulta está en curso se muestra el sitio (no hay parpadeo de la pantalla de mantenimiento al
cargar). Si la variable no está definida (por ejemplo en desarrollo local), no se consulta nada.

### Opciones de `<StatusGuard>`

| Prop         | Tipo                                         | Descripción                                                    |
| ------------ | -------------------------------------------- | -------------------------------------------------------------- |
| `url`        | `string \| undefined`                        | URL de estado. Sin URL no bloquea.                             |
| `fallback`   | `ReactNode \| (info) => ReactNode`           | Reemplaza la pantalla por defecto (`info` = `{ status, name, message }`). |
| `siteName`   | `string`                                     | Nombre a mostrar; por defecto, el nombre del proyecto en KODARY. |
| `intervalMs` | `number`                                     | Intervalo de consulta. Por defecto `60000`.                    |

Pantalla propia con la marca del cliente:

```tsx
<StatusGuard
  url={import.meta.env.VITE_KODARY_STATUS_URL}
  fallback={({ status, message }) => <MiPantallaDeMantenimiento status={status} message={message} />}
>
  <App />
</StatusGuard>
```

También se exportan `useServiceStatus(url, { intervalMs })` (el hook de TanStack Query), `fetchServiceStatus(url,
signal)` y `OutOfServicePage` por si se quieren usar por separado.

La pantalla por defecto es neutra, ocupa toda la ventana, respeta el modo oscuro del sistema, usa `role="alert"` con
su título `<h1>` y cambia el título de la pestaña. Sus estilos van incluidos y acotados con el prefijo `kds-`: no
depende de Tailwind ni del CSS del sitio.

> **SEO:** un componente de React no puede hacer que los buscadores dejen de indexar el sitio (la página sigue
> respondiendo 200 con el HTML de siempre). Si eso importa, lo correcto es que el servidor responda **503**: el kit
> de Nest lo hace para la API; si el mismo Nest sirve el frontend, ver la nota de archivos estáticos más abajo.

## Backend (NestJS)

Requisitos: NestJS 10 o superior y Node 18 o superior (usa `fetch` y `AbortSignal.timeout` nativos).

1. Copia la carpeta `nest/` en el proyecto, por ejemplo en `src/status-guard/`.
2. Agrega la variable de entorno:

   ```bash
   KODARY_STATUS_URL=https://<api-de-kodary>/api/status/<clave-del-proyecto>
   ```

3. Importa el módulo **una vez** en el módulo raíz. Registra el guard de forma global (`APP_GUARD`):

   ```ts
   import { ServiceStatusModule } from './status-guard/index.js';

   @Module({
     imports: [ServiceStatusModule.forRoot({ url: process.env.KODARY_STATUS_URL })],
   })
   export class AppModule {}
   ```

   Con `@nestjs/config`:

   ```ts
   ServiceStatusModule.forRootAsync({
     inject: [ConfigService],
     useFactory: (config: ConfigService) => ({ url: config.get('KODARY_STATUS_URL') }),
   });
   ```

4. Excluye lo que nunca debe bloquearse (health checks, webhooks, callbacks de pago…) con `@SkipServiceStatus()`,
   en un controlador entero o en una ruta:

   ```ts
   import { SkipServiceStatus } from './status-guard/index.js';

   @SkipServiceStatus()
   @Controller('health')
   export class HealthController {}
   ```

Opciones de `forRoot`: `url` (sin URL no bloquea), `cacheTtlMs` (por defecto `60000`) y `timeoutMs` (por defecto
`3000`).

Respuesta cuando está fuera de servicio:

```http
HTTP/1.1 503 Service Unavailable
Content-Type: application/json

{ "status": "suspended", "message": "Este servicio está temporalmente suspendido. Se reactivará en cuanto se regularice la cuenta." }
```

Notas:

- Los guards de Nest solo corren en rutas de controladores. Los archivos estáticos servidos con `ServeStaticModule`
  o `express.static` no pasan por el guard: si hace falta un 503 para el HTML del sitio, hay que agregar un
  middleware que use `ServiceStatusClient` (está exportado e inyectable).
- `ServiceStatusClient.getStatus()` se puede usar en cualquier servicio (por ejemplo, para no enviar correos mientras
  el servicio está suspendido). Nunca lanza.
- Las importaciones usan el sufijo `.js` (como pide `moduleResolution: nodenext`); también funcionan en proyectos
  Nest con CommonJS. Del lado de React van sin sufijo, como es costumbre con Vite.

## Cómo probarlo

1. En el panel de KODARY, crea (o usa) un proyecto de prueba y copia su URL de estado.
2. Ponla en `VITE_KODARY_STATUS_URL` / `KODARY_STATUS_URL` y levanta el proyecto del cliente: debe verse normal.
3. En el panel, **Suspender** el proyecto (o pásalo a **Inactivo**). Verifica el endpoint:

   ```bash
   curl -s https://<api-de-kodary>/api/status/<clave>
   # {"status":"suspended","name":"…","message":"…"}
   ```

4. En menos de un minuto (o al volver a la pestaña) el frontend muestra la pantalla de fuera de servicio y la API
   responde 503. Las rutas con `@SkipServiceStatus()` siguen respondiendo.
5. Edita el **mensaje de fuera de servicio** en el panel y confirma que el texto cambia.
6. **Reactivar** el proyecto: el sitio vuelve solo.
7. Fail-open: pon una URL inválida o apaga la red hacia KODARY: el sitio debe seguir funcionando (y avisar en la
   consola o el log si la respuesta fue 404).

## Contrato

```
GET <url>   (público, CORS abierto, Cache-Control: public, max-age=60)

200 → {
  "status":  "active" | "suspended" | "inactive",
  "name":    string,          // nombre del proyecto en KODARY
  "message": string | null    // texto para la pantalla; null cuando está activo
}
404 → la clave no existe (el kit lo trata como fail-open y avisa una vez)
```

`contract.ts` contiene los tipos, la validación de la respuesta y los textos por defecto. Es **el mismo archivo** en
`react/` y en `nest/` porque cada carpeta se copia por separado: si el contrato cambia, hay que actualizar ambos.
