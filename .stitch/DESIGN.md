# SindiWallet — Design System (Stitch)

## Theme
- **Mode**: Dark (primary background)
- **Background**: `#0D1117` → `#1A1A2E`
- **Surface**: `rgba(255,255,255,0.05)` con blur backdrop
- **Card bg**: `#1C2333` con borde `rgba(255,255,255,0.08)`

## Colors
- **Primary/Teal**: `#00A89D` (botones, estados positivos, tab activo)
- **Teal gradient**: `#00A89D` → `#00D4AA`
- **Accent/Orange**: `#F58220` (alertas, pendientes, badges warning)
- **Text primary**: `#FFFFFF`
- **Text secondary**: `#8B95A5`
- **Text muted**: `#5A6577`
- **Success/Pagado**: `#00A89D`
- **Error**: `#E53935`
- **Card highlight**: Navy gradient `#1F2B6C` → `#0D1117`

## Typography
- **Font**: Inter (or system SF Pro / Roboto)
- **Balance amount**: 32-40px, Bold
- **Section titles**: 18-20px, SemiBold
- **Body**: 14-16px, Regular
- **Caption/labels**: 12px, Medium
- **Currency**: Locale es-AR format ($247.850,00)

## Spacing & Radius
- **Card radius**: 16-20px
- **Button radius**: 12-16px (full-round for primary CTAs)
- **Input radius**: 12px (pill shape for login inputs)
- **Padding cards**: 16-20px
- **Screen padding**: 16-20px horizontal

## Components

### Balance Card (Home)
- Full-width gradient card (dark → teal subtle)
- Large balance text centered
- Small "+$12.500 este mes" in green below
- 4 quick-action circles below: Transferir, Cobrar, Pagar QR, Más

### Quick Actions Grid
- 4 circular icons with labels
- Icon bg: teal/gradient circle
- Label below: 12px, white

### Cuotas Card (Home)
- Circular progress indicator (75%, teal stroke)
- "Próximo vencimiento" date
- "Aporte Sindical" label

### Accesos Rápidos
- Horizontal row of icon + label (Servicios, Recargas, Beneficios, Sindicato)
- Small square icons with rounded bg

### Transaction Item
- Left: icon or avatar
- Center: description + subtitle
- Right: amount (green for credit, white for debit) + date

### Tab Bar
- 4-5 tabs: Inicio, Tarjetas, Pagos, Perfil (varies by screen)
- Active: teal icon + label
- Inactive: gray icon + label
- Background: `#0D1117`

### Login Screen
- Centered logo "SW" with glow effect
- "Bienvenido" title
- Pill-shaped inputs with left icon
- Teal full-width button "Ingresar"
- Fingerprint icon for biometric
- "Regístrate" link at bottom

### Transfer Screen
- Search bar at top
- Recent contacts: horizontal scrollable circles with initials
- Large centered amount "$0"
- Custom numeric keypad (dark buttons, rounded)
- "Continuar" button at bottom

### Loan Simulator
- Tab toggle: Simular / Mis Préstamos
- Amount slider with min/max labels
- Cuotas chips (3,6,9,12,18,24) - selected: teal bg
- Result card: monthly payment + TNA + score badge
- "Solicitar Préstamo" button

### Benefits Catalog
- Hero banner: full-width image card with overlay text + amount
- "Explorar" button on banner
- Categories grid 2x2: icon + name + badge (discount or amount)

### Cuotas History
- Year tabs (2024, 2025, 2026)
- Summary: total contributed + progress bar (9/12)
- Monthly grid: 2 columns, each month card with amount + status badge
- Badge "Pagado" (teal) / "Pendiente" (orange)

### QR Payment Confirmation
- Merchant logo + name
- Discount badge "Descuento Afiliado 15%"
- Strikethrough original price
- Large final amount
- "Confirmar pago" button

### Merchants Map
- Dark map tiles
- Colored pins by category
- Search bar + filter chips
- Bottom list: merchant cards with distance + discount %

### Profile
- Circular avatar (large, centered)
- Name + organization
- Stats row: Años | Total Contribuido | Puntaje
- Menu list with chevrons (Datos Personales, Seguridad, etc.)
- "Cerrar Sesión" at bottom (red/orange text)

### Notifications
- Filter tabs: Todas, Movimientos, Cuotas, Sindicato
- Grouped by date (Hoy, Ayer)
- Each notification: icon (colored circle) + title + preview text + time
- Unread indicator dot

## Screens (10)
1. acceso_sindiwallet — Login
2. sindiwallet_home_dashboard — Home
3. transferir_fondos — Transfer
4. simulador_de_pr_stamos — Loan Simulator
5. cat_logo_de_beneficios — Benefits Catalog
6. historial_de_cuotas — Dues History
7. confirmaci_n_pago_qr — QR Payment Confirmation
8. mapa_de_comercios — Merchants Map
9. perfil_de_usuario — Profile
10. notificaciones_sindiwallet — Notifications
