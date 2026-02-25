# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
PG Dashboard — a full-stack Property Management System (PMS) for PG/hostel accommodations. Backend is Django REST Framework with PostgreSQL; frontend is React 19 + TypeScript + Vite.

### Backend
- Python venv lives at `backend/venv/`. Activate with `source backend/venv/bin/activate`.
- Dependencies: `pip install -r backend/requirements.txt`
- **Test settings** (`pms.settings.test`) use SQLite — no PostgreSQL required for running the dev server, migrations, or tests locally.
- Run dev server: `DJANGO_SETTINGS_MODULE=pms.settings.test python manage.py runserver 8001` (from `backend/`)
- Run Django checks: `DJANGO_SETTINGS_MODULE=pms.settings.test python manage.py check`
- Lint: `ruff check pms/` (from `backend/`)
- Migrations: `DJANGO_SETTINGS_MODULE=pms.settings.test python manage.py makemigrations && python manage.py migrate`
- pytest.ini is at `backend/pytest.ini`; existing test files have pre-existing collection errors (module-level DB queries).

### Frontend
- Uses npm (lockfile: `package-lock.json`).
- `npm install` then `npm run dev` (from `frontend/`).
- Lint: `npm run lint` (from `frontend/`). Pre-existing ESLint/TS errors exist in the codebase.
- Build: `npm run build` — currently fails due to pre-existing TS error in `HomeSummaryBar.tsx`.

### Key caveats
- The development settings (`pms.settings.development`) require a running PostgreSQL instance. Use `pms.settings.test` for local dev without external dependencies.
- The `docker/docker-compose.yml` provides PostgreSQL + Redis if needed, but is not required when using test settings.
- The maintenance app URL prefix is `/api/v1/maintenance/` — all endpoints are property-scoped: `/api/v1/maintenance/properties/<uuid:property_pk>/...`.
