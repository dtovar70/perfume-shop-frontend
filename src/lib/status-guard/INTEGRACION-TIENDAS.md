# Integración del estado de servicio KODARY: Galpa y Kaizen

Guía para integrar el **status guard** de KODARY en una tienda virtual (frontend **React + TanStack**, backend
**NestJS**). Al terminar, la tienda consulta a KODARY si su servicio está al día:

- **Activo** → la tienda funciona normal.
- **Suspendido** (falta de pago) o **inactivo** → el frontend muestra una pantalla completa de *fuera de servicio* y
  la API de la tienda responde **503** a todo, así nadie puede comprar llamando directo a la API.
- **KODARY no responde** → la tienda **sigue funcionando** (fail-open). Una caída de KODARY nunca tumba la tienda.

No hay que diseñar ninguna pantalla: el kit ya trae una (`OutOfServicePage`) que muestra el nombre del sitio y el
mensaje configurado en el panel de KODARY. Personalizarla es opcional (ver paso A.4).

---

## 0. Lo que necesitas antes de empezar

| Qué | De dónde sale |
| --- | --- |
| Carpeta `react/` del kit | `kits/status-guard/react/` del repo de KODARY |
| Carpeta `nest/` del kit | `kits/status-guard/nest/` del repo de KODARY |
| URL de estado de la tienda | Panel de KODARY → Proyectos → *(la tienda)* → tarjeta **Fuera de servicio** → **Endpoint de estado** (botón copiar) |

URLs de producción:

| Tienda | URL de estado |
| --- | --- |
| Corporación Galpa | `https://api.kodaryrs.com/api/status/WdA4y_ze1bXuyb5JwKoyt2wb6VKbMu-laceJFLvK0A8` |
| Kaizen Perfumes | `https://api.kodaryrs.com/api/status/<clave-de-kaizen>` *(copiar del panel)* |

Cada tienda usa **su propia** URL. Si la clave se regenera en el panel, hay que actualizar las variables de entorno.

Requisitos: React 18+, `@tanstack/react-query` v5 con `QueryClientProvider` montado, NestJS 10+, Node 18+.

---

## A. Frontend (React + TanStack)

### A.1 Copiar el kit

```bash
cp -r <repo-kodary>/kits/status-guard/react  src/lib/status-guard
```

No se instala ningún paquete nuevo.

### A.2 Variable de entorno

```env
# .env.local (desarrollo, contra la API local de KODARY)
VITE_KODARY_STATUS_URL=http://localhost:3001/api/status/<clave-del-proyecto-de-prueba>

# .env.production / variables del deploy
VITE_KODARY_STATUS_URL=https://api.kodaryrs.com/api/status/<clave-de-la-tienda>
```

Si la variable no está definida, el kit no consulta nada y la tienda funciona normal.

### A.3 Envolver la aplicación

Con **TanStack Router**, en la ruta raíz (normalmente `src/routes/__root.tsx`), alrededor del `<Outlet />`:

```tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { StatusGuard } from '@/lib/status-guard';

export const Route = createRootRoute({
  component: () => (
    <StatusGuard url={import.meta.env.VITE_KODARY_STATUS_URL}>
      <Outlet />
    </StatusGuard>
  ),
});
```

Sin TanStack Router, en `main.tsx` alrededor de `<App />`. En ambos casos **dentro** del `QueryClientProvider`:

```tsx
<QueryClientProvider client={queryClient}>
  <StatusGuard url={import.meta.env.VITE_KODARY_STATUS_URL}>
    <App />
  </StatusGuard>
</QueryClientProvider>
```

El guard consulta al cargar, cada **60 s** y al volver a la pestaña. Mientras carga la primera consulta muestra la
tienda (no hay parpadeo de la pantalla de mantenimiento).

### A.4 (Opcional) Pantalla con la marca de la tienda

```tsx
<StatusGuard
  url={import.meta.env.VITE_KODARY_STATUS_URL}
  fallback={({ status, name, message }) => <MantenimientoTienda status={status} message={message} />}
>
  <Outlet />
</StatusGuard>
```

`message` es el texto del panel de KODARY (o el texto por defecto). Si se omite `fallback`, se usa la pantalla del kit.

---

## B. Backend (NestJS)

### B.1 Copiar el kit

```bash
cp -r <repo-kodary>/kits/status-guard/nest  src/status-guard
```

### B.2 Variable de entorno

```env
KODARY_STATUS_URL=http://localhost:3001/api/status/<clave-del-proyecto-de-prueba>          # local
KODARY_STATUS_URL=https://api.kodaryrs.com/api/status/<clave-de-la-tienda>                 # producción
```

> Si la API de la tienda corre dentro de Docker en local, `localhost` no llega a la API de KODARY: usar
> `http://host.docker.internal:3001/api/status/<clave>`.

### B.3 Registrar el módulo (una sola vez, en `app.module.ts`)

Con `@nestjs/config`:

