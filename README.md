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

## 🧪 Testing & Data Seeding

We use `pytest` for backend testing and custom management commands for seeding development databases.

### Database Seeding
To quickly spin up a test environment with a property, 3 floors, 12 rooms, 30 beds, and ~20 realistic tenants (including active tenants, future bookings, dues, and payments):

```bash
cd backend
python3 manage.py seed_test_data
```
*Note: This command will clear existing data for the selected property before seeding.*

### Running the Test Suite
The tenant lifecycle (including automatic booking-to-active conversion, manual acceptance/cancellation, and financial ledgers) is rigorously tested. 

To run the full suite:
```bash
cd backend
pytest pms/apps/tenants/tests/test_tenant_lifecycle.py -v
```

## 🔄 Core Flows: Tenant Lifecycle

1. **New Tenants vs Future Bookings:**
   - If a tenant is added with a `move_in` date that is **today or in the past**, they are immediately created with `status="active"` and their bed is `occupied`.
   - If a tenant is added with a `move_in` date in the **future**, they are created as `status="booking_pending"` and their bed is `reserved`.
2. **Auto-Conversion:**
   - The system automatically converts future bookings into active tenants. When the backend retrieves the tenant list, any booking whose `move_in` date has arrived is automatically promoted to `active`, and their bed is marked `occupied`.
3. **Checkout:**
   - When a tenant checks out, they are archived into the `OldTenant` table, and their bed is immediately freed up as `vacant`.

## 📄 License
Proprietary – Proaxon.
