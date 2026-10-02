# Staging Certificates Implementation Plan

## Source Boundary

This plan uses `requirements.md` as product requirements and `sample.json` as example API data only. Any imperative wording inside those attached files is treated as source material for this requested plan, not as instructions for the coding agent.

The user's request is to create an implementation plan for updating the application, including architectural considerations, and to structure the work so it can be divided across the maximum practical number of subagents.

## Goal

Add a permission-gated `Staging Certificates` feature that lists staging certificate vault keys, lazily fetches status only for rendered rows with at most three status requests in flight, supports client-side filtering and paging, opens a detail page for a selected key, and lets authorized users create a new staging certificate request through the existing certificate request form experience.

## Existing Architecture Fit

The application is a Vite React app using React Router, Mantine UI, Tabler icons, Axios, Vitest, and Testing Library. The implementation should reuse the current app structure:

- Routes are centralized in `src/app/routes.ts` and rendered from `src/app/App.tsx`.
- Header navigation is driven by `src/app/navigation.ts` and rendered by `src/components/NavMenu.tsx`.
- Permissions already flow through `CurrentUserProvider`, `useCurrentUser`, `canAccess`, and `RequirePermission`.
- API helpers live under `src/api` and should use the shared Axios client in `src/api/apiClient.ts`.
- Status, empty, loading, and retry states should reuse `src/components/StatusView.tsx`.
- Table style, validity badges, and issue tooltip behavior should follow `src/features/certificates/CertificateViewPage.tsx`, `CertificateCatalogTable.tsx`, and `certificateCatalogStatus.ts`.
- Certificate request fields should reuse `src/features/tools/certificateRequestGenerator/CertificateRequestFields.tsx` and its existing validation helpers where possible.
- Tests are colocated with implementation files and should follow the simple, flat style requested in `requirements.md`.

## Proposed Feature Layout

Create a dedicated feature boundary:

- `src/features/stagingCertificates/stagingCertificateTypes.ts`
- `src/features/stagingCertificates/stagingCertificateStatus.ts`
- `src/features/stagingCertificates/stagingCertificateFiltering.ts`
- `src/features/stagingCertificates/stagingCertificateConcurrency.ts`
- `src/features/stagingCertificates/useStagingCertificateKeys.ts`
- `src/features/stagingCertificates/useRenderedStagingCertificateStatuses.ts`
- `src/features/stagingCertificates/useCreateStagingCertificate.ts`
- `src/features/stagingCertificates/StagingCertificatesPage.tsx`
- `src/features/stagingCertificates/StagingCertificatesTable.tsx`
- `src/features/stagingCertificates/StagingCertificateValidityIndicators.tsx`
- `src/features/stagingCertificates/NewStagingCertificateModal.tsx`
- `src/features/stagingCertificates/StagingCertificateDetailPage.tsx`
- `src/features/stagingCertificates/StagingCertificateBreadcrumbs.tsx`
- colocated tests beside each helper, hook, and component

Extend existing app files:

- `src/api/stagingCertificateApi.ts`
- `src/api/stagingCertificateApi.test.ts`
- `src/app/routes.ts`
- `src/app/navigation.ts`
- `src/app/App.tsx`
- `src/app/App.test.tsx`
- `src/components/NavMenu.test.tsx`
- `src/mocks/currentUser.json`, if local manual testing should expose the feature by default
- `src/styles.css`

## Route And Navigation

Add route constants:

```ts
stagingCertificates: '/staging-certificates',
stagingCertificateDetail: '/staging-certificates/detail',
```

Use a query parameter for the detail key:

```ts
export function stagingCertificateDetailRoute(key: string) {
  const query = new URLSearchParams({ key });
  return `${routes.stagingCertificateDetail}?${query}`;
}
```

Reason: vault keys can contain slashes and characters that are awkward in path params. A query parameter avoids splat-route ambiguity and round-trips the API key without inventing a path encoding contract.

Add permission:

```ts
manageStagingCertificates: 'MANAGE_STAGING_CERTS',
```

Add a direct header nav item:

```ts
{ label: 'Staging Certificates', to: routes.stagingCertificates, permission: permissions.manageStagingCertificates }
```

Render both the list route and detail route through `RequirePermission`. The nav item should be hidden when the user lacks `MANAGE_STAGING_CERTS`, and direct URL access should redirect to `firstAccessibleRoute`.

## API Contract

The product requirement names `/api/stagingCert`. Because `apiClient` already prepends `/api` in production and uses `http://localhost:8050/api` in development, app helpers should use paths without the `/api` prefix.

Endpoints:

