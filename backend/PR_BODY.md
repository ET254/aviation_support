Title: Implement alert persistence + notification dispatch

Description:
This PR implements persistence for generated alerts and hooks the Alert Engine to the notification dispatcher. It also adds unit tests for the new behavior and a CI workflow to run tests.

Changes:
- Implement `persistAlerts()` and `dispatchAlerts()` in `backend/src/services/alerts/AlertEngine.service.ts`.
- Add `backend/src/services/alerts/__tests__/AlertEngine.test.ts`.
- Update `backend/prisma/seed.ts` to upsert a `system@aviation.com` user and print `SYSTEM_USER_ID`.
- Add `backend/.env.example` documenting `SYSTEM_USER_ID` and SMTP settings.
- Add CI workflow `.github/workflows/ci.yml`.

Testing:
- Unit tests added and pass locally (`npm test` in `backend`).

Notes:
- Before enabling DB persistence, run `npm run prisma:seed` and set `SYSTEM_USER_ID` env to the printed id.

Reviewers:
- Backend maintainers
