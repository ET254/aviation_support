# Credentials & Placeholders Manifest

This file lists files in the project that contain credentials or require real service credentials. Update the environment variables or the files indicated with your real values before deploying.

Format:
- File: path
- Placeholder keys / env vars: list
- Route(s) or usage notes: HTTP route or code location to update

------------------------------------------------------------

- File: `backend/.env.example`
  - Placeholder keys: `DATABASE_URL`, `SYSTEM_USER_ID`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `NOTIFICATION_EMAIL_TO`, `PORT`
  - Notes: Copy values into `backend/.env` in production and set `SYSTEM_USER_ID` after running the seed.

- File: `backend/.env`
  - Placeholder keys: actual runtime secrets (DB, JWT secrets). Do not commit real secrets.

- File: `backend/prisma/seed.ts`
  - Placeholder keys / env vars: `SEED_PASSWORD_SYSTEM`, `SEED_PASSWORD_ADMIN`, `SEED_PASSWORD_MET`, `SEED_PASSWORD_DISPATCH`, `SEED_PASSWORD_PILOT`, `SEED_PASSWORD_ATC`, `SEED_PASSWORD_OPS`, `SEED_PASSWORD_GROUND`
  - Notes: Used to populate initial users; run `npm run prisma:seed` to create users. The script prints `SYSTEM_USER_ID` for use in `backend/.env`.

- File: `backend/src/config/index.ts`
  - Placeholder keys: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `CORS_ORIGIN`, `LOG_LEVEL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
  - Usage: application configuration; ensure `DATABASE_URL` and JWT secrets are set prior to running the server.

- File: `backend/src/services/alerts/AlertEngine.service.ts`
  - Placeholder keys: `SYSTEM_USER_ID`
  - Notes: `persistAlerts()` uses `SYSTEM_USER_ID` as the alert owner — set in env.

- File: `backend/src/services/alerts/dispatch/notificationDispatcher.ts`
  - Placeholder keys: none (plugs into env-driven SMTP config). If integrating SendGrid/Twilio/WhatsApp, add `SENDGRID_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, etc.
  - Routes: Dispatch invoked by `AlertEngine.dispatchAlerts()` during alert generation.

- File: `backend/src/services/alert.service.ts`
  - Placeholder keys: integration notes for SMS providers (Twilio) and other channels. Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` as needed.

- File: `backend/src/controllers/auth.controller.ts`
  - Placeholder keys: `JWT_SECRET`, `JWT_REFRESH_SECRET`
  - Routes: `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`

- File: `backend/hash-password.js`
  - Placeholder keys: `HASH_SAMPLE_PASSWORD` (or pass password as CLI arg)

- File: `docker-compose.yml`
  - Placeholder keys: `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DATABASE_URL` (used in service env)

- File: `backend/prisma/schema.prisma`
  - Placeholder keys: env("DATABASE_URL") — ensure your `DATABASE_URL` references the correct DB and credentials

- Frontend: `frontend/src/services/api.ts`, `frontend/src/contexts/AuthContext.tsx`
  - Placeholder keys: API base URL is derived from Vite or runtime; ensure frontend points to your API host. Tokens are stored in localStorage; no secrets to set but secure storage recommended.
  - Routes: login endpoints `/api/auth/login`, user endpoints `/api/users/*` used by frontend.

------------------------------------------------------------

How to update
1. Add real secrets to `backend/.env` (do not commit to repository).
2. Run the seed to create users and capture `SYSTEM_USER_ID`:

```bash
cd backend
npm run prisma:seed
```

3. Set `SYSTEM_USER_ID` in `backend/.env` or environment variables.
4. If you use third-party providers (SendGrid, Twilio, AWS), add the provider env vars shown above and update the dispatcher implementation to use the provider SDKs.

If you'd like I can also generate a `backend/.env.example` section for each provider you intend to use — tell me which providers to include.
