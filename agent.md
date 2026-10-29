# Doctor Tracker – Agent Engineering Guidelines & Architecture Rules

This document establishes the non-negotiable coding standards, database optimization rules, and design patterns that must be strictly followed when implementing and maintaining the **Doctor Tracker** backend.

---

## 1. Clean Architecture & Layered Structure
Every business feature must strictly follow the Modular Layered Architecture:
```
Routes  -->  Validation (Zod)  -->  Controller  -->  Service  -->  Repository  -->  Model (Mongoose)
```

- **Routes (`*.routes.ts`):** Define REST endpoints, attach auth middlewares (`authGuard`), and validate incoming request payloads via Zod middleware (`validateRequest`).
- **Validation (`*.validation.ts`):** Define strict Zod schemas for `body`, `query`, and `params`. All user inputs must be validated before reaching controllers.
- **Controllers (`*.controller.ts`):** Handle HTTP request/response parsing, extract parameters, call services, and wrap responses using standard `sendResponse`. No database or business logic inside controllers.
- **Services (`*.service.ts`):** Contain business logic, orchestrate transactions, enforce domain rules, and call repositories or builders.
- **Repositories (`*.repository.ts`):** Abstract database interactions and complex queries (`find`, `create`, `update`, `aggregate`).
- **Models (`*.model.ts` & `*.interface.ts`):** Define TypeScript interfaces and Mongoose schemas with strict types, indexes, and virtuals.

---

## 2. QueryBuilder for Search, Filter, Sort & Pagination
All list/collection queries across doctors and patients **must use the centralized `QueryBuilder`** ([`src/builder/QueryBuilder.ts`](file:///r:/STA/doctor-portal/doctor-tracker/src/builder/QueryBuilder.ts)):

### Usage Pattern:
```typescript
import QueryBuilder from '@/builder/QueryBuilder';
import { Doctor } from './doctor.model';

const doctorQuery = new QueryBuilder(Doctor.find(), query)
  .search(['name', 'specialization', 'hospital', 'email', 'phone'])
  .filter()
  .sort()
  .paginate()
  .fields();

const result = await doctorQuery.modelQuery;
const meta = await doctorQuery.countTotal();

return {
  meta,
  data: result,
};
```

### Mandatory Rules for QueryBuilder:
- **Search:** Case-insensitive `$regex` applied only across declared searchable fields.
- **Filter:** Exact matches, date range filtering (`$gte`, `$lte`), and status/condition filters. Blank or `null`/`undefined` query keys must be stripped automatically.
- **Sorting:** Default to `-createdAt` unless explicitly overridden via `?sort=fieldName` or `?sort=-fieldName`.
- **Pagination:** Always calculate `page`, `limit`, `skip`, and return `countTotal` (`page`, `limit`, `total`, `totalPage`) for frontend pagination UI.

---

## 3. MongoDB Indexing Strategy
Never perform unindexed lookups or full-collection scans in production. Indexes must be explicitly declared on Mongoose schemas:

### Required Indexes:
1. **Doctor Model:**
   - `email`: Unique index (`{ unique: true, index: true }`)
   - `specialization`: Index for filtering (`{ index: true }`)
   - `hospital`: Index for filtering (`{ index: true }`)
   - `createdAt`: Descending index for sorting and date-range queries (`{ createdAt: -1 }`)
   - **Compound Index:** `{ specialization: 1, hospital: 1 }` for combined filter queries.

2. **Patient Model:**
   - `doctor`: Reference ObjectId with index (`{ type: Schema.Types.ObjectId, ref: 'Doctor', index: true }`)
   - `condition`: Index for filtering by patient status/condition (e.g., `Critical`, `Stable`, `Recovered`)
   - `createdAt`: Descending index for date-based statistics and sorting (`{ createdAt: -1 }`)
   - **Compound Index:** `{ doctor: 1, condition: 1 }` and `{ doctor: 1, createdAt: -1 }` for doctor-specific patient listing and pagination.

---

## 4. Efficient Database Querying (Zero In-Memory Filtering)
- **Database-Level Operations:** Never fetch full datasets to memory and filter/sort with JavaScript `Array.filter` or `Array.sort`. All filtering, sorting, projection, and pagination must be executed directly by MongoDB via `skip()`, `limit()`, and filter operators (`$regex`, `$gte`, `$lte`).
- **Field Limiting (Projection):** Exclude unnecessary sensitive or heavy fields (`-__v`) using `select()`.
- **Lean Queries:** Use `.lean()` when documents are read-only to avoid Mongoose document hydration overhead.

---

## 5. Aggregation Pipeline for Analytics & Dashboard
For the Admin Dashboard metrics and data visualizations, utilize **MongoDB Aggregation Pipelines** (`$lookup`, `$group`, `$count`, `$facet`, `$sort`):

### Required Metrics:
1. **KPI Stats:**
   - Total Doctors count
   - Total Patients count
2. **Patients per Doctor:**
   - `$group` by `doctor` or `$lookup` from `doctors` collection to calculate the exact patient count for each doctor.
3. **Date-based Statistics:**
   - Group registrations/admissions by date (`$dateToString: { format: "%Y-%m-%d", date: "$createdAt" }`) to generate timeline data for frontend area/line charts.
4. **Single-Trip Execution:**
   - Prefer `$facet` to calculate multiple KPI counters and chart series in a single database round-trip for maximum performance.

---

## 6. Input Validation & Error Handling
- **Zod Validation:** Every endpoint accepting `body`, `query`, or `params` must have a corresponding Zod schema executed via `validateRequest(schema)`.
- **Operational Errors:** Use custom `AppError(statusCode, message)` for operational business exceptions (e.g., 404 Not Found, 400 Bad Request, 409 Conflict).
- **Global Error Handling:** All asynchronous controller methods must be wrapped with `catchAsync` to forward unhandled rejections to `globalErrorHandler`.
- **Process Resilience:** Handle `uncaughtException` and `unhandledRejection` gracefully with structured logging via Pino.

---

## 7. Execution Checklist Before Marking Tasks Complete
- [ ] TypeScript compiles cleanly with zero errors (`yarn build` / `tsc && tsc-alias`).
- [ ] All sensitive environment variables stay in `.env` and are mirrored as safe templates in `.env.example`.
- [ ] Unit/Integration tests pass with `yarn test`.
- [ ] No temporary/malicious scripts (`api.js`, etc.) remain in the workspace.
- [ ] Code is formatted with Prettier and passes ESLint rules.

