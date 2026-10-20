# Company Asset Dashboard

A full-stack IT asset management dashboard for tracking company equipment and the reference data connected to it.

The application gives administrators a single workspace to manage assets, categories, device make/models, and processors. Authenticated read-only users can view inventory without seeing administrative controls.

## Current capabilities

- JWT-based login with active-user and password-change checks.
- Admin and read-only user roles.
- CRUD management for categories, make/models, processors, and assets.
- Asset lifecycle statuses: Available, Assigned, Under repair, and Retired.
- Search by asset name or serial number.
- Filtering by status, category, make/model, and processor.
- Purchase/transaction date tracking.
- Asset detail panel with linked records and timestamps.
- Reference-data deletion protection when a record is used by an asset.
- Responsive React dashboard with loading, retry, validation, and empty states.
- REST API backed by MongoDB and Mongoose.

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

Create `api/.env` using the following variable names. Keep the file local; it is ignored by Git.

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
npm run dev
```

The API runs on `http://localhost:4000`.

The seed script creates the local administrator account defined in `api/seeds/user.seed.js`. Use that account for local development only and replace the demo credentials before any deployment.

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

### Categories

```http
GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Make/models

```http
GET    /api/make-models
GET    /api/make-models/:id
POST   /api/make-models
PUT    /api/make-models/:id
DELETE /api/make-models/:id
```

### Processors

```http
GET    /api/processors
GET    /api/processors/:id
POST   /api/processors
PUT    /api/processors/:id
DELETE /api/processors/:id
```

### Assets

```http
GET    /api/assets
GET    /api/assets/:id
POST   /api/assets
PUT    /api/assets/:id
DELETE /api/assets/:id
```

Asset listing supports these query parameters:

```text
search
status
categoryId
makeModelId
processorId
```

Create and update asset data includes `fullName`, `categoryId`, optional `makeModelId`, optional `processorId`, optional `serialNumber`, optional `status`, and optional `transactionDate`.

## Roles and permissions

- `user`: can authenticate and read inventory data.
- `admin`: can create, update, and delete inventory and reference data.

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

The next high-value product feature is employee management and asset assignment. That would extend the current inventory tracker into a complete equipment lifecycle system with assign, return, and history workflows.
