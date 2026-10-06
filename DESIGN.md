---
name: WareOps
description: Control operativo de inventario y almacenes multi-tenant con precisión industrial y cero degradados
colors:
  carbon-ink: "#09090b"
  paper-white: "#ffffff"
  technical-stone: "#fafafa"
  slate-muted: "#f4f4f5"
  steel-text: "#52525b"
  hairline-border: "#e4e4e7"
  control-border: "#d4d4d8"
  status-verified: "#047857"
  status-reserved: "#b45309"
  status-danger: "#dc2626"
typography:
  display:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.md}"
    padding: "6px 14px"
  button-outline:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.md}"
    padding: "6px 14px"
  button-secondary:
    backgroundColor: "{colors.slate-muted}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.md}"
    padding: "6px 14px"
  card-structural:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: WareOps

## Overview

**Creative North Star: "The Industrial Ledger & Dispatch Manifest"**

WareOps se diseña como un instrumento de precisión logística y contable. Cada superficie prioriza la lectura inmediata de existencias (`Físico = Reservado + Disponible`), códigos SKU, ubicaciones de pasillo/rack, cabeceras de aislamiento (`X-Organization-Id`) y autorizaciones por rol. La interfaz rechaza cualquier adorno superfluo en favor de paneles sólidos de alto contraste, líneas divisorias arquitectónicas de 1px y tipografía con métricas tabulares verificables.

El sistema rechaza de forma absoluta los degradados de color (lineales, radiales o en texto), las sombras flotantes difusas sobre bordes delgados (_ghost cards_), los fondos beige genéricos y los pequeños subtítulos decorativos (_kickers/eyebrows_) encima de los titulares.

**Key Characteristics:**

- Superficies sólidas sin degradados: contraste directo entre papel blanco (`#ffffff`), piedra técnica (`#fafafa`) y carbón (`#09090b`).
- Estructura gobernada por bordes continuos de 1px (`#e4e4e7`) y tablas de libro mayor en lugar de mosaicos de tarjetas iguales.
- Uso estricto de fuente monoespaciada (`Geist Mono` con `tabular-nums`) únicamente para SKUs, cantidades, tokens, cabeceras HTTP y códigos de permiso.
- Estados operativos explícitos para reservas atómicas, alertas de stock mínimo y bloqueos por rol RBAC.

## Colors

Paleta acromática de alto contraste industrial donde el color cromático se reserva exclusivamente para señales semánticas de estado operativo.

### Primary

- **Carbon Ink** (`#09090b`): Color de autoridad principal para acciones primarias, cabeceras de manifiesto operativo, paneles técnicos de alto contraste y anillos de foco.

### Secondary

- **Status Verified** (`#047857`): Indicador puntual de sistema activo y confirmación de integridad transaccional.
- **Status Reserved** (`#b45309`): Señal de advertencia operativa para existencias bajo mínimo o filas con reserva atómica recién aplicada.
- **Status Danger** (`#dc2626`): Acciones destructivas como revocación de invitaciones, desactivación de membresías y errores de validación.

### Neutral

- **Paper White** (`#ffffff`): Superficie principal para tablas de inventario, formularios y contenedores estructurales.
- **Technical Stone** (`#fafafa`): Lienzo de fondo de aplicación y cabeceras secundarias de tabla.
- **Slate Muted** (`#f4f4f5`): Superficie para controles secundarios y estados deshabilitados.
- **Steel Text** (`#52525b`): Texto secundario y descriptivo calibrado para superar siempre la relación de contraste WCAG AA (≥ 4.5:1 sobre blanco).
- **Hairline Border** (`#e4e4e7`): Regla divisoria estructural de 1px entre módulos, filas de inventario y celdas de manifiesto.
- **Control Border** (`#d4d4d8`): Contorno nítido de 1px para campos de entrada, selectores y botones secundarios.

### Named Rules

**The Zero-Gradient Rule.** Ninguna superficie, botón, insignia, borde o texto puede utilizar `linear-gradient` ni `radial-gradient`. Toda jerarquía se construye con bloques de color sólido y contraste tipográfico.

**The Semantic-Only Color Rule.** El verde esmeralda, el ámbar y el rojo nunca se usan como decoración; sólo aparecen cuando comunican el estado real de un almacén, un umbral de stock mínimo o el resultado de una transacción.

## Typography

**Display Font:** Geist Sans (with `ui-sans-serif, system-ui, sans-serif`)
**Body Font:** Geist Sans (with `ui-sans-serif, system-ui, sans-serif`)
**Label/Mono Font:** Geist Mono (with `ui-monospace, SFMono-Regular, monospace`)

**Character:** Combinación suiza-industrial donde Geist Sans aporta claridad editorial en encabezados e instrucciones operativas, mientras Geist Mono garantiza alineación vertical exacta en cifras de inventario y códigos técnicos.

### Hierarchy

- **Display** (`600`, `2.75rem`, `1.12` line-height, `-0.03em` tracking): Titular principal de superficie sin _kicker_ superior.
- **Headline** (`600`, `1.5rem`, `1.25` line-height, `-0.02em` tracking): Encabezados de sección operativa y vistas principales del panel (`/profile`, `/members`).
- **Title** (`600`, `1.125rem`, `1.35` line-height, `-0.015em` tracking): Títulos de contenedores estructurales y bloques de configuración.
- **Body** (`400`, `1rem`, `1.6` line-height): Explicaciones operativas y descripciones con ancho de lectura controlado entre `60ch` y `68ch`.
- **Label** (`500`, `0.75rem`, `1.4` line-height, `tabular-nums`): Códigos SKU (`SKU-VAL-4020`), ubicaciones (`P01-R04-N02`), permisos (`inventory:write`), cabeceras (`X-Organization-Id`) y cantidades.