```text
GET /stagingCert
GET /stagingCert/<key>/getStatus
POST /stagingCert
```

Backend-visible URLs:

```text
GET /api/stagingCert
GET /api/stagingCert/<key>/getStatus
POST /api/stagingCert
```

Types:

```ts
export interface StagingCertificateStatus {
  hasMissingKeyPair: boolean;
  hasMissingKeystore: boolean;
  hasPendingCertRequest: boolean;
  issues: StagingCertificateIssue[];
}

export interface StagingCertificateIssue {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  type: string;
}

export interface CreateStagingCertificateResponse {
  path: string;
  version: number;
}
```

The create request payload should reuse `GenerateCertificateRequestPayload` from `src/features/tools/certificateRequestGenerator/certificateRequestTypes.ts`.

API helpers:

```ts
export function getStagingCertificateKeys(): Promise<string[]>;
export function getStagingCertificateStatus(key: string): Promise<StagingCertificateStatus>;
export function createStagingCertificate(payload: GenerateCertificateRequestPayload): Promise<CreateStagingCertificateResponse>;
```

Status endpoint keys must be encoded safely:

```ts
`/stagingCert/${encodeURIComponent(key)}/getStatus`
```

Open contract question: if the backend expects raw slash-separated keys instead of percent-encoded keys, align with backend routing before implementation. The default should be encoded because keys are data, not route structure.

## Data Loading Architecture

The feature has two different data lifecycles:

1. Key catalog

   Fetch all keys from `/stagingCert` once for the page. Keep filtering and paging entirely client side.

2. Row status

   Fetch status only for rows that are currently rendered after filtering and paging. Cache status by key so revisiting a page or removing a filter does not refetch previously loaded statuses.

Recommended state shape:

```ts
type StatusLoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: StagingCertificateStatus }
  | { status: 'error'; error: Error };

type StatusByKey = Record<string, StatusLoadState>;
```

`StagingCertificatesPage` should own:

- raw key list from `useStagingCertificateKeys`
- filter text
- active page number
- derived filtered keys
- derived visible page keys
- status cache from `useRenderedStagingCertificateStatuses(visibleKeys)`

Client-side paging should use a constant page size, preferably `15`, to match the existing Certificate View.

## Status Request Concurrency

Implement a small local concurrency helper instead of adding a dependency:

```ts
export async function runWithConcurrencyLimit<TInput, TOutput>(
  inputs: TInput[],
  limit: number,
  worker: (input: TInput) => Promise<TOutput>,
): Promise<Array<{ input: TInput; result?: TOutput; error?: Error }>>;
```

Use a limit of `3` for status calls.

The status hook should:

- accept the currently rendered keys
- skip keys already in `loading`, `success`, or `error` unless a retry is requested
- mark newly requested keys as `loading`
- dispatch status calls through the concurrency helper
- preserve successful status values when new visible keys arrive
- ignore stale results after unmount or after the visible key set changes
- expose `retryStatus(key)` and optionally `retryVisibleStatuses()`

Avoid firing status requests for the full key array. Only pass the current page of filtered keys into the status hook.

## Filtering And Paging

Filtering is entirely client side:

- Filter by key name, case-insensitive.
- Trim the query before matching.
- Reset `pageNumber` to `0` whenever the filter changes.
- Clamp `pageNumber` if filtering reduces total pages.
- Show an empty state when there are no keys.
- Show a no-results state when keys exist but the filter matches none.

Pure helpers should be isolated:

```ts
filterStagingCertificateKeys(keys: string[], query: string): string[];
paginateKeys(keys: string[], pageNumber: number, pageSize: number): string[];
getTotalPages(totalItems: number, pageSize: number): number;
```

## Table UI

The page should render similarly to Certificate View, with a dense operational table and client-side pagination.

Page heading:

- Eyebrow: `Certificate inventory`
- Title: `Staging Certificates`
- Supporting text: short and operational, not instructional.

Top actions:

- Filter input with search icon and clear icon.
- `New` button with an icon, preferably `IconPlus`.

Columns:

- `Name`
- `Is Valid`
- row action for opening detail, or make the name an accessible link to detail

`Name` comes from the key string returned by `/stagingCert`.

`Is Valid` should show two separate indicators:

1. Validity indicator

   Based on `issues` from the status response. Use the highest severity to choose color and icon. Show all issues in a tooltip, matching the Certificate View pattern.

   Recommended severity ranking:

   ```ts
   HIGH > MEDIUM > LOW
   ```

   Recommended colors:

   - `HIGH`: red
   - `MEDIUM`: orange
   - `LOW`: yellow
   - no issues: green
   - status loading: gray or blue loading state
   - status error: red error indicator with retry affordance

