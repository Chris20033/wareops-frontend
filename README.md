# WareOps Web

Frontend de WareOps construido con Next.js, App Router y TypeScript estricto.

## Requisitos

- Node.js 24.x LTS
- npm 11.6.1

## Variable de entorno

Copia `.env.example` como `.env.local`. La variable pública disponible es:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

No guardes secretos en variables prefijadas con `NEXT_PUBLIC_`.

## Instalación

```bash
npm ci
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La ruta `/` muestra la comprobación técnica del frontend.

## Comandos

| Comando                | Propósito                                 |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Inicia el servidor de desarrollo.         |
| `npm run format`       | Formatea los archivos compatibles.        |
| `npm run format:check` | Comprueba formato sin modificar archivos. |
| `npm run lint`         | Ejecuta ESLint.                           |
| `npm run test`         | Ejecuta Vitest en modo interactivo.       |
| `npm run test:run`     | Ejecuta Vitest una sola vez.              |
| `npm run build`        | Genera el build de producción.            |
| `npm run start`        | Sirve un build previamente generado.      |

## Estructura

- `src/app`: rutas, layouts y proveedores globales.
- `src/features`: comportamiento organizado por módulo.
- `src/components`: componentes de interfaz reutilizables.
- `src/lib`: infraestructura compartida de API, autenticación y validación.
- `src/stores`: estado cliente con Zustand.
- `src/test`: configuración compartida de pruebas.

## Problemas comunes

- Si `npm ci` indica que el lockfile no coincide, confirma que usas npm 11.6.1 y no regeneres el lockfile con otra versión.
- Si el puerto 3000 está ocupado, detén el proceso anterior o ejecuta `npm run dev -- --port 3002`.
- Si la API usa otra URL, actualiza únicamente `NEXT_PUBLIC_API_BASE_URL` en `.env.local` y conserva la base `/api/v1`.
