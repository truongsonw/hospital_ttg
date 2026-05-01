# HospitalTTG Repository Instructions

## Source of truth

For any task, verify current behavior from the codebase first:

- Backend truth: `HospitalTTG/HospitalTTG.slnx`, `Directory.Build.props`, `Directory.Packages.props`, project references, `WebAPI/Program.cs`, controllers, `Contracts.*`, `Modules.*`, `Shared.*`, EF configurations, and SQL scripts.
- Frontend truth: `hospital-ttg-fe/package.json`, `react-router.config.ts`, `vite.config.ts`, `tsconfig.json`, `components.json`, `app/routes.ts`, `app/lib/api.ts`, `app/services`, and `app/types`.
- Database truth: EF entities/configurations plus current manual SQL scripts and live database metadata when available.
- Security truth: current auth, CORS, upload/download, token, and public endpoint code. Redact secret values in all outputs.

## Project identity

HospitalTTG is a hospital public website plus admin dashboard.

Architecture:

- Backend: ASP.NET Core .NET 10 Web API, modular monolith.
- Frontend: React 19.2 with React Router 7.14 in SSR/full-stack mode.
- Database: SQL Server, single database named `HospitalTTG`, schema `dbo`.
- ORM: EF Core 10.0.
- Database changes: manual idempotent SQL scripts only. Do not use EF Core migrations.
- Auth: JWT Bearer with BCrypt password hashing and refresh-token rotation.
- Files: local disk storage under `WebAPI/uploads`.
- API boundary: REST JSON between frontend and backend.
- There is no AI/ML module and no multi-tenant architecture.
Current backend module inventory: `Article`, `Auth`, `Booking`, `Contact`, `Doctor`, `Mail`, `Storage`, and `System`.

## Repository layout

- `HospitalTTG/`: backend .NET solution.
- `hospital-ttg-fe/`: frontend React Router app.
- `docs/`: internal notes.

## Operating rules for Codex

- Read the nearest `AGENTS.md` and verify current behavior from code/config before changes.
- Prefer small, reviewable diffs.
- Do not introduce CQRS, MediatR, EF migrations, Redux, Zustand, TanStack Query, external auth providers, cloud storage, or new deployment platforms unless explicitly requested.
- Do not change backend API contracts and frontend service/type code independently. Treat them as one contract checkpoint.
- Do not let multiple subagents edit the same file concurrently.
- Do not commit secrets, connection strings, JWT keys, refresh tokens, or production credentials.
- Existing secret-bearing files such as `appsettings*.json` or `dab-config.json` must be reported with redacted values only. Prefer environment variables or user-secrets for new secret configuration.
- Do not add database foreign key constraints unless explicitly requested.
- Do not add EF navigation properties; relationships are represented by Guid columns and enforced in services.
- User-facing frontend text should be Vietnamese.
- If you touch public mutation endpoints, consider auth intent, spam/rate limiting/CAPTCHA, validation, email-spam impact, and PII exposure. Current public-sensitive paths include booking/contact create, auth login/refresh/register, content view-count, and any currently anonymous Article mutation.

## Backend dependency rules

- `Shared.Abstractions` should have no HospitalTTG project references.
- `Shared.Infrastructure` should project-reference only `Shared.Abstractions`; framework/package references for ASP.NET Core and EF Core are expected.
- `Contracts.{Module}` contains public DTOs, interfaces, and enums only.
- `Contracts.Storage` currently has an ASP.NET Core framework dependency because upload contracts use `IFormFile`; do not expand that exception casually.
- `Modules.{Module}` may reference its own Contracts project, Shared projects, and Contracts from other modules when needed.
- `Modules.{Module}` must not reference `Modules.{OtherModule}` directly.
- `WebAPI` is the composition root and may reference modules and infrastructure.
- `Booking` and `Contact` currently depend on `Contracts.Mail` for notification behavior.

## Contract checkpoint for cross-boundary work

Before implementing a feature that crosses backend and frontend, write down:

- Endpoint path and HTTP method.
- Auth requirement and role/policy requirement.
- Request DTO.
- Response DTO.
- Whether response is `ApiResponse<T>`, `PagedResponse<T>`, or raw DTO.
- ProblemDetails/validation error behavior.
- Frontend service function.
- Frontend TypeScript type.
- Migration or SQL script impact.

Known debt: response wrappers are inconsistent. Some controllers return `ApiResponse<T>` or `PagedResponse<T>`, while some Article content/category/media paths may return raw DTOs or raw paged shapes. Frontend code must verify each endpoint shape and choose `apiFetch`, `apiFetchRaw`, or `apiFetchData` accordingly.

## Database rules

- SQL Server only.
- Schema `dbo` only.
- Table names are PascalCase plural.
- Column names match C# property names in PascalCase.
- Primary key convention: `Id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()`.
- Timestamp columns should be `DATETIME2` UTC where present, but current entities use mixed timestamp property names. Do not assume one timestamp shape without checking the entity/configuration.
- Scripts must be idempotent with `IF NOT EXISTS`, `IF COL_LENGTH(...) IS NULL`, or equivalent guards.
- Do not drop data or old tables unless the user explicitly asks and the migration plan includes backup/rollback notes.
- If an entity/configuration changes, update or create a matching manual SQL script.
- Existing SQL scripts may be stale or destructive. Audit `create-database.sql`, every `migrate-*.sql`, EF configurations, and live metadata before reusing or changing them.

## Validation commands

Backend:

```bash
cd HospitalTTG
dotnet restore HospitalTTG.slnx
dotnet build HospitalTTG.slnx --no-restore
```

Frontend:

```bash
cd hospital-ttg-fe
npm ci
npm run typecheck
npm run build
```

There are no backend test projects and no frontend lint/test scripts at the time of writing. If those are added later, run the relevant scripts after touching those areas.

Runtime smoke checks, when requested:

```bash
cd HospitalTTG/WebAPI
dotnet run --launch-profile http
# expected backend: http://localhost:5020

cd hospital-ttg-fe
npm run dev
# expected frontend: http://localhost:5173
```

## Done criteria

A task is done only when the response includes:

- Files changed.
- Behavior changed.
- API contract changes, if any.
- Database script changes, if any.
- Security and PII risks considered.
- Validation commands run or a clear explanation why they were not run.
- Remaining TODOs or manual deployment steps.

## Subagent workflow guidance

Use subagents for large, parallelizable work. Suggested custom agents:

- `codebase_explorer`: read-only code path mapping.
- `api_contract`: backend/frontend contract audit.
- `backend_module`: backend implementation.
- `frontend_integration`: frontend implementation.
- `database_migration`: SQL and EF schema consistency.
- `security_auth`: auth and security review.
- `qa_test`: build/test validation and test additions.
- `devops_release`: Docker, CI, environment, health checks.
- `documentation`: docs and instruction updates.
- `reviewer_gatekeeper`: final read-only review.

When spawning agents, give each agent non-overlapping files and ask the parent to wait for all results before merging conclusions.
Agents must treat code/config as source of truth and call out stale documentation instead of copying it forward.