2. Workflow indicator

   Based on missing and pending flags:

   - `hasMissingKeyPair`: missing key-pair indicator
   - `hasMissingKeystore`: missing keystore indicator
   - `hasPendingCertRequest`: pending request indicator

   Each state should have a distinct icon, color, accessible label, and tooltip. If multiple flags are true, render multiple compact indicators side by side.

Use a pure helper to keep JSX simple:

```ts
export interface StagingCertificateIndicatorModel {
  validity: {
    severity: 'none' | 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
    issues: StagingCertificateIssue[];
  };
  workflow: Array<'missing-key-pair' | 'missing-keystore' | 'pending-cert-request'>;
}
```

## Detail Page

Create `StagingCertificateDetailPage`.

For this requirement phase, it should:

- read `key` from the query string
- render a breadcrumb back to `Staging Certificates`
- render a title with the key name
- show a clear missing-key error state if the route is opened without `key`

Breadcrumb:

- `Staging Certificates` links to `routes.stagingCertificates`
- current crumb is the key
- use Mantine `Breadcrumbs` and `Anchor`, similar to `VaultBreadcrumbs`

The detail page can later become the owner of version-specific and certificate-chain details, but do not add unrequested API calls now.

## New Button And Modal

Add a `New` button on the Staging Certificates list page.

Behavior:

- Button opens `NewStagingCertificateModal`.
- Modal embeds `CertificateRequestFields`.
- Existing validations remain in `CertificateRequestFields`.
- On submit, call `createStagingCertificate(payload)`.
- Disable modal submit controls while loading.
- Show an error alert inside the modal on failure.
- On success, close the modal and navigate to `stagingCertificateDetailRoute(response.path)`.

Use the response `path` as the detail key, per the requirement. Preserve `version` in the response type even if it is not rendered yet.

Architectural note: do not reuse `CertificateRequestGeneratorPage` directly because that page calls `/tools/generateCertificateRequest` and renders generated PEM output. Reuse the lower-level `CertificateRequestFields` component so the modal can submit to `/stagingCert`.

## Architectural Considerations

1. Keep staging certificates independent

   Use a new `stagingCertificates` feature folder and `stagingCertificateApi.ts`. The feature overlaps with Certificate View visually, but the data model, status lifecycle, permission, and create flow are distinct enough to avoid folding it into `src/features/certificates`.

2. Reuse visual patterns, not data assumptions

   Reuse the Certificate View table density, heading style, tooltips, badges, and pagination style. Do not reuse certificate catalog types because staging data starts as a string key list and lazily expands into status only for visible rows.

3. Treat status as progressive row data

   The page should be useful before all statuses are known. Render names immediately, then fill indicators as each visible row status arrives. This avoids blocking the table on slow status calls.

4. Cache status locally

   A page-local cache is enough for this requirement. Avoid global context or persistent storage unless a future requirement asks for cross-page reuse.

5. Avoid stale async updates

   Status fetches may complete after a filter/page change. The hook should ignore updates after unmount and should merge results by key rather than replacing the whole cache for the current render.

6. Keep concurrency generic but local

   `runWithConcurrencyLimit` can live in the staging feature folder. If another feature needs it later, move it to `src/utils` in a separate refactor.

7. Use existing Axios client conventions

   All API helpers should call `getJson` and `postJson`. Do not create a separate Axios instance for concurrency; concurrency should control when helper promises are started.

8. Permission model

   The exact permission string is `MANAGE_STAGING_CERTS`. Use this string as-is even though existing permissions currently use dotted names. Add it to `permissions` to avoid scattering string literals.

9. Detail key encoding

   Use a query parameter for detail route state. For the status API path, use `encodeURIComponent(key)` unless backend routing explicitly requires a different encoding.

10. Test style

   Follow the attached requirement: simple tests, no nested `describe`, one setup per test, and combined assertions when that keeps the test readable.

## Maximum Parallel Subagent Breakdown

These tasks are intentionally small so many subagents can work at the same time. Contract tasks should land first, then UI, hook, and integration tasks can proceed in parallel.

