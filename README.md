# PG Dashboard

A **Property Management System (PMS)** for Paying Guest (PG) accommodations. It includes a Django REST API backend and a React + TypeScript frontend for managing properties, rooms, tenants, financials, and maintenance.

## Project structure

```
PG_DASHBOARD/
├── backend/                 # Django (PMS) API
│   ├── manage.py
│   ├── requirements.txt
│   ├── pms/                 # Project config
│   │   ├── settings/        # base, development, test, production
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── pms/apps/
│       ├── users/
│       ├── properties/
│       ├── tenants/
│       ├── financials/
│       ├── maintenance/
│       └── dashboard/
├── frontend/                # React + Vite + TypeScript
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── pages/
│       ├── components/
│       └── lib/
└── README.md
```

## Prerequisites

- **Backend:** Python 3.12+, PostgreSQL, Redis (for Celery)
- **Frontend:** Node.js 18+, npm or pnpm

## Backend setup

1. **Create and activate a virtual environment:**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate   # Linux/macOS
   # or: venv\Scripts\activate  # Windows
   ```

2. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Environment variables:**

   Create a `.env` file in `backend/` (or set variables in the shell). Example:

   ```env
   DEBUG=True
   SECRET_KEY=your-secret-key
   ALLOWED_HOSTS=localhost,127.0.0.1

   DB_NAME=pms_db
   DB_USER=pms_user
   DB_PASSWORD=pms_password
   DB_HOST=localhost
   DB_PORT=5432

   REDIS_URL=redis://localhost:6379/0

   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

   JWT_ACCESS_TOKEN_LIFETIME=15
   JWT_REFRESH_TOKEN_LIFETIME=10080
   ```

4. **Database:**

   Create the PostgreSQL database and user, then run:

   ```bash
   python manage.py migrate
   python manage.py createsuperuser   # optional
   ```

5. **Run the development server:**

   ```bash
   DJANGO_SETTINGS_MODULE=pms.settings.development python manage.py runserver 8001
   ```

   For tests (SQLite):

   ```bash
   DJANGO_SETTINGS_MODULE=pms.settings.test python manage.py runserver 8001
   ```

   API base: `http://127.0.0.1:8001/api/`. OpenAPI schema: `http://127.0.0.1:8001/api/schema/swagger-ui/`.

## Frontend setup

1. **Install dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Run the dev server:**

   ```bash
   npm run dev
   ```

   App runs at `http://localhost:3000` and proxies `/api` to the backend (default `http://127.0.0.1:8001`).

3. **Build for production:**

   ```bash
   npm run build
   npm run preview   # optional: preview production build
   ```

## Running both (dev)

- **Terminal 1 – backend:**  
  `cd backend && DJANGO_SETTINGS_MODULE=pms.settings.development python manage.py runserver 8001`

- **Terminal 2 – frontend:**  
  `cd frontend && npm run dev`

## Testing

- **Backend:** Uses pytest and test settings (SQLite). Example:

  ```bash
  cd backend
  DJANGO_SETTINGS_MODULE=pms.settings.test pytest
  ```

- **Frontend:** `npm run lint` for ESLint.

## Tech stack

| Layer    | Stack |
|----------|--------|
| Backend  | Django 4.x, Django REST Framework, Simple JWT, PostgreSQL, Celery, Redis, drf-spectacular |
| Frontend | React 19, TypeScript, Vite 7, React Router, Zustand, Recharts, Axios, Lucide React |

## License

Proprietary – Proaxon.
