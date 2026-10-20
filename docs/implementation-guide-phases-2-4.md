# Implementation Guide: Company Asset Dashboard Phases 2–4

This document is an implementation brief for another coding agent. It describes the product intent, architecture rules, data contracts, acceptance criteria, delivery order, and handoff requirements for the next development phases.

The agent should implement one independently usable slice at a time and report the exact checks that were run. The repository owner should review and commit each completed slice. The planning, UX decisions, trade-off analysis, and performance review can remain with the project owner.

## 1. Current baseline

Phase 1 is complete as of the current `main` branch. The application currently has:

- React + TypeScript + Vite frontend.
- Express + Mongoose + MongoDB backend.
- JWT login and `user`/`admin` roles.
- CRUD for assets, categories, make/models, and processors.
- Asset statuses: `available`, `assigned`, `maintenance`, `retired`.
- Asset search and client-side filters.
- Asset purchase/transaction date field.
- Asset detail panel.
- Inline validation and loading/error/empty states.
- Protected deletion of reference data used by assets.
- Backend services for domain/database logic.
- Frontend feature modules and module-owned types.
- Production configuration validation and CORS restrictions.
- Project and setup documentation in the repository root `README.md`.

Important commits that establish this baseline include:

```text
fc1af2d refactor: move backend logic into services
50a5d07 refactor: split frontend into feature modules
5f6a3b7 feat: harden phase one API behavior
0f40ef5 feat: polish asset dashboard experience
e787e0c docs: document setup architecture and deployment
```

Do not assume the working tree is clean in future sessions. Always inspect:

```bash
git status --short
git log --oneline -10
```

## 2. Product direction

The product is an **IT asset management system for small and medium-sized companies**.

The central business workflow is:

```text
Create asset → assign asset to employee → track ownership and condition
→ return asset → update condition/status → retain assignment history
```

The product should help an administrator answer:

- What equipment does the company own?
- Where is each asset located?
- Who currently has an asset?
- What condition is it in?
- When was it purchased?
- Is its warranty expiring?
- What happened to this asset in the past?

The product should help a read-only user answer the same inventory questions without receiving mutation controls.

## 3. Non-negotiable implementation rules

### Preserve the existing stack

Use the existing React, TypeScript, Vite, Express, Mongoose, and MongoDB stack. Do not replace the framework or introduce a starter kit.

### Keep the architecture boundaries

Frontend:

```text
company-dashboard/src/modules/<module>/components/
company-dashboard/src/modules/<module>/types.ts
company-dashboard/src/modules/<module>/constants.ts
company-dashboard/src/modules/<module>/utils/
company-dashboard/src/shared/
company-dashboard/src/lib/api.ts
```

Backend:

```text
api/routes/          HTTP route definitions and middleware composition
api/controllers/     request extraction and response formatting only
api/services/        business rules and database operations
api/models/          Mongoose schemas and indexes
api/validators/      request validation
api/middleware/      auth, authorization, validation, errors
```

Controllers must not contain business rules or direct Mongoose queries. New business behavior belongs in a domain service.

### Keep the API response style

Use the existing response envelope for successful responses:

```json
{
  "success": true,
  "statusCode": 200,
  "data": {},
  "message": "Human-readable message"
}
```

Use the existing error shape:

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": []
}
```

Do not expose passwords, password hashes, JWTs, environment values, or private database details in responses or logs.

### Keep role enforcement on the backend

Frontend hiding is a usability feature, not a security boundary. Every mutation route must continue to use authentication and admin authorization middleware. Services must still validate business invariants even when the request came from an authorized administrator.

### Do not add tests in this requested implementation scope

The project owner currently does not want test cases added. Do not add a test framework or test files unless explicitly requested later. Still run these checks after every slice:

```bash
# company-dashboard/
npm run build
npm run lint