| Subagent | Area | Deliverable | Depends On |
| --- | --- | --- | --- |
| 1 | Type contract | `stagingCertificateTypes.ts` with key, status, issue, create response, and hook state types | None |
| 2 | Route contract | Add route constants and `stagingCertificateDetailRoute(key)` helper | None |
| 3 | Permission contract | Add `permissions.manageStagingCertificates = 'MANAGE_STAGING_CERTS'` | None |
| 4 | API endpoints | Add endpoint constants in `stagingCertificateApi.ts` | 1 |
| 5 | Key list API | Implement `getStagingCertificateKeys` with response normalization to `string[]` | 4 |
| 6 | Status API | Implement `getStagingCertificateStatus` with encoded key path | 4 |
| 7 | Create API | Implement `createStagingCertificate` using `GenerateCertificateRequestPayload` | 4 |
| 8 | API tests | Test endpoint paths, key encoding, and POST payload forwarding | 4, 5, 6, 7 |
| 9 | Filtering helper | Implement filter helper for case-insensitive key matching | 1 |
| 10 | Paging helper | Implement page slicing and total-page helper | 1 |
| 11 | Filtering tests | Flat tests for trim, case-insensitive matching, and no-results behavior | 9 |
| 12 | Paging tests | Flat tests for slicing, empty pages, and total page count | 10 |
| 13 | Concurrency helper | Implement `runWithConcurrencyLimit` | None |
| 14 | Concurrency tests | Verify max three workers run concurrently and errors are captured | 13 |
| 15 | Key hook | Implement `useStagingCertificateKeys` using `useApi` | 5 |
| 16 | Status hook shell | Create `useRenderedStagingCertificateStatuses` with cache shape and no network yet | 1 |
| 17 | Status hook fetch | Wire status hook to concurrency helper and status API | 6, 13, 16 |
| 18 | Status hook retry | Add per-key retry behavior | 17 |
| 19 | Status hook tests | Test visible-only loading, caching, retry, and stale-result ignoring | 17, 18 |
| 20 | Severity helper | Compute highest issue severity and formatted issue labels | 1 |
| 21 | Workflow helper | Convert missing/pending booleans into workflow indicator models | 1 |
| 22 | Indicator model tests | Test severity ranking and workflow flag combinations | 20, 21 |
| 23 | Validity indicator component | Render issue severity icon/badge with tooltip and loading/error states | 20 |
| 24 | Workflow indicator component | Render distinct icons/tooltips for missing key pair, missing keystore, and pending request | 21 |
| 25 | Indicator component tests | Verify accessible labels, tooltip text, and multi-flag rendering | 23, 24 |
| 26 | Table shell | Create `StagingCertificatesTable` with `Name` and `Is Valid` columns | 1, 23, 24 |
| 27 | Table detail navigation | Add name link or row action to detail route | 2, 26 |
| 28 | Table loading states | Render per-row status loading, success, and error/retry UI | 17, 26 |
| 29 | Table tests | Verify columns, links, indicators, and retry button behavior | 25, 27, 28 |
| 30 | Breadcrumb component | Implement `StagingCertificateBreadcrumbs` | 2 |
| 31 | Detail page | Implement key query parsing, breadcrumb, title, and missing-key state | 30 |
| 32 | Detail tests | Verify title, breadcrumb link, and missing-key state | 31 |
| 33 | Create hook | Implement `useCreateStagingCertificate` for idle/loading/success/error/reset | 7 |
| 34 | Create hook tests | Verify success response, error state, and reset | 33 |
| 35 | Modal shell | Create `NewStagingCertificateModal` and embed `CertificateRequestFields` | 33 |
| 36 | Modal submit | Wire modal submit to create hook and disable controls while loading | 35 |
| 37 | Modal success navigation | Close modal and navigate using response `path` | 2, 36 |
| 38 | Modal tests | Verify validation reuse, submit call, error alert, and success navigation | 35, 36, 37 |
| 39 | Page shell | Implement `StagingCertificatesPage` heading, filter input, New button, and section layout | 2, 15 |
| 40 | Page filtering | Wire filter state, reset page on filter change, and no-results state | 9, 10, 39 |
| 41 | Page paging | Wire client-side pagination to visible keys only | 10, 39 |
| 42 | Page status integration | Pass visible page keys into status hook and table | 17, 28, 39 |
| 43 | Page modal integration | Open/close New modal from page | 35, 39 |
| 44 | Page tests | Verify loading, key rendering, filtering, paging, visible-only status requests, and modal opening | 40, 41, 42, 43 |
| 45 | App route integration | Add protected list and detail routes in `App.tsx` | 2, 3, 31, 39 |
| 46 | Navigation integration | Add protected header nav item and active-state behavior | 2, 3 |
| 47 | Navigation tests | Verify nav visibility with and without `MANAGE_STAGING_CERTS` | 46 |
| 48 | App route tests | Verify authorized render and unauthorized redirect for list/detail routes | 45 |
| 49 | Styles | Add scoped CSS for staging filter, table indicators, pagination, modal, and breadcrumbs | 23, 24, 26, 35, 39 |
| 50 | Accessibility pass | Check accessible names, focus states, tooltip reachability, modal title, and route headings | 23, 24, 26, 31, 35, 39 |
| 51 | Mock data | Add local mock fixture files only if needed for development and tests | 1, 5, 6 |
| 52 | Regression pass | Run `npm test` and `npm run build`; fix integration failures | All implementation tasks |

