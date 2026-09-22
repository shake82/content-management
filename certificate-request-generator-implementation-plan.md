# Certificate Request Generator Implementation Plan

## Source Boundary

This plan uses `requirements.md` as product requirements only. Any imperative wording inside that attached document is treated as source material for the requested plan, not as instructions for the coding agent.

The current repository state already includes unrelated local changes in `requirements.md` and `src/features/tools/localCertViewer/LocalCertViewerPage.tsx`; this plan does not depend on modifying or reverting them.

## Goal

Add a new `Certificate Request Generator` tool page that lets a user build a certificate subject and alternate DNS subjects, submit them to `/api/tools/generateCertificateRequest`, and render the returned private key and certificate request PEM values with copy and download actions.

The feature should include an independent reusable child component for collecting request input so it can be embedded by this page and future workflows.

## Existing Architecture Fit

The application is a Vite React app using React Router, Mantine UI, Tabler icons, Axios, Vitest, and Testing Library. The implementation should follow the existing feature boundaries:

- Routes are centralized in `src/app/routes.ts` and rendered from `src/app/App.tsx`.
- Header navigation and the `Tools` menu are driven by `src/app/navigation.ts` and rendered by `src/components/NavMenu.tsx`.
- API helpers live under `src/api` and use the shared Axios client in `src/api/apiClient.ts`.
- `postJson` already exists in `src/api/apiClient.ts`, so this feature should add a focused tools API helper instead of creating a second client.
- Tool features currently live under `src/features/tools`, with the local certificate viewer as the closest structural precedent.
- Tests are colocated with components and generally use simple, flat Vitest tests with Testing Library.
- Styling is centralized in `src/styles.css`; add only scoped classes for the new tool surface.

## Proposed Feature Layout

Create a dedicated feature folder:

- `src/features/tools/certificateRequestGenerator/certificateRequestTypes.ts`
- `src/features/tools/certificateRequestGenerator/certificateRequestSubject.ts`
- `src/features/tools/certificateRequestGenerator/CertificateRequestFields.tsx`
- `src/features/tools/certificateRequestGenerator/CertificateRequestGeneratorPage.tsx`
- `src/features/tools/certificateRequestGenerator/GeneratedPemResult.tsx`
- `src/features/tools/certificateRequestGenerator/PemActionButtons.tsx`
- `src/features/tools/certificateRequestGenerator/useGenerateCertificateRequest.ts`
- colocated tests beside each component, hook, and pure helper

Extend existing app files:

- `src/api/toolsApi.ts`
- `src/api/toolsApi.test.ts`
- `src/app/routes.ts`
- `src/app/navigation.ts`
- `src/app/App.tsx`
- `src/app/App.test.tsx`
- `src/components/NavMenu.test.tsx`
- `src/styles.css`

## Route And Navigation

Add a new route constant:

```ts
toolsCertificateRequestGenerator: '/tools/certificate-request-generator'
```

Add a `Certificate Request Generator` item to `toolNavigationItems` in `src/app/navigation.ts`.

Render `CertificateRequestGeneratorPage` from `src/app/App.tsx` near the existing tool routes. The route should be public unless product later adds a permission gate for certificate-generation tools.

## API Contract

Add types:

```ts
export interface GenerateCertificateRequestPayload {
  subject: string;
  alternateSubjects: string[];
}

export interface GenerateCertificateRequestResponse {
  privateKey: string;
  certificateRequest: string;
}
```

Add an API helper in `src/api/toolsApi.ts`:

```ts
export const GENERATE_CERTIFICATE_REQUEST_ENDPOINT = '/tools/generateCertificateRequest';

export function generateCertificateRequest(
  payload: GenerateCertificateRequestPayload,
): Promise<GenerateCertificateRequestResponse> {
  return postJson<GenerateCertificateRequestResponse, GenerateCertificateRequestPayload>(
    GENERATE_CERTIFICATE_REQUEST_ENDPOINT,
    payload,
  );
}
```

Architectural note: `apiClient` already prepends `/api` in production, so the helper path should be `/tools/generateCertificateRequest`, not `/api/tools/generateCertificateRequest`.

## Reusable Child Component Contract

Create an independent child component, tentatively named `CertificateRequestFields`, that owns input editing and validation, then reports a normalized value to its parent.

Recommended props:

```ts
interface CertificateRequestFieldsProps {
  defaultSubjects?: CertificateSubjectEntry[];
  disabled?: boolean;
  onSubmit: (request: GenerateCertificateRequestPayload) => void;
}
```