# api/
node --check <every-changed-javascript-file>
```

Also perform a small, non-destructive smoke check of the affected HTTP flow.

### Commit one complete feature at a time

Use conventional commits. Examples:

```text
feat: add employee and department management
feat: add asset assignment workflow
feat: add asset history timeline
feat: add inventory csv export
refactor: extract employee module components
docs: document deployment and api usage
```

Do not combine unrelated features in one commit. Before committing, inspect `git status`, `git diff`, and the recent log. Stage only files belonging to that feature.

## 4. Delivery order

Implement in this order to keep every step usable:

### Phase 2A — Departments and employees

Create the people and organizational reference data before building assignment workflows.

### Phase 2B — Asset lifecycle fields

Add location, condition, warranty data, and the final purchase-date semantics.

### Phase 2C — Assignment and return workflow

Add the active assignment workflow and prevent invalid transitions.

### Phase 2D — Assignment history and detail experience

Add immutable history records and a useful asset detail page/timeline.

### Phase 2E — Phase 2 polish

Add filters, permission-aware actions, empty states, data validation, indexes, and documentation for the new workflow.

### Phase 3A — Server-side search and pagination

Do this before charts or CSV features so the app no longer loads all records into the browser.

### Phase 3B — CSV import/export

Build export first, then validated import with a preview/dry-run flow.

### Phase 3C — Analytics and notifications

Add server-side summary endpoints, dashboard charts, and in-app warranty alerts.

### Phase 3D — Audit logs and admin user management

Add auditability and secure account management before public deployment.

### Phase 4 — Portfolio release

Deploy, document, seed safe demo data, capture screenshots, publish API documentation, and complete the security review.

## 5. Phase 2 — Complete asset management system

### Phase 2 objective

Turn the current inventory CRUD dashboard into a real equipment lifecycle system. An administrator should be able to create an employee, place the employee in a department, assign an asset, return it, and inspect the complete history without editing raw records manually.

### Phase 2 acceptance criteria

Phase 2 is complete when all of the following are true:

1. Administrators can create, edit, deactivate, search, and view employees.
2. Administrators can create, edit, deactivate, search, and view departments.
3. An asset can be assigned to one active employee at a time.
4. An asset cannot be assigned when it is retired or already actively assigned.
5. An asset can be returned with a return date, return condition, and notes.
6. Returning an asset removes its active employee and updates its status.
7. Assets display location, condition, purchase date, and warranty dates.
8. Warranty start/end dates are validated, including end date after start date.
9. An asset detail view shows current assignment and a chronological assignment history.
10. Read-only users can inspect this information but cannot mutate it.
11. Existing assets without new optional fields remain readable and editable.
12. The API and UI display useful error, empty, loading, and permission states.

### 5.1 Department module

#### Recommended department model

Create `api/models/department.model.js`:

```text
name: required string, trimmed, unique
code: required string, trimmed, uppercase, unique
description: optional string
isActive: boolean, default true
createdAt / updatedAt: timestamps
```

Recommended indexes:

```text
unique(name)
unique(code)
isActive
```

#### Department API

```http
GET    /api/departments
GET    /api/departments/:id
POST   /api/departments              admin only
PUT    /api/departments/:id          admin only
PATCH  /api/departments/:id/status   admin only
DELETE /api/departments/:id          admin only, guarded
```

Prefer deactivation over deletion when employees still reference a department. A hard delete should return `409` if employees reference it.

#### Department UI

Add a department module with:

- List/table view.
- Add and edit form.
- Active/inactive status.
- Search by name or code.
- Read-only presentation for non-admin users.
- Clear empty state and duplicate-name/code messages.

The UI should use a reusable resource table pattern where it does not reduce clarity.

### 5.2 Employee module

#### Recommended employee model

Create `api/models/employee.model.js`:

```text
employeeNumber: required string, trimmed, unique
name: required string, trimmed
email: required string, lowercase, trimmed, unique
departmentId: required ObjectId ref Department
jobTitle: optional string, trimmed
phone: optional string, trimmed
location: optional string, trimmed
isActive: boolean, default true
createdAt / updatedAt: timestamps
```

Recommended indexes:

```text
unique(employeeNumber)
unique(email)
departmentId
isActive
name
```

Do not store employee passwords in this model. Authentication users and company employees are separate concepts unless a later product decision explicitly combines them.

#### Employee API

```http
GET    /api/employees
GET    /api/employees/:id
POST   /api/employees              admin only
PUT    /api/employees/:id          admin only
PATCH  /api/employees/:id/status   admin only
DELETE /api/employees/:id          admin only, guarded
```

Supported list filters should include:

```text
search
departmentId
isActive
```

Populate the department for list/detail reads. Validate department existence before create/update.

#### Employee UI

Add:

- Employee list with name, employee number, email, department, job title, and status.
- Employee create/edit form.
- Employee detail view with currently assigned assets.
- Search and department/status filters.
- Deactivate action with confirmation.
- A clear warning before deleting or deactivating an employee with active assignments.

### 5.3 Asset lifecycle fields

Extend the existing asset model rather than creating a second asset record type.

Recommended fields:

```text
location: optional string, trimmed
condition: enum [new, good, fair, damaged, under_repair]
warrantyStartDate: optional Date
warrantyEndDate: optional Date
assignedEmployeeId: optional ObjectId ref Employee
```

The existing `transactionDate` field already represents the purchase/recorded date in the current UI. Keep using it as the purchase date for Phase 2 unless the product owner explicitly requires a separate acquisition date and transaction date. Do not add two overlapping date fields without a documented distinction and migration plan.

#### Condition rules

Use explicit labels in the UI:

```text
new          → New
good         → Good
fair         → Fair
damaged      → Damaged
under_repair → Under repair
```

Do not automatically make `condition=damaged` mean `status=maintenance` unless that transition is an explicit service rule. The two fields have different meanings:

- `status`: lifecycle/availability state.
- `condition`: physical state.

#### Warranty rules

- `warrantyEndDate` may not be before `warrantyStartDate`.
- An asset with no warranty dates should display “Not provided”, not an invented date.
- The UI should show whether a warranty is active, expired, or expiring soon.
- Use one shared date validation rule on the backend and frontend.

### 5.4 Assignment model and history

Create `api/models/asset-assignment.model.js`:

```text
assetId: required ObjectId ref Asset
employeeId: required ObjectId ref Employee
assignedBy: required ObjectId ref User
assignedAt: Date, default now
returnedAt: optional Date
returnedBy: optional ObjectId ref User
returnCondition: optional enum [new, good, fair, damaged, under_repair]
notes: optional string
returnNotes: optional string
createdAt / updatedAt: timestamps
```

An active assignment is a record where `returnedAt` is absent. Add a partial unique index if supported by the selected MongoDB deployment:

```text
unique(assetId) where returnedAt does not exist
```

If the index is not used, the assignment service must still enforce one active assignment and handle duplicate-key/race errors safely.

### 5.5 Assignment API

Use asset-nested endpoints for the main user workflow:

```http
GET  /api/assets/:id/assignment
GET  /api/assets/:id/history
POST /api/assets/:id/assign       admin only
POST /api/assets/:id/return       admin only
```

Assign request:

```json
{
  "employeeId": "<employee-id>",
  "assignedAt": "2026-01-15",
  "notes": "Issued with charger and carrying case"
}
```

Return request:

```json
{
  "returnedAt": "2026-04-15",
  "returnCondition": "good",
  "returnNotes": "Returned during offboarding"
}
```

Service behavior for assignment:

1. Validate the asset ID and employee ID.
2. Load the asset and active employee.
3. Reject inactive employees.
4. Reject retired assets.
5. Reject assets with an active assignment.
6. Create the assignment history record.
7. Set `asset.assignedEmployeeId`.
8. Set `asset.status` to `assigned`.
9. Persist the linked changes in a MongoDB transaction where available.

Service behavior for return:

1. Load the asset and active assignment.
2. Reject a return when no active assignment exists.
3. Validate return date and return condition.
4. Close the assignment record.
5. Clear `asset.assignedEmployeeId`.
6. Set status to `available`, or `maintenance` when the return condition requires repair.
7. Persist the linked changes in a MongoDB transaction where available.

Use clear errors:

```text
Asset is already assigned
Asset cannot be assigned because it is retired
Employee is inactive
Asset has no active assignment
Return date cannot be before assignment date
```

### 5.6 Asset detail and history UI

The existing asset detail panel should evolve into the main asset detail experience. It should show:

- Asset identity and serial number.
- Status and condition badges.
- Category, make/model, and processor.
- Current location.
- Purchase/transaction date.
- Warranty status and dates.
- Current employee and department.
- Assign, return, and edit actions for administrators.
- A chronological assignment history timeline.

The timeline should make assignment transitions obvious:

```text
Assigned to Priya on Jan 15, 2026
Returned by Priya on Apr 15, 2026 — condition: Good
Assigned to Marco on Apr 18, 2026
```

Do not expose internal MongoDB IDs as the main user-facing content. IDs may be used in URLs or secondary debug information only when needed.

### 5.7 Phase 2 implementation checklist

For each module, the implementation agent should add or update:

```text
model
service
controller
routes
validators
frontend types
API client methods
feature components
loading/error/empty states
role-aware controls
README/API documentation
```

The agent should also review related indexes and existing data compatibility. New optional fields must not make current records unreadable.

## 6. Phase 3 — Portfolio-level business features

### Phase 3 objective

Demonstrate production-minded inventory workflows: data migration from spreadsheets, server-side performance, meaningful operational analytics, auditability, and secure administration.

Phase 3 should start only after Phase 2 assignment behavior is stable.

### 6.1 Server-side search, filters, and pagination

Move large-collection filtering out of the browser.

Recommended request contract:

```http
GET /api/assets?page=1&limit=25&search=laptop&status=available&categoryId=<id>
```

Recommended response data:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 25,
    "totalItems": 120,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

Rules:

- Clamp `limit` to a safe maximum such as 100.
- Reject negative or non-numeric page values.
- Escape user search input when constructing regular expressions, or prefer indexed text/prefix search.
- Add indexes for common filters and sort fields.
- Keep the current response compatibility until the frontend API client and screens are migrated together.
- Do not fetch all assets merely to calculate dashboard counts.

Apply the same pattern to employees and departments where list sizes warrant it.

### 6.2 CSV export

Build export before import because it has lower data-integrity risk.

Recommended endpoint:

```http
GET /api/assets/export.csv?status=assigned&departmentId=<id>
```

Export requirements:

- Apply the same server-side filters as the asset list.
- Include human-readable related names, not only IDs.
- Include serial number, status, condition, location, employee, department, purchase date, and warranty dates.
- Use a stable column order.
- Escape commas, quotes, and newlines correctly.
- Set `Content-Disposition` to a safe generated filename.
- Do not include password, token, or internal security fields.

### 6.3 CSV import

Recommended flow:

1. Upload a CSV file.
2. Parse and validate without writing.
3. Show a preview with valid rows and row-level errors.
4. Let an administrator confirm the import.
5. Write valid rows in a controlled batch.
6. Return an import summary.

Recommended endpoint shape:

```http
POST /api/assets/import/preview
POST /api/assets/import/commit
```

Import rules:

- Restrict file type and file size.
- Use a maximum row count.
- Never trust client-provided IDs without validation.
- Define duplicate serial-number behavior before implementation.
- Prefer an explicit `dryRun`/preview result.
- Report row number, field, and human-readable error.
- Never partially import silently.
- Log the importing administrator in the audit log.

### 6.4 Dashboard charts and summary endpoints

Use server-side aggregation endpoints instead of downloading every asset.

Recommended endpoints:

```http
GET /api/dashboard/summary
GET /api/dashboard/assets-by-status
GET /api/dashboard/assets-by-category
GET /api/dashboard/assets-by-department
GET /api/dashboard/warranty-expiring
```

Charts should answer operational questions, not merely decorate the screen:

- How many assets are assigned, available, under repair, or retired?
- Which departments hold the most equipment?
- Which categories are growing?
- Which warranties expire within 30/60/90 days?

Use accessible chart labels and provide a table or text summary for users who cannot interpret the chart visually.

### 6.5 Warranty-expiry notifications

Start with in-app notifications; an external email provider is optional.

Define the business windows explicitly:

```text
expired
expiring within 30 days
expiring within 60 days
expiring within 90 days
```

Requirements:

- Exclude retired assets by default.
- Do not notify repeatedly for the same window without a state or delivery record.
- Show asset name, serial number, owner, warranty date, and recommended action.
- Keep notification generation in a service, not a controller or React component.

### 6.6 Audit logs

Create an immutable `AuditLog` model:

```text
actorUserId: required User ref
action: required enum
entityType: required string
entityId: required ObjectId/string
summary: required string
changes: optional safe before/after diff
requestId: optional string
createdAt: timestamp
```

Record at least:

- Asset create/update/delete.
- Asset assign/return.
- Employee create/update/deactivate.
- Department create/update/deactivate.
- User role/status/password changes.
- CSV imports.

Do not store passwords, JWTs, or sensitive environment values in `changes`. Audit creation should happen in services after authorization and validation. Provide an admin-only read endpoint with pagination.

### 6.7 Admin user management

Add an admin-only user management module for:

- List users.
- Create users.
- Change role.
- Activate/deactivate users.
- Force password reset or set a temporary password.
- Revoke sessions after password changes.

Security rules:

- Never return password hashes.
- Never display passwords after creation.
- Do not allow an administrator to remove the last active administrator.
- Require confirmation for role or deactivation changes.
- Audit all user-management changes.
- Rate-limit login and password operations before public deployment.

## 7. Phase 3 definition of done

Phase 3 is complete when:

- Large lists use server-side pagination and filters.
- CSV export works with filtered, human-readable data.
- CSV import has preview, validation, safe commit, and error reporting.
- Dashboard metrics are backed by aggregation endpoints.
- Warranty alerts are visible and do not duplicate uncontrollably.
- Important mutations are auditable.
- Administrators can safely manage application users.
- All new screens preserve read-only/admin permissions.
- API and UI documentation describe the new contracts.

## 8. Phase 4 — Portfolio release

### Phase 4 objective

Turn the working application into a safe, understandable, publicly demonstrable portfolio project.

### 8.1 Deployment architecture

Recommended deployment shape:

```text
Browser
  ↓
