# Operations Workspace Implementation Guide

This guide describes the current generic architecture. The application no longer depends on asset, employee, department, or make/model backend models. New domains are configured through record types, custom fields, groups, people, and optional assignments.

## 1. Product direction

The product is a configurable operations workspace for organizations in different domains.

The generic workflow is:

```text
Create record type → define statuses and fields → create records
→ optionally assign records to people → retain assignment history
```

Examples of supported record types include:

```text
Equipment
Support Case
Project Task
Vehicle
Property
Application
Document
```

The same API and frontend can support these domains without creating a new code model for each one.

## 2. Current architecture

### Backend

```text
api/models/
  user.model.js
  category.model.js
  record-type.model.js
  record.model.js
  group.model.js
  person.model.js
  record-assignment.model.js
  audit-log.model.js

api/routes/          HTTP route definitions and middleware composition
api/controllers/     request extraction and response formatting
api/services/        business rules and database operations
api/validators/      request validation
api/middleware/      authentication, authorization, validation, errors
```

Controllers remain thin. Business rules belong in services. All mutation routes require authentication and administrator authorization.

### Frontend

```text
company-dashboard/src/modules/
  records/
  record-types/
  catalog/
  groups/
  people/
  dashboard/
  auth/

company-dashboard/src/shared/  reusable UI, context, and domain configuration
company-dashboard/src/lib/     shared HTTP transport and session storage
```

Each feature owns its API calls and types. `src/lib/http.ts` is limited to transport and interceptors.

## 3. Generic data model

### RecordType

Defines a kind of record and its behavior.

```text
key: unique slug
name: required display name
pluralName: optional display name
description: optional text
statuses: [{ key, label, terminal }]
fields: [{ key, label, type, required, options }]
assignment: { enabled, assignedStatus, availableStatus }
isActive: boolean
```

Supported custom field types:

```text
text
multiline
number
date
boolean
select
```

### Record

```text
name: required string
recordTypeId: required RecordType reference
reference: optional identifier
status: required status key from RecordType
categoryId: optional Category reference
groupId: optional Group reference
personId: optional Person reference
location: optional string
acquiredAt: optional date
customFields: map validated against RecordType.fields
metadata: safe domain-specific metadata
createdBy: User reference
```

### Group

Represents a department, team, region, branch, portfolio, project, or any other reusable organizational grouping.

```text
name: required string
key: unique slug
description: optional string
isActive: boolean
```

### Person

Represents an employee, customer, agent, tenant, student, owner, or other person associated with records.

```text
name: required string
reference: optional unique identifier
email: optional unique email
groupId: optional Group reference
title: optional string
phone: optional string
location: optional string
isActive: boolean
```

### RecordAssignment

Stores optional assignment history independently from the record.

```text
recordId: required Record reference
personId: required Person reference
assignedBy: required User reference
assignedAt: date
returnedAt: optional date
returnedBy: optional User reference
notes: optional text
returnNotes: optional text
metadata: safe additional information
```

The partial unique index allows only one active assignment per record.

## 4. API contracts

All protected endpoints require:

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
POST   /api/categories              admin only
PUT    /api/categories/:id          admin only
DELETE /api/categories/:id          admin only, guarded
```

### Record types

```http
GET    /api/record-types
GET    /api/record-types/:id
POST   /api/record-types              admin only
PUT    /api/record-types/:id          admin only
PATCH  /api/record-types/:id/status   admin only
DELETE /api/record-types/:id           admin only, guarded
```

### Records

```http
GET    /api/records
GET    /api/records/:id
POST   /api/records                   admin only
PUT    /api/records/:id               admin only
DELETE /api/records/:id               admin only, guarded
GET    /api/records/export.csv
```

Supported list filters:

```text
search
status
recordTypeId
categoryId
groupId
personId
page
limit
```

### Groups and people

```http
GET    /api/groups
GET    /api/groups/:id
POST   /api/groups                   admin only
PUT    /api/groups/:id               admin only
PATCH  /api/groups/:id/status        admin only
DELETE /api/groups/:id               admin only, guarded

GET    /api/people
GET    /api/people/:id
POST   /api/people                   admin only
PUT    /api/people/:id               admin only
PATCH  /api/people/:id/status        admin only
DELETE /api/people/:id               admin only, guarded
```

### Assignments

Assignment routes work only for record types where `assignment.enabled` is true.

```http
GET  /api/records/:id/assignment
GET  /api/records/:id/history
POST /api/records/:id/assign          admin only
POST /api/records/:id/return          admin only
```

### Dashboard

```http
GET /api/dashboard/summary
```

The summary returns total records, record types, categories, groups, people, status counts, and counts by record type.

## 5. Example configuration

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

The API validates every record's custom fields against the selected record type. Unknown fields, missing required fields, invalid options, and invalid status keys are rejected.

## 6. Migration from the removed model set

The old domain-specific JavaScript model files have been removed. Existing MongoDB collections are not automatically deleted.

For an existing database, run this once from `api/` while the legacy collections still exist:

```bash
npm run migrate:legacy
```

The script reads these old collections directly:

```text
departments
employees
assets
assetassignments
makemodels
```

It writes:

```text
groups
people
records
recordassignments
```

It also creates a `legacy-equipment` record type and stores old condition, warranty, and make/model values as custom fields. The migration is upsert-based and can be rerun after checking the results.

After verification, archive or remove the old collections separately. The application no longer reads them during normal operation.

## 7. Domain configuration

The frontend supports neutral labels through `VITE_*` variables:

```env
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
```

Status labels are configurable for the default UI statuses. Domain-specific statuses are displayed from the selected record type.

## 8. Checks and delivery rules

Run frontend checks from `company-dashboard/`:

```bash
npm run lint
npm run build
```

Run backend checks from `api/`:

```bash
for file in models/*.js services/*.js controllers/*.js routes/*.js validators/*.js utils/*.js seeds/*.js scripts/*.js; do node --check "$file" || exit 1; done
```

Also perform a non-destructive health check:

```bash
GET /health
```

Keep controllers thin, put business behavior in services, preserve role enforcement on the backend, and never commit credentials or private database values.
