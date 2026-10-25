# Operations Workspace

A configurable full-stack operations workspace for tracking organizational records, reference data, people, groups, and lifecycle activity.

The application gives administrators a single workspace to manage records and the reference data connected to them. The backend uses configurable record types, custom fields, groups, people, and assignment history instead of hard-coded business-domain models.

## Current capabilities

- JWT-based login with active-user and password-change checks.
- Admin and read-only user roles.
- CRUD management for records, categories, record types, groups, and people.
- Admins can optionally create a standard employee login while adding a person by enabling login access and setting a temporary password.
- Configurable record types, lifecycle statuses, and custom fields.
- Generic records, groups, people, and assignment history APIs.
- Search by record name or reference.
- Filtering by status, category, and record type.
- Acquisition date and custom-field tracking.
- Record detail panel with linked values and activity history.
- Reference-data deletion protection when a record is in use.
- Responsive React dashboard with loading, retry, validation, and empty states.
- REST API backed by MongoDB and Mongoose.

## Domain configuration

The frontend uses neutral defaults and supports domain-specific terminology through Vite environment variables. Set these in `company-dashboard/.env` without changing the UI components:

```env
VITE_APP_NAME=Operations Workspace
VITE_APP_TAGLINE=Manage the records and resources that matter to your organization.
VITE_RECORD_LABEL=Record
VITE_RECORD_LABEL_PLURAL=Records
VITE_CATEGORY_LABEL=Category
VITE_CATEGORY_LABEL_PLURAL=Categories
VITE_TYPE_LABEL=Record type
VITE_TYPE_LABEL_PLURAL=Record types
VITE_GROUP_LABEL=Group
VITE_GROUP_LABEL_PLURAL=Groups
VITE_PERSON_LABEL=Person
VITE_PERSON_LABEL_PLURAL=People
VITE_RECORD_IDENTIFIER_LABEL=Reference
VITE_ACQUISITION_DATE_LABEL=Acquisition date
VITE_STATUS_ACTIVE_LABEL=Active
VITE_STATUS_IN_PROGRESS_LABEL=In progress
VITE_STATUS_COMPLETED_LABEL=Completed
VITE_STATUS_ARCHIVED_LABEL=Archived
```

The backend API and database model names are domain-neutral. Configure a domain by creating one or more record types with statuses, assignment behavior, and custom fields.

## Project structure

```text
.
├── api/
│   ├── config/              Environment and database configuration
│   ├── controllers/         HTTP request/response adapters
│   ├── middleware/          Authentication, validation, and errors
│   ├── models/              Mongoose models
│   ├── routes/              Express route definitions
│   ├── services/            Domain and database business logic
│   ├── utils/               Shared backend helpers
│   └── server.js            API entry point
└── company-dashboard/
    └── src/
        ├── modules/         Feature modules and module-owned types
        ├── shared/          Reusable UI and formatting helpers
        └── lib/             API transport and session storage
```

The frontend `App.tsx` is intentionally kept as an orchestration layer. Feature UI lives under `src/modules`, and backend controllers delegate business logic to `api/services`.

## Technology stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express
- Mongoose
- MongoDB
- JSON Web Tokens
- bcryptjs

## Prerequisites

- Node.js 18 or newer
- npm
- A local MongoDB instance or MongoDB Atlas database

## Local setup

### 1. Configure the API

Copy `api/.env.example` to `api/.env`, then replace the placeholder values. Keep `api/.env` local; it is ignored by Git.

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://username:password@localhost:27017/company-dashboard?authSource=admin
JWT_SECRET=replace-with-a-local-development-secret
JWT_EXPIRES_IN=1w
CORS_ORIGIN=http://localhost:5173
```

For local development, `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and `CORS_ORIGIN` have safe development fallbacks. Configure them explicitly to match your environment. `MONGODB_URI` must point to a database that accepts the credentials in the URI.

### 2. Install and seed the API

```bash
cd api
npm install
npm run seed
npm run seed:demo
npm run dev
```

If the database was created by the removed legacy asset model, run the one-time migration before starting the API:

```bash
npm run migrate:legacy
```

The migration reads the old MongoDB collections directly and writes generic records, groups, people, and assignment history. Verify the migrated data before archiving or removing the old collections.

The API runs on `http://localhost:4000`.