Hosted React/Vite frontend
  ↓ HTTPS API requests
Hosted Express API
  ↓ private credentials / network rules
MongoDB Atlas
```

The frontend and backend may be hosted on different providers. The exact provider is a project-owner decision; the implementation agent should not hard-code a provider-specific design without approval.

Deployment requirements:

- Frontend build succeeds in a clean environment.
- API starts with production environment variables only.
- MongoDB Atlas database user has least-privilege access.
- Atlas network access is restricted to the deployed API where possible.
- Frontend `VITE_API_URL` points to the deployed API.
- API `CORS_ORIGIN` matches the exact deployed frontend origin.
- HTTPS is used for both frontend and API.
- A health endpoint such as `GET /health` returns a non-sensitive readiness response.
- Database connection failures are visible in server logs but do not expose credentials.

Suggested production environment variables:

```text
NODE_ENV=production
PORT=<provider-assigned-port>
MONGODB_URI=<secret-managed-at-provider>
JWT_SECRET=<strong-secret-managed-at-provider>
JWT_EXPIRES_IN=1h
CORS_ORIGIN=https://dashboard.example.com
```

Do not put production values in GitHub, README files, frontend source, screenshots, or agent prompts.

### 8.2 Demo data

Create a deterministic, non-sensitive demo data path:

- Example departments such as Engineering, Operations, and Finance.
- Example employees with clearly fictional names and addresses.
- Example categories, make/models, and processors.
- Example assets covering every status and condition.
- Example active, returned, and historical assignments.
- Example warranties that are active, expiring, and expired.

Demo data must not contain real employee details, real serial numbers, real company names, or production credentials.

The seed command should be idempotent: running it more than once must not create uncontrolled duplicates.

### 8.3 Screenshots and product walkthrough

Capture screenshots for:

1. Login screen.
2. Dashboard summary.
3. Asset list with search and filters.
4. Asset detail and history view.
5. Employee assignment workflow.
6. Warranty/notification summary.
7. Admin user management or audit log.

Use demo data only. Blur or remove any sensitive values before publishing.

Add a short walkthrough describing this story:

```text
An administrator creates an employee, assigns a laptop, views the assignment history,
returns the laptop, and sees its condition and availability update in the dashboard.
```

### 8.4 Architecture diagram

The root README should contain or link to a simple architecture diagram showing:

- Browser/frontend modules.
- API routes/controllers.
- Services.
- Mongoose models.
- MongoDB collections.
- Authentication flow.

Use Mermaid or a committed image. Keep the diagram synchronized with the code.

### 8.5 API documentation

Document:

- Authentication.
- Roles and permissions.
- Request body schemas.
- Query parameters.
- Response envelopes.
- Error codes.
- Assignment state transitions.
- CSV import/export behavior.

OpenAPI is preferred. A committed `docs/openapi.yaml` is sufficient for the portfolio; a hosted Swagger UI is optional.

### 8.6 Remove demo credentials and hardcoded assumptions

Before public deployment:

- Remove prefilled passwords from the login form.
- Move seed admin email/password to environment variables or an explicit local-only seed command.
- Never publish a credential that can access a production database.
- Replace any “demo password” text in screenshots or documentation.
- Ensure `.env`, `.env.*`, tokens, and database exports remain ignored.

The local seed flow may still create a demo administrator for development, but it must be clearly separated from production startup.

### 8.7 Production security checklist

- Strong unique JWT secret.
- Explicit CORS origin.
- HTTPS.
- Secure, short-lived auth strategy; evaluate httpOnly secure cookies before public launch.
- Login and password-operation rate limiting.
- Helmet/security headers enabled.
- Request body size limits.
- Validated ObjectId, dates, enums, and relationship references.
- No stack traces in production responses.
- No secrets in logs.
- No passwords or tokens in audit logs.
- Database backups and restore plan.
- Dependency updates reviewed before release.
- Admin-only destructive operations.
- Protected reference deletion.

## 9. Agent execution protocol

Give a coding agent one slice from this document at a time. A useful prompt should include:

```text
Implement only <feature name> from docs/implementation-guide-phases-2-4.md.

