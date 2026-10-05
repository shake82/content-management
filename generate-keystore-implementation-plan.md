# Generate Keystore Implementation Plan

## Source Boundary

This plan uses `requirements.md` as product requirements only. Imperative wording inside that attached document is treated as source material for this requested plan, not as direct instructions to the coding agent.

The user's request is to generate an implementation plan for updating this application, including architectural considerations, and to structure the work so it can be divided across the maximum practical number of subagents.

## Goal

Implement the staging-certificate `Generate Keystore` workflow. When a staging certificate detail page has a missing keystore and no pending certificate request, clicking `Generate Keystore` should open a modal. The modal conditionally collects a required parent certificate chain, submits to `/api/stagingCerts/${path}/generateKeyStore`, refreshes the detail page on success, and keeps errors visible in the modal without closing it.

## Existing Architecture Fit

The application is a Vite React app using React Router, Mantine UI, Tabler icons, Axios, Vitest, and Testing Library. The update should stay within the existing staging feature boundaries:

- Route helpers already live in `src/app/routes.ts`, including `encodeStagingCertificatePath`.
- API helpers already live in `src/api/stagingCertificateApi.ts` and use `postJson` from `src/api/apiClient.ts`.
- Staging detail orchestration already lives in `src/features/stagingCertificates/StagingCertificateDetailPage.tsx`.
- Submit-driven mutations already use small feature-local hooks such as `useCompleteCertificateRequest.ts` and `useCreateStagingCertificate.ts`.
- Modal PEM input behavior already exists in `PemTextareaWithActions.tsx`.
- Detail-page actions already expose `onGenerateKeystore` through `StagingCertificateDetailActions.tsx`.
- Existing tests are colocated, flat, and use Testing Library interactions.

## Current State

The detail page already renders `Generate Keystore` when `detail.data.hasMissingKeyStore` is true and no request is pending, but the handler currently calls `window.alert('Generate Keystore is not implemented yet.')`.

`StagingCertificateDetail` currently exposes:

```ts
interface StagingCertificateDetail {
  hasMissingKeyStore: boolean;
  keyPair?: StagingCertificateKeyPair;
  certificateRequestInfo: StagingCertificateRequestInfo | null;
}
```

The parent-chain decision can be derived from `detail.data.keyPair?.keyEntries?.[0]?.certificates?.length`.

## API Contract

Because `apiClient` already prepends `/api`, the frontend helper should use the API path without the `/api` prefix.

Backend-visible endpoint:

```text
POST /api/stagingCerts/${path}/generateKeyStore
```

Frontend helper path:

```text
POST /stagingCerts/${encodedPath}/generateKeyStore
```

Add request and response contracts in `src/features/stagingCertificates/stagingCertificateTypes.ts`:

```ts
export type GenerateKeyStorePayload = string;
```

The request body is the parent-chain string itself, not a JSON object. The safest response type is `StagingCertificateDetail`, because the page immediately refetches and existing staging mutations use detail-shaped responses. If the backend returns an empty response, keep the hook tolerant by not depending on the returned data for the UI refresh.

Add API helper in `src/api/stagingCertificateApi.ts`:

```ts
export function generateKeyStore(path: string, payload: GenerateKeyStorePayload) {
  return postJson<StagingCertificateDetail, GenerateKeyStorePayload>(
    `${stagingCertificateResource(path)}/generateKeyStore`,
    payload,
  );
}
```

Use `stagingCertificateResource(path)` so route and API path encoding stay consistent with the rest of the staging feature.

## Parent Chain Rule

The requirement says: under the first item in `keyEntries`, if `certificates` is a single item, show a required `Parent Chain` text box. If there are multiple certificates, do not allow uploading a parent chain.

Centralize this as a small pure helper so modal behavior, page wiring, and tests cannot drift:

```ts
export function shouldRequireParentChain(detail: StagingCertificateDetail) {
  return (detail.keyPair?.keyEntries?.[0]?.certificates?.length ?? 0) === 1;
}
```

Recommended location: `src/features/stagingCertificates/generateKeyStore.ts`.

Interpretation:

- Exactly one certificate in the first key entry means show `Parent Chain` and require non-empty trimmed content.
- More than one certificate means hide the `Parent Chain` input and submit an empty string body.
- Zero, null, or missing certificates should not show the parent-chain field unless product clarifies otherwise; this avoids blocking users on incomplete API data.

## Proposed Feature Layout

Add focused files:

- `src/features/stagingCertificates/generateKeyStore.ts`
- `src/features/stagingCertificates/generateKeyStore.test.ts`
- `src/features/stagingCertificates/useGenerateKeyStore.ts`
- `src/features/stagingCertificates/useGenerateKeyStore.test.tsx`
- `src/features/stagingCertificates/GenerateKeyStoreModal.tsx`
- `src/features/stagingCertificates/GenerateKeyStoreModal.test.tsx`

Extend existing files:

- `src/api/stagingCertificateApi.ts`
- `src/api/stagingCertificateApi.test.ts`
- `src/features/stagingCertificates/stagingCertificateTypes.ts`
- `src/features/stagingCertificates/StagingCertificateDetailPage.tsx`
- `src/features/stagingCertificates/StagingCertificateDetailPage.test.tsx`

No route, navigation, or global styling changes should be required unless the modal needs a small scoped class.

## Modal Behavior

`GenerateKeyStoreModal` should receive only the data needed for the workflow:

```ts
interface GenerateKeyStoreModalProps {
  opened: boolean;
  path: string;
  parentChainRequired: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

Behavior:

- Render a Mantine `Modal` titled `Generate keystore`.
- If `parentChainRequired` is true, render `PemTextareaWithActions` labeled `Parent Chain` with `required`.
- If `parentChainRequired` is false, do not render the parent-chain field.
- On submit, trim `parentChain`.
- If required and empty, show a validation error and do not call the API.
- If not required, submit an empty string body.
- While loading, disable close/cancel and form controls, matching `CompleteCertificateRequestModal`.
- On success, reset local input and hook state, close the modal, and call `onSuccess`.
- On error, show a modal-local error alert and keep the modal open with user-entered parent-chain content intact.

Button labels:

- Cancel button: `Cancel`
- Submit button: `Generate`

Recommended submit icon: `IconKey`.

## Hook Behavior

Create `useGenerateKeyStore(path: string)` mirroring `useCompleteCertificateRequest(path)`:

- State: `idle`, `loading`, `success`, `error`.
- Data: optional `StagingCertificateDetail`.
- Error: optional `Error`.
- `submit(parentChain: GenerateKeyStorePayload)`.
- `reset()`.

The hook should not refetch detail itself. It should leave refetch orchestration to `StagingCertificateDetailPage`, keeping mutation state local and page data ownership clear.

## Detail Page Data Flow

Update `StagingCertificateDetailPage.tsx`:

1. Add `const [generateOpened, setGenerateOpened] = useState(false)`.
2. Replace the placeholder alert handler with `setGenerateOpened(true)`.
3. Compute `parentChainRequired` from the fetched detail using the pure helper.
4. Render `GenerateKeyStoreModal` when detail data exists.
5. Pass `certificateKey`, `parentChainRequired`, `onClose`, and `onSuccess={detail.refetch}`.

The page should remain responsible for only page-level state: route path, fetch state, modal open state, and refetching after a successful mutation.

## Architectural Considerations

1. API boundary

   Keep the new endpoint in `stagingCertificateApi.ts` because it is a staging-certificate mutation and can reuse the existing `stagingCertificateResource` path encoding helper.

2. Feature boundary

   Keep modal, hook, and helper files under `src/features/stagingCertificates`. The feature is specific to staging certificate detail state and should not become a generic certificate tool.

3. Parent-chain business rule

   Put the certificate-count rule in a pure helper. This keeps a requirements nuance out of JSX and lets a very small subagent own the rule and its tests.

4. Response handling

   Do not rely on the mutation response to update visible detail state. Always call the page's existing `detail.refetch` after success, because the requirement explicitly says to refresh the page data to show updated information.

5. Error handling

   The modal owns mutation errors. The page should not transition to a page-level error if the generate call fails.

6. Form state

   Use local React state and Mantine components, consistent with existing staging modals. A form library would be unnecessary for one conditional PEM input.

7. Secret handling

   Do not log parent-chain PEM content, include realistic certificate material in snapshots, persist it to local storage, or place it in route state.

8. Accessibility

   The modal title, `Parent Chain` textbox, validation alert, API error alert, cancel button, and generate button should all have accessible names. The field should be absent from the accessibility tree when parent-chain upload is not allowed.

9. Naming

   Use `KeyStore` in API-facing names if matching the backend route casing, but use `Keystore` in user-facing text to match existing UI copy.

10. Test style

   Follow `requirements.md` as product test guidance: every UI component gets a simple unit test, avoid nested tests, use one setup per test, and combine related assertions where readability stays high.

## Maximum Parallel Subagent Breakdown

The tasks below are intentionally sliced small so the implementation can be distributed across many subagents. Contract tasks should land first; modal, hook, page, and tests can then proceed concurrently against those contracts.

| Subagent | Area | Deliverable | Depends On |
| --- | --- | --- | --- |
| 1 | Payload type | Add `GenerateKeyStorePayload` as a string alias in staging certificate types | None |
| 2 | API helper contract | Add `generateKeyStore(path, payload)` in `stagingCertificateApi.ts` | 1 |
| 3 | API helper test | Extend API test to verify `/generateKeyStore` endpoint and payload | 2 |
| 4 | Parent-chain helper | Add `shouldRequireParentChain(detail)` pure helper | None |
| 5 | Parent-chain helper tests | Cover one certificate, multiple certificates, empty array, null certificates, missing keyPair | 4 |
| 6 | Hook shell | Create `useGenerateKeyStore` with idle state and reset | 1, 2 |
| 7 | Hook success path | Implement submit success state and returned data | 6 |
| 8 | Hook error path | Implement error normalization and rethrow behavior | 6 |
| 9 | Hook tests | Verify success, failure, loading transition, reset behavior | 7, 8 |
| 10 | Modal shell | Create `GenerateKeyStoreModal` with title, form, cancel, generate button | None |
| 11 | Modal field rendering | Render required `Parent Chain` only when `parentChainRequired` is true | 10 |
| 12 | Modal validation | Block submit and show validation error when required parent chain is empty | 10, 11 |
| 13 | Modal submit behavior | Trim parent chain and call hook submit with correct payload | 10, 11 |
| 14 | Modal success behavior | Reset, close, and call `onSuccess` after generate succeeds | 13 |
| 15 | Modal error behavior | Keep modal open and show API error after generate failure | 13 |
| 16 | Modal loading behavior | Disable close/cancel/input and show loading button state | 13 |
| 17 | Modal tests | Single simple modal test for required parent-chain flow | 11-15 |
| 18 | Modal tests | Single simple modal test for no-parent-chain flow | 11-15 |
| 19 | Modal tests | Single simple modal test for API error retention | 15 |
| 20 | Detail page state | Add `generateOpened` state to `StagingCertificateDetailPage` | None |
| 21 | Detail page action wiring | Replace placeholder alert with modal open handler | 20 |
| 22 | Detail page helper integration | Compute `parentChainRequired` using the pure helper | 4, 20 |
| 23 | Detail page modal integration | Render `GenerateKeyStoreModal` with path, close, success refetch | 10, 20-22 |
| 24 | Detail page pending-request guard | Confirm generate modal is unavailable while `certificateRequestInfo` exists | 23 |
| 25 | Detail page tests | Update existing placeholder-alert test to submit generate successfully and refetch | 2, 23 |
| 26 | Detail page tests | Cover required parent-chain rendering based on a single certificate | 5, 23 |
| 27 | Detail page tests | Cover field absence when first key entry has multiple certificates | 5, 23 |
| 28 | Existing action test audit | Add or adjust test for conditional `Generate Keystore` button if needed | None |
| 29 | PEM input compatibility | Verify `PemTextareaWithActions` works cleanly inside the new modal | 10, 11 |
| 30 | Styling pass | Add only scoped modal spacing styles if Mantine defaults are insufficient | 10 |
| 31 | Accessibility pass | Check labels, alerts, disabled state, and focus behavior | 10-23 |
| 32 | Security pass | Ensure no parent-chain logging, persistence, snapshots, or debug output | 2, 6, 10-23 |
| 33 | Test integration | Run focused staging and API tests; fix type/test failures | 1-28 |
| 34 | Build integration | Run `npm test` and `npm run build`; fix integration failures | All |

## Suggested Merge Order

1. Add `GenerateKeyStorePayload`, `generateKeyStore`, and the API test.
2. Add the parent-chain helper and helper tests.
3. Add `useGenerateKeyStore` and hook tests.
4. Add `GenerateKeyStoreModal` and modal tests.
5. Wire the modal into `StagingCertificateDetailPage`.
6. Update detail-page tests to replace the placeholder alert expectation with the real generate flow.
7. Run focused tests, then full test and build verification.

## Testing Plan

Focused tests:

- `src/api/stagingCertificateApi.test.ts`
- `src/features/stagingCertificates/generateKeyStore.test.ts`
- `src/features/stagingCertificates/useGenerateKeyStore.test.tsx`
- `src/features/stagingCertificates/GenerateKeyStoreModal.test.tsx`
- `src/features/stagingCertificates/StagingCertificateDetailPage.test.tsx`

Commands:

```sh
npm test -- src/api/stagingCertificateApi.test.ts src/features/stagingCertificates/generateKeyStore.test.ts src/features/stagingCertificates/useGenerateKeyStore.test.tsx src/features/stagingCertificates/GenerateKeyStoreModal.test.tsx src/features/stagingCertificates/StagingCertificateDetailPage.test.tsx
npm test
npm run build
```

Manual verification:

1. Open a staging detail page with `hasMissingKeyStore: true`, no pending request, and exactly one certificate under `keyEntries[0].certificates`.
2. Click `Generate Keystore`.
3. Confirm `Parent Chain` is visible and required.
4. Submit a parent chain and confirm the modal closes after success.
5. Confirm the page refetches and displays updated detail data.
6. Repeat with multiple certificates and confirm no parent-chain upload is allowed.
7. Simulate an API error and confirm the modal stays open with the error visible.

## Acceptance Checklist

- `Generate Keystore` no longer calls the placeholder alert.
- The modal opens from the detail-page action.
- The modal requires `Parent Chain` only when the first key entry has exactly one certificate.
- The modal hides `Parent Chain` and submits an empty string body when the first key entry has multiple certificates.
- The API helper posts to `/stagingCerts/${path}/generateKeyStore`.
- A successful generate call refreshes the detail page data.
- A failed generate call leaves the modal open and shows the error inside the modal.
- Every new UI component has a unit test.
- Tests stay simple, flat, and aligned with the existing repository style.
