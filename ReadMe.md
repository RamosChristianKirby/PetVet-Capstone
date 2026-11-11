# PetVet — care, connected

PetVet is a pet identification and veterinary care system for Cagayan de Oro. It includes a React web workspace, an Express/MongoDB API, and an Expo RFID lookup app.

## Start with the disposable demo

Requires **Node.js 22.13+** (Node 24.3+ also works) and npm.

```sh
npm ci
npm run setup
npm run demo
```

Open **http://localhost:5173**. The demo creates a temporary, local MongoDB database with fictional pets and accounts. It does **not** load `server/.env`, contact your configured database, or retain changes after shutdown. Stop it with Ctrl+C.

| Account          | Email              | Password       |
| ---------------- | ------------------ | -------------- |
| Veterinary staff | doctor@petvet.demo | PetVetDemo123! |
| Pet owner        | owner@petvet.demo  | PetVetDemo123! |

Example RFID tags: `00123`, `A00024567`, `00125`.

The first demo/test run downloads a MongoDB executable; on Windows the official archive is large. If you already have MongoDB installed, set `MONGOMS_SYSTEM_BINARY` to the absolute path of `mongod`. Downloads are cached. The demo API listens only on localhost.

## Use your own database

1. Copy `server/.env.example` to `server/.env`, preserving an existing file if needed.
2. Set `MONGODB_URI` to a working local or hosted MongoDB database.
3. Generate a random secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and use it as `JWT_SECRET`.
4. Set `CLIENT_ORIGINS` to the comma-separated, exact browser origins allowed to call the API.
5. Run `npm run dev` at the repository root.

The API defaults to port 5000. Vite proxies `/api` to it; no client environment file is needed for local development. For a separate deployed API, set `VITE_API_URL` before building the client. Both API URLs must include `/api`.

Public registration always creates a **pet owner**. To authorize an existing account as veterinary staff, an operator with database access can run:

```sh
npm run staff --prefix server -- vet@example.com
```

This is an explicit administrative action. There is no public role-changing endpoint.

## What the system supports

- A responsive overview with real registry counts, upcoming appointments, and recently registered pets.
- Searchable pet registry with status filters and pagination.
- Pet registration with RFID validation, local/mixed breeds, optional secondary breed, and recovery details.
- Pet profiles that load directly from their URL and survive refreshes.
- Editing identity and recovery details, with conflict detection when a record changed.
- Date-stamped vaccination records maintained by veterinary staff.
- Shared care remarks and private medical remarks, with server-side visibility enforcement.
- Appointment booking, completion, cancellation, search, and history.
- A staff-only owner directory with individual owner profiles.
- Authenticated RFID lookup on the web and in the mobile scanner.
- Editable account profiles, session expiration, full sign-out, loading/error/empty states, and request retries.
- Archiving a pet hides it and its appointments from active screens while retaining medical history. Its RFID remains reserved.

Owners can only access their own pets and appointments. Veterinary staff can access the registry. Vaccination and clinical remark changes are restricted to staff. RFID lookups require sign-in; they do not publicly expose recovery contact information.

## Mobile scanner

```sh
cd AppScanner
npm ci
```

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`, then start with `npm start`. A physical phone needs the API computer’s reachable LAN address, not `localhost`. For an Android emulator the usual host address is `http://10.0.2.2:5000/api`. Restart Expo after changing environment variables.

The scanner supports manual entry and **keyboard-compatible RFID readers** that send text and optionally Enter. It preserves leading zeros and accepts 5–64 alphanumeric characters or hyphens. It is not a native NFC/Bluetooth reader driver. Sign-in is held in memory and is cleared when the app closes.

The disposable demo API is localhost-only. Use your configured development API for a physical-device test. For Expo web, add its browser origin to `CLIENT_ORIGINS`.

## Checks

Run from the repository root:

```sh
npm run check          # Web lint, API integration tests, production web build
npm run test:e2e       # Desktop and mobile browser workflows
```

Install the test browser once with `cd client && npx playwright install chromium`. On Windows, an installed Edge browser can be used by setting `PLAYWRIGHT_CHANNEL=msedge`.

API tests use their own disposable MongoDB database. Browser tests start their own disposable demo API on port 5001 and Vite server on port 5174. They never reuse your normal development API or database. Keep these two test ports free.

Scanner builds:

```sh
npm run build:web --prefix AppScanner
npm run build:android --prefix AppScanner
npm run build:ios --prefix AppScanner
```

These commands export JavaScript/assets. They do not produce signed APK/IPA packages or replace physical-device and RFID hardware testing.

GitHub Actions runs the web/API checks, browser tests, and scanner web export.

## Existing data and deployment

Back up the database before deploying an upgrade. The revised schema keeps the existing `User`, `Pet`, and `Visit` collections and adds timestamps, remark arrays, appointment status, and archive markers. Old records without the new fields use defaults.

Before using a legacy database, run `npm run migrate --prefix server` to check for case-insensitive email/RFID collisions and unsupported statuses. Review the report, then explicitly run `npm run migrate --prefix server -- --apply` to normalize data and remove the obsolete unique-name index. The migration does not delete records. User names no longer need to be unique; email and RFID numbers do.

Legacy appointments with no status remain scheduled; their date determines whether they appear in history. Birth dates and vaccination dates are calendar dates; appointments are stored as UTC instants and displayed in the viewer’s local timezone.

For production, serve the built `client/dist` with an SPA fallback to `index.html` and proxy `/api` to the API. Use HTTPS, a persistent MongoDB database, a private JWT secret, and the correct allowed origins. The bundled rate limiter uses process memory; multi-instance deployments need a shared rate-limit store. No automatic email reminders or email delivery service is configured.

The original obsolete credentials are not needed by the revised application. Set fresh configuration for your own deployment. No migration is run automatically on startup.

## Project layout

- `client/`: React, TypeScript, Vite, accessible Radix dialogs, responsive styles.
- `server/`: Express, Mongoose, JWT authentication, Zod validation, API integration tests.
- `AppScanner/`: Expo/React Native scanner and web export.
- `.github/workflows/ci.yml`: automated checks.

Implementation references: [Express security practices](https://expressjs.com/en/advanced/best-practice-security/), [Mongoose validation](https://mongoosejs.com/docs/validation.html), [React effect cleanup](https://react.dev/reference/react/useEffect), and [Expo upgrade guidance](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/).

## Original project team

John Gabriel M. Lacar · Joal Kenneth L. Macaya · Zairyl Mae E. Patosa · Godfrey E. Rodriguez · Christian Kirby G. Ramos