Read the current code and preserve existing behavior outside this feature.
Use the existing frontend module and backend service architecture.
Do not add tests or dependencies unless requested.
Do not modify .env or expose secrets.
Keep controllers thin and put business logic in services.
Add validation, loading/error/empty states, and admin/read-only behavior.
Run the required build/lint/syntax/smoke checks.
Do not commit; return the changed files, checks, and remaining gaps.
```

After the agent responds:

1. Review its diff against the requested acceptance criteria.
2. Check that no unrelated files or secrets changed.
3. Run the project checks yourself.
4. Try the affected flow against the running app.
5. Commit the completed slice with one conventional commit.
6. Record any migration, deployment, or follow-up work.

### Recommended agent-sized slices

Use these as separate implementation tasks and commits:

```text
1. Add departments API and admin/read-only UI.
2. Add employees API and admin/read-only UI.
3. Add asset lifecycle fields and validation.
4. Add asset assignment service and UI.
5. Add asset return service and UI.
6. Add assignment history and asset timeline.
7. Add server-side pagination and filtering.
8. Add CSV export.
9. Add CSV import preview and commit.
10. Add dashboard aggregation and charts.
11. Add warranty alerts.
12. Add audit logs.
13. Add admin user management.
14. Add deployment health/readiness support.
15. Add demo seed data and portfolio documentation.
```

## 10. Handoff report template

Every agent should return a report in this format:

```markdown
## Feature

## User-visible behavior

## Changed files

## API/data changes

## Migration or compatibility notes

## Checks run

- command — result

## Manual smoke flow

1. ...

## Remaining gaps

## Suggested commit message
```

## 11. What is enough for the portfolio?

The full Phase 2–4 list is a roadmap, not a requirement to build every possible feature.

A strong portfolio release should at minimum include:

- Clean module/service architecture.
- Authentication and role permissions.
- Employee and department management.
- Asset assignment and return.
- Assignment history.
- Search/filtering and pagination.
- Purchase, condition, location, and warranty information.
- One useful import/export workflow.
- A polished responsive UI.
- Production-safe configuration.
- A deployed demo with fictional data.
- A professional README and architecture diagram.

Charts, email notifications, and sophisticated admin tooling are optional if the core workflow is complete and polished. Do not sacrifice correctness, usability, documentation, or deployment quality to increase the feature count.
