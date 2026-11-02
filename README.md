# Culinary Magic 🍲

An AI-powered recipe generator. Describe what you want to cook — ingredients on hand, cuisine,
time, dietary needs — and Culinary Magic asks Groq's LLM to write you a complete recipe, which
you can save to your personal cookbook.

## Tech stack

- **Frontend:** Angular 19 (standalone components), TypeScript, hand-rolled CSS
- **Backend:** Python 3, FastAPI
- **AI:** Groq API (REST, OpenAI-compatible chat completions with JSON mode)
- **Database:** PostgreSQL, via SQLAlchemy 2.0 (async) + `asyncpg` + Alembic migrations
- **Auth:** JWT access/refresh tokens in httpOnly cookies, bcrypt password hashing, double-submit CSRF

## Project layout

```
culinary-magic/
├── backend/            FastAPI app (see backend/app)
└── frontend/           Angular app (see frontend/src/app)
```

## Prerequisites

- Python 3.11+ (developed/tested on 3.14)
- Node.js 20+ and npm
- A local PostgreSQL server running, with a `postgres` superuser you know the password for
- A Groq API key ([console.groq.com/keys](https://console.groq.com/keys))

## Backend setup

1. Create and activate a virtual environment, then install dependencies:

   ```bash
   cd backend
   python -m venv venv
   ./venv/Scripts/activate   # Windows
   pip install -r requirements.txt
   ```

2. Copy `.env.example` to `.env` and fill in your real values:

   ```bash
   cp .env.example .env
   ```

   Edit `backend/.env`:
   - `DATABASE_URL` — set the password for your local `postgres` user
   - `GROQ_API_KEY` — your Groq API key
   - `GROQ_MODEL` — defaults to `openai/gpt-oss-20b`. Available models differ per account/region;
     check yours with `GET https://api.groq.com/openai/v1/models` (with your API key as a Bearer
     token) if generation fails with a "model not found" error
   - `JWT_SECRET_KEY` — any long random string (e.g. `python -c "import secrets; print(secrets.token_urlsafe(48))"`)

   **`backend/.env` is gitignored and must never be committed.**

3. Create the `culinary_magic` database (safe to re-run — it no-ops if the database already exists):

   ```bash
   python -m app.db.create_db
   ```

4. Apply the database migrations:

   ```bash
   alembic upgrade head
   ```

5. Run the API:

   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   - Swagger docs: http://localhost:8000/docs
   - Health check: http://localhost:8000/api/health

### Creating future migrations

After changing a model in `backend/app/models/`, generate a new revision with:

```bash
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

## Frontend setup

```bash
cd frontend
npm install
npm start
```

The app runs at http://localhost:4200 and expects the API at http://localhost:8000/api
(see `frontend/src/environments/environment.ts`).

## How auth works here

- Login/register/refresh set two httpOnly cookies (`access_token`, `refresh_token`) plus a
  readable `csrf_token` cookie.
- Every state-changing request (POST/PUT/PATCH/DELETE) must echo the `csrf_token` cookie value
  back as an `X-CSRF-Token` header — the Angular `authInterceptor` does this automatically.
- On a 401, the interceptor silently calls `/api/auth/refresh`; if that also fails, it clears
  local auth state and redirects to `/login`.
- Route guards (`authGuard` / `guestGuard`) protect `/recipe-form`, `/recipe-result`, and
  `/saved-recipes*`, and keep logged-in users out of `/login` and `/register`.

## API overview

| Method | Path                          | Description                              |
|--------|-------------------------------|-------------------------------------------|
| POST   | `/api/auth/register`          | Create an account (also logs you in)      |
| POST   | `/api/auth/login`              | Log in                                    |
| POST   | `/api/auth/refresh`            | Rotate access/refresh tokens              |
| POST   | `/api/auth/logout`             | Clear auth cookies                        |
| GET    | `/api/users/me`                | Current user profile                      |
| POST   | `/api/recipes/generate`        | Generate a recipe via Groq                |
| POST   | `/api/recipes/{id}/save`       | Save a generated recipe to your cookbook  |
| GET    | `/api/recipes/saved`           | List your saved recipes                   |
| GET    | `/api/recipes/saved/{id}`      | Get one saved recipe's full detail        |
| DELETE | `/api/recipes/saved/{id}`      | Remove a recipe from your cookbook        |

## Notes

- `backend/app/services/groq_service.py` isolates all calls to Groq and validates its JSON
  response against a Pydantic schema before it ever reaches the frontend, retrying once on a
  malformed response.
- The `recipes` table logs every generation (even ones never saved); `saved_recipes` is the
  many-to-many-ish join that represents a user's cookbook.