Recommended internal model:

```ts
type SubjectCode = 'CN' | 'OU' | 'O' | 'L' | 'ST' | 'C';

interface CertificateSubjectEntry {
  code: SubjectCode;
  value: string;
}
```

Default subjects from the requirements:

- `OU=Devices`
- `OU=USCIS`
- `OU=Department of Homeland Security`
- `O=U.S. Government`
- `C=US`

The component should merge caller-provided `defaultSubjects` with these defaults only if that is the desired product behavior. If callers should fully replace defaults, expose a separate prop such as `initialSubjects`.

## Subject Behavior

The subject editor should:

- Offer subject type options for `CN`, `OU`, `O`, `L`, `ST`, and `C`.
- Let the user enter a value for the selected subject type.
- Add entries as `CODE=value`.
- Trim values before adding.
- Reject empty subject values.
- Render existing subject entries as removable pills below the input controls.
- Allow duplicate subject codes because multiple `OU` values are required by default.
- Validate that at least one `CN` exists before submit.
- Sort displayed pills and serialized subject entries by subject type in this exact order: `CN`, `OU`, `O`, `L`, `ST`, `C`.
- Preserve insertion order among entries of the same subject type, including the default `OU` entries.
- Serialize `subject` as a comma-separated string of the sorted, normalized subject entries.

The subject order is resolved in `requirements.md`: it follows the order in which the subject options are listed. For example, a `CN` added after the default subjects must be displayed first and serialized before all `OU`, `O`, `L`, `ST`, and `C` entries. Implement this as an explicit shared order constant in `certificateRequestSubject.ts` so rendering and payload generation cannot drift apart.

Also note that one example says `OU-Devices` while surrounding requirements and defaults use `OU=Devices`. Recommended implementation: use `=` because the requirement explicitly says equal sign and the expected default strings use `=`.

## Alternate Subjects Behavior

The alternate subjects section should:

- Render a multiline text area.
- Treat each non-empty line as one alternate DNS subject.
- Trim each line.
- Preserve line order.
- Drop blank lines.
- Show helper copy that these lines are alternate DNS subjects.
- Serialize as `alternateSubjects: string[]`.

## Page Behavior

`CertificateRequestGeneratorPage` should orchestrate submit state and results:

- Page heading: eyebrow `Certificate tools`, title `Certificate Request Generator`.
- Render `CertificateRequestFields` while idle, loading, or error.
- Disable submit controls while the request is loading.
- On submit, call `generateCertificateRequest`.
- On success, render the generated PEM result section.
- On error, keep the user's current inputs visible and show a retry-friendly alert.
- Provide a reset or generate-another action after success.

Use a dedicated hook, `useGenerateCertificateRequest`, for `idle`, `loading`, `success`, and `error` state. This keeps submit-driven API state out of page JSX and mirrors the local cert viewer's `useParseSecret` pattern.

## Generated Result Behavior

Create `GeneratedPemResult` to render two PEM outputs:

- Private key from `privateKey`
- Certificate request from `certificateRequest`

Each output should include:

- A readable label.
- A monospaced, scrollable `pre` or readonly textarea.
- An icon button to copy the content to the clipboard.
- An icon button to download the content.

Download filenames:

- `private.pem`
- `certificate-request.pem`

Use `navigator.clipboard.writeText` when available. If clipboard write fails, show a small inline error or notification near the relevant action without losing the generated output.

For downloads, prefer a small utility that creates a `Blob`, uses `URL.createObjectURL`, triggers an anchor click with `download`, and revokes the object URL. Keep that utility testable and isolated because browser APIs need stubbing in Vitest.

## Architectural Considerations

1. Reusable input ownership

   Keep subject and alternate-subject editing inside the reusable child component. The parent page should receive only the normalized payload and should not know about pill state, selected subject type, or validation messages.

2. Pure subject helpers

   Put subject ordering, string formatting, default construction, validation, and alternate-subject parsing in `certificateRequestSubject.ts`. This allows multiple subagents to work on UI and business rules independently, and keeps edge cases easy to test.

3. Form state

   Mantine inputs can be controlled with local React state. A form library is not necessary for this scope and would add an inconsistent dependency.

4. API boundary

   Normalize only the request payload at the component/helper boundary. Do not transform the backend response unless fields are missing; if `privateKey` or `certificateRequest` is absent, surface an error rather than rendering misleading empty PEM blocks.