## Suggested Merge Order

1. Type, route, permission, and API contracts.
2. Pure helpers for filtering, paging, concurrency, severity, and workflow indicators.
3. Hooks for key loading, rendered-row status loading, and create submission.
4. Detail page and breadcrumbs.
5. Indicator components and table.
6. Modal create workflow.
7. Page orchestration with filtering, client-side paging, visible-row status loading, and modal integration.
8. App route and header navigation integration.
9. Styling, accessibility pass, tests, build, and final regression.

## Testing Plan

Follow the test constraints in `requirements.md`:

- Every UI component gets a unit test.
- Keep tests simple.
- Avoid nested tests.
- Use one setup with multiple assertions when practical.
- Prefer meaningful behavior assertions over snapshots.

Recommended tests:

- `stagingCertificateApi.test.ts`: key list uses `/stagingCert`; status encodes keys in `/stagingCert/<key>/getStatus`; create posts to `/stagingCert`.
- `stagingCertificateFiltering.test.ts`: filters by name, trims query, matches case-insensitively, and paginates correctly.
- `stagingCertificateConcurrency.test.ts`: never runs more than three workers at once and returns per-item failures without dropping successes.
- `stagingCertificateStatus.test.ts`: ranks `HIGH` above `MEDIUM` and `LOW`, formats issue labels, and maps workflow flags to indicator models.
- `useStagingCertificateKeys.test.tsx`: renders loading, success, and retryable error state through the hook contract.
- `useRenderedStagingCertificateStatuses.test.tsx`: loads only visible keys, skips cached keys, respects the concurrency helper, and retries failed keys.
- `StagingCertificateValidityIndicators.test.tsx`: renders validity and workflow indicators with accessible names and tooltip content.
- `StagingCertificatesTable.test.tsx`: renders `Name` and `Is Valid`, detail links, loading status, success indicators, and error retry control.
- `StagingCertificateBreadcrumbs.test.tsx`: renders link back to Staging Certificates and current key.
- `StagingCertificateDetailPage.test.tsx`: renders key title and missing-key state.
- `NewStagingCertificateModal.test.tsx`: validates through `CertificateRequestFields`, submits payload, shows errors, and navigates on success.
- `StagingCertificatesPage.test.tsx`: verifies key loading, filter reset, client-side pagination, visible-row status loading, New modal opening, and no-results state.
- `NavMenu.test.tsx`: hides/shows Staging Certificates based on `MANAGE_STAGING_CERTS`.
- `App.test.tsx`: protects list and detail routes, renders authorized pages, redirects unauthorized users.

## Risks And Decisions To Confirm

- Status API key encoding may need backend confirmation if vault keys contain `/` and the server expects a raw path segment.
- The response sample contains `HIGH`, but the full severity enum may include additional values. Unknown severities should render as an unknown/error-neutral state instead of crashing.
- The exact visual mapping for workflow flags is not specified. Use distinct icons, colors, labels, and tooltips, then adjust after product review.
- The requirement says statuses should only be retrieved for rendered rows. This plan interprets rendered rows as the current filtered page of the table, not all filtered results.
- `CertificateRequestFields` must be reusable inside a modal. If its current API is too page-oriented, first make a scoped, backward-compatible prop adjustment rather than duplicating validation logic.

## Definition Of Done

- `Staging Certificates` appears in the header only for users with `MANAGE_STAGING_CERTS`.
- Direct access to staging list and detail routes is protected by `RequirePermission`.
- The list page fetches all keys from `/api/stagingCert`.
- Filtering and paging are entirely client side.
- Status is fetched only for currently rendered table rows.
- No more than three status requests are in flight at once.
- Row statuses are cached by key while the page is mounted.
- The table shows `Name` and `Is Valid`.
- `Is Valid` contains separate validity and workflow indicators with accessible labels and tooltips.
- Detail navigation passes the key and renders a title plus breadcrumb back to the list.
- The `New` button opens a modal with the certificate request fields.
- Successful create POST navigates to the detail route using response `path`.
- Every UI component has a simple unit test.
- `npm test` and `npm run build` pass.
