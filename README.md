# PG Dashboard

A full-stack **Property Management System (PMS)** designed specifically for Paying Guest (PG) and hostel accommodations. 
Manage properties, tenants, bookings, financials, and complaints in one unified platform.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite 7, Zustand, Recharts, Lucide React
- **Backend:** Django 6.x, Django REST Framework, Simple JWT, PostgreSQL

## 🚀 Quick Start (Development)

Ensure you have **Python 3.12+**, **Node.js 18+**, and **PostgreSQL** installed.

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run migrations (ensure your PostgreSQL DB is running)
python manage.py migrate

# Start the Django development server
DJANGO_SETTINGS_MODULE=pms.settings.development python manage.py runserver 8001
```
*API runs at `http://127.0.0.1:8001/api/`*

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start the Vite development server
npm run dev
```
*App runs at `http://localhost:3000`*

## 📁 Project Structure

- `/backend` - Django REST API, managing models, authentication, and core business logic.
- `/frontend` - React single-page application consuming the API and providing the user interface.

## 📄 License
Proprietary – Proaxon.
