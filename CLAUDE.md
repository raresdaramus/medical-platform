# MediConnect — Developer Guide for Claude

## Project Overview
Medical platform connecting patients with their family doctors.
Microservices architecture, deployed via Docker Compose.

## Architecture
- **Traefik** — reverse proxy / API gateway (port 80)
- **auth-service** (port 8081) — JWT auth, GDPR consents
- **user-service** (port 8082) — patients, doctors, schedules, permissions
- **consultation-service** (port 8083) — consultations, ontology, medical records
- **frontend** (port 3000) — React + Vite + TypeScript + TailwindCSS
- **3x PostgreSQL** — one DB per service, never shared

## Routing (Traefik)
/api/auth/**           → auth-service:8081
/api/users/**          → user-service:8082
/api/consultations/**  → consultation-service:8083
/                      → frontend:3000

## Key Conventions
- UUIDs as primary keys everywhere
- All timestamps in UTC
- DTOs as Java records
- MapStruct for entity↔DTO mapping
- Flyway for DB migrations (src/main/resources/db/migration/)
- RestClient (Spring 6) for inter-service calls, never Feign
- JWT validated by calling auth-service GET /api/auth/validate
- Response envelope: { data, status } success / { error: { code, message }, status } error
- CORS allowed for http://localhost:3000

## Inter-service Communication
- user-service calls auth-service to validate JWT
- consultation-service calls auth-service to validate JWT
- consultation-service calls user-service /internal/** for patient/doctor data
- Internal endpoints are NOT exposed via Traefik

## Running Locally
docker-compose up --build
Traefik dashboard: http://localhost:8080

## Testing a Change
1. Rebuild only the changed service:
   docker-compose up --build <service-name>
2. Check logs:
   docker-compose logs -f <service-name>

## Database Access (local dev)
postgres-auth:    localhost:5432  db=auth_db     user=auth_user
postgres-users:   localhost:5433  db=users_db    user=users_user
postgres-consult: localhost:5434  db=consult_db  user=consult_user

## What NOT to do
- Do not add Spring Cloud Gateway or Eureka
- Do not share databases between services
- Do not store JWT in localStorage (memory only on frontend)
- Do not use Long as primary key, always UUID