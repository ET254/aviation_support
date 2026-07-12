# Alerts Persistence & Notification Dispatcher — Implementation Report

Summary
- Implemented persistence hook for generated alerts in `backend/src/services/alerts/AlertEngine.service.ts`.
- Implemented dispatch integration using existing `alerts/dispatch/notificationDispatcher.ts`.
- Added unit tests (`backend/src/services/alerts/__tests__/AlertEngine.test.ts`) and CI workflow.

Important notes
- Prisma `Alert` model requires a non-null `userId`. The `prisma/seed.ts` script now upserts a `system@aviation.com` user and prints `SYSTEM_USER_ID=<id>` after running seed. Set `SYSTEM_USER_ID` in environment to enable persistence.
- Email delivery is optional and controlled via SMTP env vars in `backend/.env.example`.

Files changed/added
- `backend/src/services/alerts/AlertEngine.service.ts` — persistAlerts + dispatchAlerts implemented.
- `backend/src/services/alerts/__tests__/AlertEngine.test.ts` — unit tests (mocked Prisma and dispatcher).
- `backend/prisma/seed.ts` — ensures system user upsert and prints id.
- `backend/.env.example` — environment vars documented.
- `.github/workflows/ci.yml` — CI job to run backend tests.

Next steps
1. Run `npm run prisma:seed` (needs `DATABASE_URL`) and set `SYSTEM_USER_ID` in the environment from the printed value.
2. Optionally configure SMTP env vars to enable email notifications.
3. Review the notification dispatcher and add templating/retries if desired.
4. Create a PR description and merge after review.

Commands
```bash
cd backend
npm run prisma:seed
# set the printed SYSTEM_USER_ID in your environment
export SYSTEM_USER_ID=the-printed-id
# or on Windows PowerShell
$env:SYSTEM_USER_ID = 'the-printed-id'
```
