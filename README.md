# SindiWallet

Billetera virtual B2B2C para sindicatos argentinos. Monorepo gestionado con **Turborepo + pnpm**.

## Stack Técnico

| Capa | Tecnología |
|------|-----------|
| **API** | NestJS 10.4 · Prisma 6.1 · Supabase Auth · Claude API (chatbot) |
| **Admin** | Laravel 11 · Blade · Alpine.js · Tailwind CSS |
| **Mobile** | React Native (Expo 54) · TypeScript · React Navigation |
| **Base de datos** | PostgreSQL 16 (Supabase) |
| **Real-time** | Socket.IO WebSocket |
| **Monorepo** | Turborepo 2.3 · pnpm 9.15 |
| **CI/CD** | GitHub Actions → Railway (API/Admin) + EAS Build (Mobile) |

## Estructura del Monorepo

```
sindiwallet/
├── apps/
│   ├── api/            # NestJS REST API + WebSocket
│   ├── mobile/         # React Native (Expo)
│   └── web-admin/      # Laravel admin panel
├── packages/
│   ├── config/         # TSConfig, ESLint, Prettier
│   ├── db/             # Prisma schema + migrations + seed
│   └── shared/         # Types, validadores Zod, utils
├── turbo.json
├── pnpm-workspace.yaml
└── docker-compose.yml
```

## Funcionalidades Principales

1. **Billetera virtual** con CVU y alias
2. **Transferencias** internas + CVU externo (BaaS)
3. **Pagos QR** con descuento para afiliados
4. **Cuotas sindicales** — fijas y porcentaje de salario, retención por nómina
5. **Micropréstamos** con scoring crediticio (sistema francés)
6. **Beneficios** para afiliados
7. **Chatbot IA** con Claude API
8. **Notificaciones** multi-canal — push, email, WhatsApp, in-app
9. **Panel admin** Laravel con CRUD completo
10. **Auditoría** completa de acciones

## Módulos API (19)

Auth · Organizations · Users · Wallets · Transactions · Payments (QR) · Dues · Loans (scoring) · Benefits · Merchants · Notifications · Reports · Audit · Imports · Chatbot (Claude AI) · WebSocket · Webhooks

## Pantallas Mobile (17)

Login · Register · Home Dashboard · Transfer · TransferCVU · QR Generate · QR Pay · Loan Simulator · Benefits Catalog · Dues History · Merchant List · Notifications · Cards · Payments Hub · Profile · Chatbot AI

## Requisitos Previos

- Node.js >= 20
- pnpm >= 9.15
- PostgreSQL 16 (o Docker)
- PHP 8.3 (para web-admin)

## Setup Local

```bash
# Clonar el repositorio
git clone https://github.com/jfrancesia-hue/SindiWallet.git
cd sindiwallet

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Generar Prisma client
pnpm db:generate

# Crear base de datos y aplicar schema
pnpm db:migrate

# (Opcional) Seed con datos de prueba
pnpm db:seed

# Iniciar desarrollo
pnpm dev
```

### Con Docker

Levanta API + Admin + PostgreSQL + Redis:

```bash
docker compose up -d
```

### Mobile

```bash
cd apps/mobile
npx expo start
```

## Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|:---------:|
| `DATABASE_URL` | Connection string de PostgreSQL | Sí |
| `DIRECT_URL` | Conexión directa a PostgreSQL | Sí |
| `SUPABASE_URL` | URL del proyecto Supabase | Sí |
| `SUPABASE_ANON_KEY` | Clave anónima de Supabase | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role | Sí |
| `ANTHROPIC_API_KEY` | API key de Claude | Sí |
| `JWT_SECRET` | Secreto para JWT | Sí |
| `ENCRYPTION_KEY` | Clave de encriptación (32 chars) | Sí |
| `APP_ENV` | `development` / `production` / `test` | Sí |
| `CORS_ORIGINS` | Orígenes CORS (comma-separated) | No |
| `BAAS_API_KEY` | API key del proveedor BaaS | No |
| `WHATSAPP_ACCESS_TOKEN` | Token de WhatsApp Business | No |
| `FIREBASE_PROJECT_ID` | Firebase para push notifications | No |

## Scripts Principales

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Inicia todos los servicios en modo desarrollo |
| `pnpm build` | Compila todos los packages |
| `pnpm test` | Ejecuta todos los unit tests |
| `pnpm lint` | Ejecuta linter en todos los packages |
| `pnpm db:generate` | Genera Prisma client |
| `pnpm db:migrate` | Ejecuta migraciones |
| `pnpm db:seed` | Seed con datos de prueba |
| `pnpm db:migrate:deploy` | Aplica migraciones en producción |
| `pnpm clean` | Limpia artefactos de build |

## Tests

- **56 unit tests** (Jest) — 8 suites
- **7 suites E2E** (supertest) — auth, wallets, transactions, QR, loans, dues, full-flow
- **Shared validators** (Vitest)

```bash
pnpm test
```

## Documentación API

Swagger UI disponible en desarrollo:

```
http://localhost:3000/api/docs
```

## Arquitectura

```
Mobile App ──→ NestJS API ──→ PostgreSQL (Supabase)
                   │
                   ├── Supabase Auth (JWT)
                   ├── Claude API (Chatbot)
                   ├── BaaS — Bind/Pomelo (pagos)
                   ├── Firebase (push notifications)
                   ├── WhatsApp Business API
                   └── Socket.IO (real-time)

Laravel Admin ──→ NestJS API
```

## CI/CD

- **CI**: GitHub Actions — lint → unit tests → E2E tests (PostgreSQL) → build
- **Deploy**: Automático en push a `main` vía Railway (API + Admin) y EAS Build (Mobile)

## Licencia

Privado — Todos los derechos reservados.