```ts
import { ConfigService } from '@nestjs/config';
import { ServiceStatusModule } from './status-guard/index.js';

@Module({
  imports: [
    ServiceStatusModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ url: config.get('KODARY_STATUS_URL') }),
    }),
    // ...resto de módulos
  ],
})
export class AppModule {}
```

Sin `@nestjs/config`: `ServiceStatusModule.forRoot({ url: process.env.KODARY_STATUS_URL })`.

El módulo registra un guard **global**: no hay que tocar cada controlador. Si el proyecto compila a CommonJS y el
sufijo `.js` en los imports molesta, se puede quitar.

### B.4 Excluir lo que nunca debe bloquearse

Health checks, **webhooks y callbacks de pago** (si se bloquean, un pago que llegue durante la suspensión se pierde):

```ts
import { SkipServiceStatus } from './status-guard/index.js';

@SkipServiceStatus()
@Controller('webhooks')
export class WebhooksController {}
```

También se puede poner en una ruta concreta en lugar del controlador entero.

Respuesta de la API cuando está fuera de servicio:

```http
HTTP/1.1 503 Service Unavailable
{ "status": "suspended", "message": "<mensaje del panel de KODARY>" }
```

> Si el frontend muestra errores genéricos ante un 503, conviene que el cliente HTTP de la tienda no intente
> reintentar en bucle: el `StatusGuard` del frontend ya tapa el sitio en menos de 60 s.

---

## C. Criterios de aceptación y pruebas

Probar en local contra la API local de KODARY, usando un **proyecto de prueba** (no el de la tienda real), con las
dos variables apuntando a su URL de estado.

### C.1 Cómo poner el proyecto de prueba en cada estado

| Estado | Cómo lograrlo en el panel de KODARY |
| --- | --- |
| Suspendido (rápido) | Proyecto → **Suspender** |
| Suspendido (por vencimiento real) | Emitir una factura, mover su `due_on` a hace 5 días en la BD y pulsar **Facturas → Correr cobros ahora** |
| Inactivo | Proyecto → Editar → estado **Inactivo** |
| Activo de nuevo | Proyecto → **Reactivar** (o validar el pago pendiente) |

Comprobar el estado abriendo la URL de estado en el navegador:
`{"status":"suspended","name":"…","message":"…"}`.

### C.2 Checklist

**Frontend**

- [ ] Con el proyecto **activo**, la tienda carga normal y sin parpadeos de la pantalla de mantenimiento.
- [ ] Al **suspender**, en ≤ 60 s (o al cambiar de pestaña y volver) se ve la pantalla de fuera de servicio a
      pantalla completa: nombre del sitio, título "Servicio temporalmente suspendido" y el mensaje del panel.
- [ ] No se puede navegar ni interactuar con la tienda mientras se ve la pantalla (tampoco cambiando de ruta).
- [ ] El título de la pestaña cambia a "Servicio temporalmente suspendido · <nombre>".
- [ ] Al cambiar el **mensaje de fuera de servicio** en el panel, el texto nuevo aparece en ≤ 60 s.
- [ ] Con estado **inactivo**, el título es "Servicio no disponible".
- [ ] Al **reactivar**, la tienda vuelve sola en ≤ 60 s, sin recargar a mano.
- [ ] Se ve bien en móvil (≈ 375 px) y en escritorio; respeta el modo oscuro del sistema.

**Backend**

- [ ] Con el proyecto activo, la API responde normal.
- [ ] Suspendido: cualquier ruta responde `503` con `{ status, message }` (`curl -i http://localhost:<puerto>/<ruta>`).
      Puede tardar hasta 60 s por la caché.
- [ ] Las rutas con `@SkipServiceStatus()` (health, webhooks de pago) siguen respondiendo durante la suspensión.
- [ ] Al reactivar, la API vuelve a responder normal en ≤ 60 s.

**Fail-open (lo más importante)**

- [ ] Con la API de KODARY **apagada**, la tienda (front y API) funciona normal.
- [ ] Con una **clave inválida** en la URL, la tienda funciona normal y aparece un aviso una sola vez en la consola
      del navegador / log de Nest (clave mal copiada).
- [ ] Sin las variables de entorno, la tienda funciona normal.

### C.3 Antes de desplegar a producción

- [ ] Las variables de producción usan la URL de **esta** tienda (no la del proyecto de prueba).
- [ ] Abrir la URL de producción en el navegador devuelve `"status":"active"` antes de desplegar.
- [ ] Desplegar frontend y backend, y comprobar que la tienda se ve normal.

---

## Referencia rápida

- **Contrato:** `GET <url>` → `200 { status: "active" | "suspended" | "inactive", name: string, message: string | null }`;
  `404` si la clave no existe (fail-open con aviso).
- **Frecuencia:** frontend cada 60 s + al volver a la pestaña; backend con caché de 60 s, timeout de 3 s y reintento
  a los 10 s tras una falla.
- **Detalle completo del kit:** `README.md` de la carpeta `kits/status-guard/`.
