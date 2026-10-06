---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

# Main Page (`src/app/page.tsx`)

- **Scope:** Whole surface (`src/app/page.tsx`) + typographic/structural alignment across auth and dashboard views
- **Mode:** Persuade (through live operational demonstration)

## Audience & Job

Responsables de operaciones logísticas, gerentes de inventario y evaluadores técnicos que necesitan comprobar en segundos qué hace WareOps: control multi-almacén de existencias físicas, reservadas y disponibles, transferencias atómicas e aislamiento multi-tenant con RBAC.

## Direction contract

THESIS: La página principal demuestra el libro mayor de inventario y el aislamiento multi-tenant funcionando en vivo desde el primer viewport, rechazando el hero genérico de marketing con tarjetas de iconos del mismo tamaño.

OWN-WORLD: Superficies sólidas en blanco papel (`#ffffff`), piedra técnica (`#fafafa`) y carbón (`#09090b`) sin un solo degradado de color; bordes estructurales continuos de 1px (`#e4e4e7`), tipografía Geist Sans con tracking ajustado para encabezados y Geist Mono con cifras tabulares (`tabular-nums`) reservada estrictamente para SKUs, ubicaciones, cabeceras HTTP, permisos y conteos de inventario. Donación de `vernacular-ephemera-boarding-pass-and-gate-board`: bloque de manifiesto segmentado con estado en vivo en la fila modificada.

STORY: El visitante comprende que WareOps garantiza la ecuación contable `Físico = Reservado + Disponible` sin inventario negativo entre múltiples sucursales, explora el conmutador interactivo de almacén/rol/operación atómica en vivo y accede directamente a iniciar sesión, registrar su organización o abrir su panel.

FIRST VIEWPORT: Barra superior estructural con estado del sistema y navegación directa; a la izquierda, titular directo sin kicker superior, propuesta de valor concisa y acciones primarias (`/login`, `/register`, `/profile`); a la derecha y extendiéndose a ancho completo, el tablero interactivo de Manifiesto y Ledger Multi-Almacén donde el usuario conmuta entre almacenes (`MTY-N01`, `GDL-C02`, `CDMX-S01`), simula una reserva o transferencia atómica en tiempo real y observa las filas afectadas resaltar su cambio de inventario sin perder identidad.

FORM: Tablero de Manifiesto Operativo y Ledger Interactivo en Vivo (posición #1 de nuestra lista fundamentada, enriquecido con la disciplina de tabla y pase segmentado de `vernacular-ephemera-boarding-pass-and-gate-board`; seed key `2ac115bb`).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
