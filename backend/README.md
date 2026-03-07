# ExpenseVision Backend (FastAPI + Supabase)

## 1. Supabase setup

1. **Create a project** at [supabase.com](https://supabase.com) → New project.
2. **Get API keys**: Project Settings → API  
   - **Project URL** → `SUPABASE_URL`  
   - **anon public** → `SUPABASE_ANON_KEY` (for client apps)  
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (backend only; keep secret)
3. **Create the `expenses` table**: SQL Editor in Supabase dashboard, run:

```sql
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  merchant text not null,
  amount decimal(12,2) not null,
  category text,
  receipt_date date,
  notes text,
  created_at timestamptz default now()
);

-- Optional: enable Row Level Security (RLS) and add policies later
alter table public.expenses enable row level security;
```

## 2. Local setup

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env and set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
```

## 3. Run the API

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

- API: http://127.0.0.1:8000  
- Docs: http://127.0.0.1:8000/docs  

## 4. Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/expenses` | List expenses |
| GET | `/api/expenses/{id}` | Get one expense |
| POST | `/api/expenses` | Create expense (body: `merchant`, `amount`, `category`, etc.) |

**Layout:** `app/` contains `main.py`, `routers/`, `services/` (business logic), and `schema/` (Pydantic models). Add new routers under `app/routers/`, services under `app/services/`, and schemas under `app/schema/`; register routers in `app/main.py`.