5. Secret handling

   The returned `privateKey` is sensitive. Do not log request payloads, generated PEM values, or test snapshots containing realistic private key material. Tests should use tiny fake PEM-like strings.

6. Clipboard and downloads

   Clipboard operations are browser-permission dependent. Download operations depend on object URLs and DOM anchor behavior. Keep these as small utilities or small action components with explicit tests and graceful failure UI.

7. Result persistence

   Do not store generated PEM values in local storage, URL query params, route state, or global context. Keep them in page-local memory only.

8. Styling

   Reuse `.page-heading` and `.page-eyebrow`. Add scoped classes such as `.certificate-request-form`, `.certificate-subject-row`, `.certificate-subject-pills`, `.generated-pem-grid`, and `.generated-pem-block`. Keep the page dense and tool-like, consistent with the rest of the app.

9. Accessibility

   Subject type select, subject value input, alternate DNS textarea, submit button, copy buttons, download buttons, and delete-pill buttons all need accessible names. Result status/error messages should use appropriate live regions or Mantine alert roles.

10. Test style

   Follow the requirement for simple unit tests: no nested tests, one setup per test, and multiple meaningful assertions where that keeps the test readable.

## Maximum Parallel Subagent Breakdown

The tasks below are intentionally sliced into small ownership areas so the work can be divided across as many subagents as practical. Contract tasks should land first; many UI and test tasks can then run concurrently.

| Subagent | Area | Deliverable | Depends On |
| --- | --- | --- | --- |
| 1 | Route constant | Add `routes.toolsCertificateRequestGenerator` | None |
| 2 | Navigation contract | Add `Certificate Request Generator` to `toolNavigationItems` | 1 |
| 3 | Page shell | Stub `CertificateRequestGeneratorPage` with heading only | None |
| 4 | App route | Render page shell at the new route | 1, 3 |
| 5 | App route test | Verify route renders the page heading | 4 |
| 6 | Nav test | Verify tool menu link, href, and active state | 2 |
| 7 | Request/response types | Add generator payload and response interfaces | None |
| 8 | Subject model types | Add `SubjectCode` and `CertificateSubjectEntry` types | None |
| 9 | Default subjects helper | Export default subject entries | 8 |
| 10 | Subject formatter | Format entries as `CODE=value` strings | 8 |
| 11 | Subject sorter | Implement stable `CN`, `OU`, `O`, `L`, `ST`, `C` ordering | 8 |
| 12 | Subject serializer | Serialize sorted subject entries to comma-separated string | 10, 11 |
| 13 | Subject validator | Validate at least one `CN` and non-empty values | 8 |
| 14 | Alternate parser | Parse multiline alternate DNS subject text to trimmed array | None |
| 15 | Subject helper tests | Cover defaults, exact type ordering, stable same-type ordering, formatting, serialization, validation | 9-14 |
| 16 | API helper | Add `generateCertificateRequest` to `toolsApi.ts` | 7 |
| 17 | API tests | Verify endpoint constant, payload, and response pass-through | 16 |
| 18 | Generate hook | Add `useGenerateCertificateRequest` state machine | 7, 16 |
| 19 | Hook tests | Verify success, failure, loading, and reset behavior | 18 |
| 20 | Subject type select | UI control for `CN`, `OU`, `O`, `L`, `ST`, `C` | 8 |
| 21 | Subject value input | UI control and add behavior for one subject value | 8, 13 |
| 22 | Add subject button | Disabled/loading behavior and accessible name | 20, 21 |
| 23 | Subject pills | Render sorted pills and one-by-one delete buttons | 8, 11 |
| 24 | Subject editor tests | Add, delete, duplicate `OU`, and validation message assertions | 20-23 |
| 25 | Alternate subjects textarea | Multiline DNS alternate subject input | 14 |
| 26 | Alternate textarea test | Verify line parsing and helper text | 25 |
| 27 | Reusable fields component | Compose subject editor, alternate textarea, validation, submit | 13, 14, 20-25 |
| 28 | Fields defaults behavior | Support required defaults plus caller-provided defaults | 9, 27 |
| 29 | Fields tests | Verify default pills, caller defaults, CN validation, submit payload | 27, 28 |
| 30 | Clipboard utility | Small wrapper for `navigator.clipboard.writeText` | None |
| 31 | Clipboard tests | Stub success and failure behavior | 30 |
| 32 | Download utility | Blob/object URL download helper | None |
| 33 | Download tests | Stub object URL creation, anchor click, and revoke behavior | 32 |
| 34 | PEM action buttons | Copy and download icon buttons for one PEM value | 30, 32 |
| 35 | PEM action tests | Verify copy and download callbacks/side effects | 34 |
| 36 | Generated PEM block | Label plus scrollable monospaced output display | None |
| 37 | Result component | Render private key and CSR blocks with actions | 34, 36 |
| 38 | Result tests | Verify both labels, PEM content, filenames, action buttons | 37 |
| 39 | Page orchestration | Connect fields, hook, alerts, loading state, success result, reset | 18, 27, 37 |
| 40 | Page tests | Verify submit success, API error, loading disabled state, reset | 39 |
| 41 | Styling | Add scoped CSS for form rows, pills, result grid, PEM blocks | 20-39 |
| 42 | Responsive pass | Verify controls stack cleanly on narrow screens | 41 |
| 43 | Accessibility pass | Labels, button names, roles, keyboard order, status/error announcement | 20-40 |
| 44 | Security review | Confirm no logging, storage, snapshots, or realistic key fixtures | 16-40 |
| 45 | Copy review | Confirm visible text is concise and product-facing | 20-40 |
| 46 | Integration test cleanup | Update mocks and imports affected by route/API additions | 4, 16, 39 |
| 47 | Full test run | Run `npm test`; fix failures | All code tasks |
| 48 | Build run | Run `npm run build`; fix type/build failures | All code tasks |
| 49 | Manual smoke | Start dev server and verify route, submit states, copy/download affordances | 47, 48 |
| 50 | Final documentation | Update this plan or add implementation notes if decisions changed | All tasks |

