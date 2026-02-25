# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
Full-stack Property Management System (PMS): Django REST backend + React/Vite frontend + React Native (Expo) mobile app. See `README.md` for tech stack.

### Services

| Service | Required | Notes |
|---------|----------|-------|
| Backend (Django) | Yes | API on port 8001 |
| Frontend (React/Vite) | Yes | Dev server on port 3000, proxies `/api` to backend |
| PostgreSQL | For dev | Test settings use SQLite (no PG needed for tests) |
| Redis | Optional | Used by Celery; not required for core dev/test |
| Mobile (Expo) | Optional | React Native app in `mobile/`; type-check with `npx tsc --noEmit` |

### Backend

- **Virtualenv**: `backend/venv` (Python 3.12). Activate with `source backend/venv/bin/activate`.
- **Run with test settings (SQLite, no PG)**: `DJANGO_SETTINGS_MODULE=pms.settings.test python manage.py runserver 8001` from `backend/`.
- **Run with dev settings (needs PG)**: `DJANGO_SETTINGS_MODULE=pms.settings.development python manage.py runserver 8001` from `backend/`.
- **Lint**: `ruff check pms/` from `backend/`. Pre-existing lint warnings exist in non-maintenance apps.
- **Tests**: `DJANGO_SETTINGS_MODULE=pms.settings.test python -m pytest` from `backend/`. Existing test files (`test_room.py`, `test_occupancy_sync.py`, `test_bed_recreation.py`) have pre-existing collection errors (module-level DB access without `django_db` mark).
- **Django checks**: `DJANGO_SETTINGS_MODULE=pms.settings.test python manage.py check` from `backend/`.
- **Migrations**: `DJANGO_SETTINGS_MODULE=pms.settings.test python manage.py makemigrations && python manage.py migrate` from `backend/`.

### Frontend

- **Package manager**: npm (lockfile: `package-lock.json`).
- **Lint**: `npx eslint .` from `frontend/`. Pre-existing lint errors exist (mostly `no-explicit-any`).
- **Type check**: `npx tsc -b` from `frontend/`. One pre-existing error (unused import in `HomeSummaryBar.tsx`).
- **Dev server**: `npm run dev` from `frontend/` (port 3000).
- **Build**: `npm run build` from `frontend/`.

### Mobile (React Native / Expo)

- **Package manager**: npm (no lockfile yet; use `npm install` from `mobile/`).
- **Type check**: `npx tsc --noEmit` from `mobile/`.
- **Screens**: `mobile/src/screens/` — 16 screen components organized by feature (auth, home, tenants, money, property, utilities, root-level).
- **Stores**: Zustand stores at `mobile/src/stores/` (authStore, propertyStore).
- **API**: Axios client at `mobile/src/lib/api.ts` with JWT auth interceptors. Points to `http://10.0.2.2:8001` (Android emulator -> host).
- **Theme**: Dark theme colors at `mobile/src/theme/colors.ts`.
- **Dev server**: `npx expo start` from `mobile/` (requires Expo Go or emulator).

### Gotchas
- The backend `manage.py` defaults to `pms.settings.development` which requires PostgreSQL. Use `pms.settings.test` for SQLite-based development without PG.
- `pytest.ini` uses `pms.settings.development` by default; override with `DJANGO_SETTINGS_MODULE=pms.settings.test` env var when PG is unavailable.
- JWT auth required for all API endpoints. Login at `POST /api/v1/auth/login/` with `{"email":"...","password":"..."}`.
- Mobile screens use `any` for navigation props (no strict typed navigator yet). API responses are normalized with `res.data.results || res.data || []` to handle both paginated and non-paginated endpoints.
