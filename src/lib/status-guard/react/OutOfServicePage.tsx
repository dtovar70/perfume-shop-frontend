import { useEffect } from 'react';
import { outOfServiceMessage, type OutOfServiceStatus } from './contract';

export interface OutOfServicePageProps {
  status: OutOfServiceStatus;
  /** Nombre del sitio. Si falta, se omite. */
  name?: string;
  /** Mensaje de KODARY; si falta, se usa el texto por defecto del estado. */
  message?: string | null;
}

const TITLES: Record<OutOfServiceStatus, string> = {
  suspended: 'Servicio temporalmente suspendido',
  inactive: 'Servicio no disponible',
};

/**
 * Estilos acotados con el prefijo `kds-` (sin depender de Tailwind ni del CSS del sitio). Respetan el modo oscuro del
 * sistema y se adaptan a pantallas pequeñas.
 */
const CSS = `
.kds-root{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;
  padding:24px 16px;overflow:auto;background:#f6f7f9;color:#1d2330;
  font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;line-height:1.5}
.kds-card{width:100%;max-width:520px;text-align:center}
.kds-icon{width:56px;height:56px;margin:0 auto 20px;color:#8a93a6}
.kds-site{margin:0 0 8px;font-size:.85rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#6b7385}
.kds-title{margin:0 0 12px;font-size:clamp(1.4rem,4vw,1.9rem);font-weight:700;line-height:1.25}
.kds-message{margin:0;font-size:1rem;color:#454d5e;white-space:pre-line}
@media (prefers-color-scheme:dark){
  .kds-root{background:#12151b;color:#e7eaf0}
  .kds-icon{color:#7d869a}.kds-site{color:#9aa3b5}.kds-message{color:#c3c9d4}
}`;

/** Ajusta el título de la pestaña mientras se muestra la pantalla y lo restaura al salir. */
function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

/** Pantalla completa de fuera de servicio, neutra y accesible. */
export function OutOfServicePage({ status, name, message }: OutOfServicePageProps) {
  const title = TITLES[status];
  useDocumentTitle(name ? `${title} · ${name}` : title);
  return (
    <main className="kds-root" role="alert" aria-labelledby="kds-title">
      <style>{CSS}</style>
      <div className="kds-card">
        <svg
          className="kds-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5v5" />
          <path d="M12 16.25h.01" />
        </svg>
        {name ? <p className="kds-site">{name}</p> : null}
        <h1 id="kds-title" className="kds-title">
          {title}
        </h1>
        <p className="kds-message">{outOfServiceMessage(status, message)}</p>
      </div>
    </main>
  );
}