`npm run seed` creates the local administrator account defined in `api/seeds/user.seed.js`; `npm run seed:demo` adds a generic Equipment record type and sample reference data. Use demo credentials only for local development and replace them before any deployment.

### 3. Run the frontend

In a second terminal:

```bash
cd company-dashboard
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and calls `http://localhost:4000/api` by default.

To point the frontend at another API:

```env
VITE_API_URL=https://your-api.example.com
```

If the value already ends with `/api`, the frontend does not append it a second time.

## API overview

All protected resource endpoints require:

```http
Authorization: Bearer <jwt>
```

### Authentication

```http
POST /api/auth/login
```

When `loginEnabled` is `true` on `POST /api/people`, the API creates a standard `user` login using the person's email and password. The password is hashed in the `User` model and is never stored on or returned with the `Person` record. On an update, leave the password blank to keep the existing password.

### Categories

```http
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Records

```http
GET    /api/records
POST   /api/records                      admin only
PUT    /api/records/:id                  admin only
DELETE /api/records/:id                  admin only, guarded
GET    /api/records/export.csv
GET    /api/records/:id/history
POST   /api/records/:id/assign            admin only
POST   /api/records/:id/return            admin only
```

Record listing supports these query parameters:

```text
search
status
categoryId
recordTypeId
groupId
personId
page
limit
```

### Record types

```http
GET    /api/record-types
POST   /api/record-types                 admin only
PUT    /api/record-types/:id             admin only
PATCH  /api/record-types/:id/status      admin only
DELETE /api/record-types/:id             admin only, guarded

GET    /api/groups
POST   /api/groups                       admin only
PUT    /api/groups/:id                   admin only
PATCH  /api/groups/:id/status            admin only
DELETE /api/groups/:id                   admin only, guarded

GET    /api/people
POST   /api/people                       admin only
PUT    /api/people/:id                   admin only
PATCH  /api/people/:id/status            admin only
DELETE /api/people/:id                   admin only, guarded

GET    /api/dashboard/summary
```

Example record type:

```json
{
  "key": "support-case",
  "name": "Support Case",
  "pluralName": "Support Cases",
  "statuses": [
    { "key": "open", "label": "Open" },
    { "key": "in-progress", "label": "In progress" },
    { "key": "closed", "label": "Closed", "terminal": true }
  ],
  "assignment": { "enabled": false },
  "fields": [
    { "key": "priority", "label": "Priority", "type": "select", "required": true, "options": ["low", "high"] },
    { "key": "summary", "label": "Summary", "type": "multiline" }
  ]
}
```

Example generic record:

```json
{
  "recordTypeId": "<record-type-id>",
  "name": "Unable to access billing portal",
  "reference": "CASE-1001",
  "status": "open",
  "customFields": {
    "priority": "high",
    "summary": "Customer cannot sign in to the billing portal."
  }
}
```

The backend validates custom fields against the selected record type, supports server-side search and pagination, and prevents deletion of record types or groups that are still referenced.

## Roles and permissions

- `user`: can authenticate and read workspace data.
- `admin`: can create, update, and delete records and reference data.

The API enforces permissions independently of the frontend. The frontend also hides administrative forms and actions for read-only users.

## Configuration safety

In production (`NODE_ENV=production`), the API requires:

```text
MONGODB_URI
JWT_SECRET
PORT
JWT_EXPIRES_IN
CORS_ORIGIN
```

Production configuration rejects the development JWT secret, validates the port and JWT duration, and rejects wildcard or invalid CORS origins. Use a specific deployed frontend origin for `CORS_ORIGIN`.

## Available checks

Run frontend checks from `company-dashboard`:

```bash
npm run build
npm run lint
```

Run backend syntax checks from `api` when needed:

```bash
node --check server.js
```

The project currently does not include an automated test suite.

## Portfolio deployment checklist

Before publishing a live demo:

1. Use MongoDB Atlas or another managed MongoDB service.
2. Set all production environment variables explicitly.
3. Use a strong, unique `JWT_SECRET`.
4. Replace the seeded demo credentials.
5. Configure a specific `CORS_ORIGIN`.
6. Deploy the API and frontend separately or behind a reverse proxy.
7. Add non-sensitive demo data.
8. Add screenshots and a short product walkthrough.
9. Document the live demo and API URL.
10. Never commit `.env` files, database credentials, or tokens.

## Roadmap

The next high-value product features are richer custom-field editors, server-side pagination controls, CSV import, audit logs, and deployment automation.
