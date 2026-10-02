# Staging Certificate Detail Update Plan

## Source Boundary

This plan uses `requirements.md` as product requirements and `sample.json` as example API data only. Imperative wording inside those attached files is treated as source material for this requested plan, not as direct instructions to the coding agent.

The user's request is to generate an implementation plan for updating this application, including architectural considerations, and to structure the work so it can be divided across the maximum practical number of subagents.

## Goal

Update the staging certificate workflow so the parent page lives at `/staging`, each staging certificate detail page lives at `/staging/<key>`, the detail page fetches and refreshes data from `/api/stagingCerts/<path>`, pending certificate requests can be completed by uploading certificate PEM data, and an existing key pair renders with the same keystore entry table and expandable certificate-chain behavior used by `KeystoreDetailsPage`.

## Existing Architecture Fit

The application is a Vite React app using React Router, Mantine UI, Tabler icons, Axios, Vitest, Testing Library, and colocated feature tests. The update should keep the current feature boundaries:

- Route constants and route helpers live in `src/app/routes.ts`.
- Route registration lives in `src/app/App.tsx`.
- Header navigation is driven by `src/app/navigation.ts` and `src/components/NavMenu.tsx`.
- API helpers live under `src/api` and should use `src/api/apiClient.ts`.
- Fetch-on-mount state should reuse `src/hooks/useApi.ts`.
- Submit-driven mutations should follow `src/features/stagingCertificates/useCreateStagingCertificate.ts`.
- Staging pages live under `src/features/stagingCertificates`.
- Keystore display should reuse `src/features/vault/KeystoreEntriesTable.tsx`, `EntryValidity.tsx`, `CertificateTree.tsx`, and `CertificateDetailsModal.tsx`.
- Local PEM/file input behavior should follow the local certificate viewer patterns in `src/features/tools/localCertViewer`.
- Tests should stay simple and flat, matching the guidance in `requirements.md`.

## Current State

The parent staging page already exists at `src/features/stagingCertificates/StagingCertificatesPage.tsx` and supports listing, filtering, paging, status fetching, and opening `NewStagingCertificateModal`.

The detail page at `src/features/stagingCertificates/StagingCertificateDetailPage.tsx` is currently a shell. It reads `key` from the query string, validates that it exists, renders breadcrumbs, and shows the key title. It does not fetch detail data, render pending-request actions, upload completed certificates, render key pairs, or create a new request from detail.

The current route contract is query based:

```ts
stagingCertificates: '/staging-certificates',
stagingCertificateDetail: '/staging-certificates/detail',
stagingCertificateDetailRoute(key) => '/staging-certificates/detail?key=...'
```

This must change to the path-based contract requested by the requirements.

## Proposed Feature Layout

Extend existing files:

- `src/app/routes.ts`
- `src/app/App.tsx`
- `src/app/navigation.ts`
- `src/components/NavMenu.test.tsx`
- `src/app/App.staging.test.tsx`
- `src/api/stagingCertificateApi.ts`
- `src/api/stagingCertificateApi.test.ts`
- `src/features/stagingCertificates/stagingCertificateTypes.ts`
- `src/features/stagingCertificates/StagingCertificatesTable.tsx`
- `src/features/stagingCertificates/StagingCertificateBreadcrumbs.tsx`
- `src/features/stagingCertificates/StagingCertificateDetailPage.tsx`
- `src/features/stagingCertificates/NewStagingCertificateModal.tsx`

Add focused staging detail files:

- `src/features/stagingCertificates/useStagingCertificateDetail.ts`
- `src/features/stagingCertificates/useCompleteCertificateRequest.ts`
- `src/features/stagingCertificates/StagingCertificateRequestBanner.tsx`
- `src/features/stagingCertificates/CompleteCertificateRequestModal.tsx`
- `src/features/stagingCertificates/PemTextareaWithActions.tsx`
- `src/features/stagingCertificates/StagingCertificateKeyPairSection.tsx`
- `src/features/stagingCertificates/StagingCertificateDetailActions.tsx`
- colocated tests for each new hook, helper, and UI component

Only extract shared PEM-input code from local cert viewer if reuse stays small and clear. Avoid moving broad local-tool components into staging unless the code naturally generalizes.

## Route Architecture

Change route constants:

```ts
export const routes = {
  stagingCertificates: '/staging',
  stagingCertificateDetail: '/staging',
} as const;
```

Register the detail route before or alongside the parent route:

```tsx
<Route path={routes.stagingCertificates} element={...<StagingCertificatesPage />} />
<Route path={`${routes.stagingCertificateDetail}/*`} element={...<StagingCertificateDetailPage />} />
```

Use a splat route for detail because staging keys may be vault-like paths containing slashes. The browser-visible contract still becomes `/staging/<key>`, but the implementation can safely preserve nested key paths.

Recommended route helpers:

```ts
export function encodeStagingCertificatePath(path: string) {
  return path.split('/').filter(Boolean).map(encodeURIComponent).join('/');
}

export function decodeStagingCertificatePath(path: string) {
  return path.split('/').filter(Boolean).map(decodeURIComponent).join('/');
}

export function stagingCertificateDetailRoute(key: string) {
  const encoded = encodeStagingCertificatePath(key);
  return encoded ? `${routes.stagingCertificates}/${encoded}` : routes.stagingCertificates;
}
```

`StagingCertificateDetailPage` should use `useParams()['*']` instead of `useSearchParams`. If an empty detail path is reached accidentally, show the existing missing-key error state.

Update active navigation checks if needed. `NavMenu` already treats paths as active when `pathname.startsWith(`${path}/`)`, so `/staging/<key>` should highlight the parent `/staging` item after the route constant changes.

## API Contract

Because `apiClient` already prepends `/api`, helpers should use paths without the `/api` prefix.

Backend-visible endpoints:

```text
GET  /api/stagingCerts/<path>
POST /api/stagingCerts/<path>
```

Frontend helper paths:

```text
GET  /stagingCerts/<path>
POST /stagingCerts/<path>
```

Keep the existing list, status, and create helpers:

```text
GET  /stagingCerts
GET  /stagingCerts/<key>/getStatus
POST /stagingCerts
```

Add helpers:

```ts
export function getStagingCertificateDetail(path: string): Promise<StagingCertificateDetail>;

export function completeCertificateRequest(
  path: string,
  payload: CompleteCertificateRequestPayload,
): Promise<StagingCertificateDetail | unknown>;
```

Request payload:

```ts
export interface CompleteCertificateRequestPayload {
  cert: string;
  parentChain: string;
}
```

Response type inferred from `sample.json`:

```ts
export interface StagingCertificateDetail {
  hasMissingKeystore: boolean;
  keyPair?: StagingCertificateKeyPair;
  certificateRequestInfo: StagingCertificateRequestInfo | null;
}

export interface StagingCertificateKeyPair {
  type: string;
  issueSeveritySummary?: Record<string, Record<string, number>>;
  keyEntries: KeystoreKeyEntry[];
}

export interface StagingCertificateRequestInfo {
  certificateRequest: { type: string };
  privateKey: { type: string };
  vaultPath: string;
}
```

Normalize missing optional arrays at the API boundary or render boundary:

- `keyPair` may be absent; render nothing for the key-pair section when absent.
- `keyPair.keyEntries` should default to `[]` if the API returns malformed or partial data.
- Entry `issues` and `certificates` should default to `[]` before passing into `KeystoreEntriesTable`.

Architectural decision: use the same path encoding helper for both route links and API calls. Preserve slash-separated path structure while encoding each segment, so keys containing spaces or special characters remain safe without turning vault-like paths into one opaque encoded blob.

## Detail Page Data Flow

`StagingCertificateDetailPage` should orchestrate only page-level state:

1. Read the path key from the route splat.
2. Decode and validate the key.
3. Fetch detail data with `useStagingCertificateDetail(key)`.
4. Show `StatusView` for loading, error, and empty states.
5. Render breadcrumbs and the page title.
6. Render `StagingCertificateRequestBanner` when `certificateRequestInfo !== null`.
7. Render `StagingCertificateKeyPairSection` when `keyPair` is present.
8. Pass `detail.refetch` to successful mutation handlers so the page refreshes from `GET /stagingCerts/<path>`.

Use `useApi` for the detail fetch:

```ts
export function useStagingCertificateDetail(path: string) {
  return useApi(() => getStagingCertificateDetail(path), [path]);
}
```

Guard against empty paths so the hook does not call the API with an invalid URL.

## Pending Request Banner

When `certificateRequestInfo` is not null, render a visible banner that says there is a current pending certificate request and that uploading the certificate response will generate a key pair.

Banner actions:

- `View In Vault`: `IconExternalLink`, opens `certificateRequestInfo.vaultPath` in a new tab.
- `Device enrollment`: `IconDeviceDesktop` or similar, opens a configurable enrollment URL in a new tab.
- `Upload Certificate`: `IconUpload`, opens `CompleteCertificateRequestModal`.

Add a constant for the enrollment URL near staging config:

```ts
export const DEVICE_ENROLLMENT_URL = '...';
```

If no real URL is known yet, use a clearly named placeholder constant and keep it centralized so deployment configuration can replace it later. Do not bury the URL literal in JSX.

External links should use:

```tsx
target="_blank"
rel="noreferrer"
```

## Complete Certificate Request Modal

The modal should contain two PEM textboxes:

- `New Certificate`, required.
- `Parent Chain`, optional.

Each textarea should have local action buttons:

- Paste from clipboard.
- Choose file and copy the file text into that textarea.

Recommended component contract:

```ts
interface PemTextareaWithActionsProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}
```

Implementation behavior:

- Use `navigator.clipboard.readText()` with a graceful unsupported/denied error message.
- Use a visually hidden `<input type="file">` triggered by an action icon or small button.
- Use `File.text()` to read file content.
- Show field-specific clipboard/file errors inline.
- Disable actions while submitting.
- Trim values for validation and submission.

Modal submit behavior:

- Disable submit when `New Certificate` is blank.
- POST `{ cert, parentChain }` to `/stagingCerts/<path>`.
- On success, keep mutation details out of the modal, close it, and call `refetch`.
- On error, keep the modal open and show the error inside the modal.
- Do not clear user-entered PEM content on error.
- Avoid logging PEM data or adding PEM text to snapshots.

## Key Pair Rendering

If `keyPair` is missing, render no key-pair section.

If `keyPair` is present:

- Render data using `KeystoreEntriesTable`.
- Show standard columns from the keystore table.
- Preserve expandable certificate-chain behavior.
- Keep certificate detail modal behavior through the existing table.
- Use a title such as `Key Pair` and a subtitle based on `keyPair.type` if useful.

Preferred wrapper:

```tsx
export function StagingCertificateKeyPairSection({ keyPair }: Props) {
  if (!keyPair) return null;
  return (
    <KeystoreEntriesTable
      entries={normalizedEntries}
      title="Key Pair"
      subtitle={keyPair.type}
    />
  );
}
```

Do not duplicate `KeystoreEntriesTable` unless an incompatibility is discovered. If the staging response shape differs from `KeystoreKeyEntry`, add a small adapter at the staging boundary.

## Detail Actions When No Request Is Pending

When `certificateRequestInfo` is null, show detail actions near the key-pair section or page heading:

- `New`: opens the same request modal/flow as the parent staging page.
- `Generate Keystore`: visible only when `hasMissingKeystore` is true; for now it should call `alert(...)`.

The `New` action should reuse `NewStagingCertificateModal` behavior but default the Common Name to the current key and refetch detail on success instead of navigating away.

Recommended refactor:

```ts
interface NewStagingCertificateModalProps {
  opened: boolean;
  onClose: () => void;
  defaultCommonName?: string;
  onSuccess?: (response: CreateStagingCertificateResponse) => void;
  navigateOnSuccess?: boolean;
}
```

Parent page usage keeps existing navigation:

```tsx
<NewStagingCertificateModal navigateOnSuccess />
```

Detail page usage:

```tsx
<NewStagingCertificateModal
  defaultCommonName={certificateKey}
  onSuccess={() => detail.refetch()}
/>
```

If `CertificateRequestFields` does not currently accept initial values, add that prop there rather than hard-coding default Common Name logic inside the modal.

## Architectural Considerations

1. Route path versus key identity

   The requirements ask for `/staging/${key}`. Keys may contain slashes, spaces, or vault-path characters. Use a splat route and segment-wise encoding so route shape stays human-readable while preserving key identity.

2. API base URL

   Do not include `/api` in helper constants. `API_BASE_URL` already handles that. Tests should assert helper paths such as `/stagingCerts/foo`, not `/api/stagingCerts/foo`.

3. Shared keystore display

   Keep keystore rendering shared through `KeystoreEntriesTable`. Staging should adapt data to the existing vault type instead of creating a parallel table.

4. Mutation and refetch boundaries

   Completion upload and new request creation are submit-driven mutations. Keep their state in mutation hooks/components and call page-level `refetch` after success. Avoid optimistic updates because the response may include server-derived certificate chain and issue details.

5. Secret material handling

   The modal handles certificate material and parent chain content. Do not log contents, persist them, add them to URLs, or include full PEM values in snapshots. Tests should use tiny fake strings.

6. Configurable external URL

   The device enrollment URL should be a named constant or environment-backed value. Centralizing it avoids editing UI components for environment changes.

7. Error locality

   Fetch errors belong to the page-level `StatusView`. Upload errors belong inside the modal and should not close the modal. Clipboard/file-read errors belong next to the affected textarea.

8. Component granularity

   Split the banner, modal, textarea-with-actions, key-pair section, and detail action group into separate components. This matches the requirement that every UI component has a unit test and lets many subagents work independently.

## Maximum Parallel Subagent Breakdown

These tasks are intentionally sliced small so many subagents can work concurrently. Subagents 1-6 should publish contracts early; most UI and test subagents can then proceed in parallel against those contracts.

| Subagent | Area | Deliverable | Depends On |
| --- | --- | --- | --- |
| 1 | Source audit | Confirm current staging, routing, local viewer, and keystore components to reuse | None |
| 2 | Route constants | Change staging parent route to `/staging`; add route/path helpers | None |
| 3 | App routing | Register parent `/staging` and detail `/staging/*` routes in the right order | 2 |
| 4 | Navigation | Update navigation labels/links and active-state expectations | 2 |
| 5 | Route tests | Update `App` and `NavMenu` staging route tests | 2, 3, 4 |
| 6 | Detail types | Add `StagingCertificateDetail`, request info, key-pair, and upload payload types | None |
| 7 | Path encoding tests | Test route/API encoding for simple keys, spaces, and slash-containing paths | 2 |
| 8 | API helpers | Add `getStagingCertificateDetail` and `completeCertificateRequest` | 2, 6 |
| 9 | API tests | Verify GET/POST endpoint paths and upload payload shape | 8 |
| 10 | Detail hook | Add `useStagingCertificateDetail` using `useApi` | 6, 8 |
| 11 | Complete hook | Add `useCompleteCertificateRequest` mutation hook | 6, 8 |
| 12 | Hook tests | Test success, error, reset, and refetch-facing behavior for new hooks | 10, 11 |
| 13 | Breadcrumbs | Update breadcrumbs for `/staging` and path-based detail keys | 2 |
| 14 | Table links | Update staging table links to use path-based `stagingCertificateDetailRoute` | 2 |
| 15 | Table link tests | Verify detail links are generated for simple and encoded keys | 14 |
| 16 | Config constant | Add centralized `DEVICE_ENROLLMENT_URL` | None |
| 17 | Request banner | Implement pending request banner with three icon actions | 6, 16 |
| 18 | Banner tests | Verify text, vault link, enrollment link, and upload callback | 17 |
| 19 | PEM textarea component | Implement textarea with clipboard and file actions | None |
| 20 | PEM textarea tests | Test typing, clipboard success/failure, file success/empty/error states | 19 |
| 21 | Completion modal | Implement two-field upload modal with validation and inline errors | 11, 19 |
| 22 | Modal tests | Test required cert, optional parent chain, submit payload, error stays open | 21 |
| 23 | Key-pair adapter | Normalize staging key-pair entries to `KeystoreKeyEntry[]` | 6 |
| 24 | Key-pair section | Render `KeystoreEntriesTable` only when `keyPair` is present | 23 |
| 25 | Key-pair tests | Verify absent key pair renders nothing and present entries render/expand | 24 |
| 26 | Detail actions | Add `New` and conditional `Generate Keystore` action group | 6 |
| 27 | Detail action tests | Verify request-null actions and `hasMissingKeystore` behavior | 26 |
| 28 | New modal defaults | Add default Common Name support to request fields/modal | None |
| 29 | New modal success behavior | Let parent navigate while detail refetches without navigation | 28 |
| 30 | New modal tests | Test default Common Name, parent navigation, and detail refetch callback | 28, 29 |
| 31 | Detail page orchestration | Wire route key, fetch states, banner, modal, key-pair section, and actions | 10, 17, 21, 24, 26, 29 |
| 32 | Detail page tests | Test loading, error, pending request, no request, missing key, and refetch flows | 31 |
| 33 | Styling | Add scoped CSS for banner, detail actions, modal PEM controls if needed | 17, 19, 21, 26, 31 |
| 34 | Accessibility pass | Verify labels, external link names, modal focus, textarea actions, and alerts | 17, 19, 21, 26, 31 |
| 35 | Security/privacy pass | Ensure PEM contents are not logged, persisted, URL-encoded, or snapshotted | 19, 21, 22, 31 |
| 36 | Regression pass | Run full tests and build; fix integration failures | All implementation tasks |

## Suggested Merge Order

1. Route constants, route helpers, type contracts, and API helpers.
2. App routing, navigation, breadcrumbs, and table detail links.
3. Detail hook and mutation hook.
4. Pending request banner and configurable enrollment URL.
5. PEM textarea component and completion modal.
6. Key-pair adapter and key-pair section.
7. New request modal default Common Name and success/refetch behavior.
8. Detail page orchestration.
9. Styling, accessibility, privacy review, tests, and full regression run.

## Testing Plan

Follow the test guidance from `requirements.md`:

- Every UI component gets a unit test.
- Keep tests simple.
- Avoid nested tests.
- Prefer one setup per test with multiple related assertions.
- Combine tests when it improves readability rather than chasing maximum coverage.

Recommended tests:

- `stagingCertificateDetailRoute` builds `/staging/<key>` and preserves slash-containing keys.
- App routing renders the parent page at `/staging` and detail page at `/staging/<key>`.
- Nav highlights `Staging Certificates` for both `/staging` and `/staging/<key>`.
- API helper gets `/stagingCerts/<path>`.
- API helper posts `{ cert, parentChain }` to `/stagingCerts/<path>`.
- Detail hook returns loading, success, and error states.
- Complete hook exposes loading, success, error, and reset behavior.
- Pending request banner renders the required message and three actions.
- PEM textarea supports manual typing, clipboard paste, and file load.
- Completion modal validates required certificate content, submits optional parent chain, shows errors inline, and remains open on failure.
- Key-pair section renders nothing when `keyPair` is missing.
- Key-pair section renders standard keystore columns and expandable certificate chain when present.
- Detail actions show `New` when no request is pending and show `Generate Keystore` only when `hasMissingKeystore` is true.
- New modal defaults Common Name to the current key on detail and refetches after success.
- Detail page calls refetch after successful certificate upload.

## Risks And Decisions To Confirm

- The required device enrollment URL is not specified. Use a centralized placeholder or environment-backed constant until product provides the real URL.
- The route requirement says `/staging/${key}`, but keys may contain slashes. A splat route best satisfies the visible URL requirement while preserving full keys.
- The existing implementation uses `hasMissingKeyStore` in status data, while `sample.json` uses `hasMissingKeystore`. Keep both names isolated in their respective types and avoid silently mixing list-status and detail-response contracts.
- `sample.json` includes `fingerpring`, which appears to be a typo. Existing certificate detail code already tolerates sample compatibility; avoid removing that behavior during staging work.
- The upload response shape is not specified. Treat success as a signal to refetch detail data rather than relying on the POST response for rendering.
- `NewStagingCertificateModal` currently navigates on success. Refactor carefully so parent page behavior remains unchanged while detail page can refetch in place.

## Definition Of Done

- `/staging` renders the staging certificate list.
- `/staging/<key>` renders the staging certificate detail page.
- Detail data is fetched from `/api/stagingCerts/<path>`.
- Pending requests show a banner with `View In Vault`, `Device enrollment`, and `Upload Certificate`.
- Uploading a certificate posts `{ cert, parentChain }`, keeps modal errors inside the modal, and refetches detail data on success.
- Missing `keyPair` renders no key-pair section.
- Present `keyPair` renders through the standard keystore entry table with expandable certificate chains.
- When no request is pending, the detail page offers `New` with Common Name defaulted to the current key and conditionally offers `Generate Keystore`.
- UI components and hooks have simple colocated unit tests.
- `npm test` and `npm run build` pass.