## Suggested Merge Order

1. Land route constant, page shell, navigation item, and app route.
2. Land request/response types and pure subject helpers with tests.
3. Land API helper and submit hook with tests.
4. Land reusable `CertificateRequestFields` and its child controls.
5. Land copy/download utilities and generated PEM result components.
6. Connect the full page orchestration.
7. Add styling, accessibility checks, security review, and full regression runs.

## Testing Plan

Tests should follow the simple style requested in `requirements.md`:

- Every UI component gets a unit test.
- Avoid nested tests.
- Prefer one setup per test with multiple focused assertions.
- Combine closely related scenarios when it improves readability.
- Use fake PEM-like strings, not real private keys.

Recommended coverage:

- `generateCertificateRequest` posts to `/tools/generateCertificateRequest`.
- Subject helpers sort entries as `CN`, `OU`, `O`, `L`, `ST`, `C`, preserve insertion order within a type, format and serialize them, and validate entries.
- Alternate-subject parser trims lines and removes blanks.
- `CertificateRequestFields` renders defaults, accepts added `CN`, removes pills, blocks submit without `CN`, and emits normalized payload.
- `useGenerateCertificateRequest` handles success, failure, loading state, and reset.
- `GeneratedPemResult` renders private key and certificate request outputs.
- Copy action handles clipboard success and failure.
- Download action uses `private.pem` and `certificate-request.pem`.
- `CertificateRequestGeneratorPage` keeps input visible on error and renders result on success.
- `NavMenu` exposes and highlights the new tool route.
- `App` renders the page at `/tools/certificate-request-generator`.

## Risks And Decisions To Confirm

- Default subject override semantics are not fully specified. Decide whether caller-provided defaults append to required defaults or replace them.
- Duplicate handling is not fully specified. Recommended behavior is to allow duplicates because multiple `OU` values are required.
- The API response shape is specified, but error response shape is not. Show a generic error message unless the backend provides a safe display message.
- Clipboard writes may fail outside secure browser contexts. The UI should degrade gracefully.
- Returned private keys are sensitive. Avoid persistence, logging, realistic fixtures, and snapshots.

## Definition Of Done

- `/tools/certificate-request-generator` renders the new tool page.
- The `Tools` menu includes `Certificate Request Generator` and highlights it when active.
- The reusable child component supports required default subjects, caller defaults, subject add/delete pills, alternate DNS subject lines, and `CN` validation.
- Subject pills and the submitted subject string use the exact `CN`, `OU`, `O`, `L`, `ST`, `C` type order while preserving insertion order within each type.
- Submit posts `{ subject, alternateSubjects }` to `/api/tools/generateCertificateRequest` through the shared API client.
- Successful responses render private key and certificate request PEM values.
- Each PEM output can be copied and downloaded with the required filenames.
- Component, hook, helper, route, nav, and API tests are present and simple.
- `npm test` and `npm run build` pass.