### Named Rules

**The No-Kicker Rule.** Ningún encabezado (`h1`, `h2`, `h3`) lleva una etiqueta en mayúsculas o _eyebrow_ encima. El titular carga con su propio peso jerárquico.

**The Honest Monospace Rule.** `Geist Mono` se aplica exclusivamente a datos tabulares, identificadores, códigos SKU, rutas, tokens y ecuaciones de stock; nunca como adorno estético en párrafos o navegación general.

## Layout

El diseño se organiza sobre un contenedor central de `72rem` (`max-w-6xl`) con relleno lateral adaptable (`16px` en móvil, `24px` en escritorio) y divisiones internas gobernadas por tablas y paneles de borde continuo. Las páginas operativas priorizan vistas tabulares escaneables con barras de filtro compactas en línea y encabezados de contexto persistentes.

## Elevation & Depth

El sistema es **plano y arquitectónico por defecto**. La separación espacial se logra mediante capas tonales sólidas (`#fafafa` sobre `#ffffff`, y bloques de manifiesto en `#09090b`) y bordes estructurales de `1px solid #e4e4e7`, prescindiendo por completo de sombras difusas.

### Named Rules

**The Single-Declaration Depth Rule.** La elevación de un contenedor se declara mediante su borde de 1px y su contraste de superficie, nunca combinando un borde de 1px con una sombra flotante difusa.

## Shapes

Geometría sobria y rectilínea con radios contenidos: `4px` (`rounded-sm`) para insignias técnicas y bloques de código, `6px` (`rounded-md`) para botones, campos de texto y selectores, y `8px` (`rounded-lg`) para paneles estructurales y tableros de inventario.

## Components

### Buttons

- **Shape:** Esquinas técnicas de radio medio (`6px`).
- **Primary:** Fondo Carbon Ink (`#09090b`), texto Paper White (`#ffffff`), borde sólido de 1px y micro-respuesta táctil al presionar (`scale(0.985)`).
- **Hover / Focus:** Transición limpia de color de fondo (`150ms`) y anillo de foco visible de `2px` en `#09090b` con desplazamiento de `2px`.
- **Secondary / Outline / Ghost:** Outline utiliza fondo `#ffffff` con borde `#d4d4d8`; Secondary emplea `#f4f4f5` para acciones auxiliares en tablas.

### Chips

- **Style:** Insignias rectangulares compactas (`4px` radius, `11px` font-size) con borde de 1px.
- **State:** `default` en `#09090b` para estados confirmados, `outline` en `#ffffff` con borde `#d4d4d8` para metadatos y roles, y variante ámbar (`#fffbeb` con borde `#fbbf24` y texto `#78350f`) para alertas de stock bajo mínimo.

### Cards / Containers

- **Corner Style:** Radio contenido de `8px`.
- **Background:** Paper White (`#ffffff`) o Carbon Ink (`#09090b`) para bloques de manifiesto y especificaciones técnicas.
- **Shadow Strategy:** Sin sombra (`box-shadow: none`).
- **Border:** `1px solid #e4e4e7` (`#09090b` en tableros de manifiesto principal).
- **Internal Padding:** `20px` en móvil, `24px` en escritorio, con cabeceras separadas por línea hairline cuando contienen tablas o formularios densos.

### Inputs / Fields

- **Style:** Altura uniforme de `36px` (`32px` en barras de filtro de tabla), borde `1px solid #d4d4d8`, fondo `#ffffff`, radio `6px` y `placeholder` en `#71717a` (contraste ≥ 4.5:1).
- **Focus:** Cambio de borde a `#09090b` acompañado de anillo sólido de `1px` en `#09090b`.
- **Error / Disabled:** Borde y anillo en `#dc2626` cuando `aria-invalid="true"`; fondo `#f4f4f5` en estado deshabilitado.

### Navigation

- Barra superior fija de `56px` (`h-14`) con fondo `#ffffff` y borde inferior `1px solid #e4e4e7`. En rutas autenticadas incorpora el selector de organización activa (`OrganizationSwitcher`), indicador de rol RBAC y pestañas con estado activo en `#09090b`.

### Live Warehouse Manifest & Ledger Board

- Componente insignia de la superficie principal: combina una cabecera segmentada de 4 celdas en `#09090b` (Organización, Almacén activo, Rol RBAC e Invariante contable `Físico = Reservado + Disponible`), barra de conmutación rápida de ubicación/rol, tabla de existencias con mutaciones atómicas en vivo y pie de auditoría transaccional con clave de idempotencia.

## Do's and Don'ts

### Do:

- **Do** mantener una relación de contraste mínima de `4.5:1` en todo texto secundario y `placeholder` usando `#52525b` o `#71717a` sobre fondos claros y `#d4d4d8` sobre `#09090b`.
- **Do** alinear todas las cantidades de inventario (`Físico`, `Reservado`, `Disponible`) a la derecha con `font-mono` y `tabular-nums`.
- **Do** reflejar siempre el estado de los permisos RBAC en los controles operativos (deshabilitando o indicando el permiso requerido cuando el rol activo es de sólo lectura).

### Don't:

- **Don't** usar degradados de color (`linear-gradient`, `radial-gradient`) en fondos, botones, bordes o textos.
- **Don't** colocar _kickers_ o etiquetas en mayúsculas encima de los encabezados `h1`, `h2` o `h3`.
- **Don't** anidar tarjetas dentro de tarjetas ni usar bordes laterales gruesos (`border-left` > 1px) en alertas o llamadas.
