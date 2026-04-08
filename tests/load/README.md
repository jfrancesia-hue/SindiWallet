# Tests de Carga — SindiWallet

Tests de rendimiento con [k6](https://grafana.com/docs/k6/).

## Instalación

```bash
# macOS
brew install k6

# Windows
choco install k6

# Docker
docker run --rm -i grafana/k6 run - <script.js
```

## Ejecución

```bash
# Smoke test — health endpoints
k6 run tests/load/health.js

# Transfers bajo carga
k6 run -e SENDER_ID=<id> -e RECEIVER_WALLET_ID=<id> tests/load/transfers.js

# QR payments
k6 run -e MERCHANT_ID=<id> -e AFFILIATE_ID=<id> tests/load/qr-payments.js

# Préstamos
k6 run -e AFFILIATE_ID=<id> tests/load/loans.js

# Workload mixto (producción simulada)
k6 run -e USER_IDS=id1,id2,id3 -e RECEIVER_WALLET_ID=<id> tests/load/mixed-workload.js
```

## Thresholds

| Métrica | Objetivo |
|---------|----------|
| p95 latencia | < 1.5s |
| p99 latencia | < 3s |
| Error rate | < 5% |
| Checks pass | > 90% |

## Pre-requisitos

1. API corriendo en modo test (`APP_ENV=test`)
2. Base de datos con seed data (`pnpm db:seed`)
3. IDs de usuarios/wallets del seed para las variables de entorno
