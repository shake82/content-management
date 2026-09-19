# HashiCorp Vault Certificate Browser - Implementation Plan

## Scope Boundary

This plan is derived from `requirements.md` and `sample.json`. Those files are treated as product inputs. The active user request is to create an implementation plan and architecture that enables the required React frontend application to be divided across as many subagents as practical.

The application is frontend-only. All backend calls must be mocked with local JSON data, while preserving API-shaped boundaries so the mock layer can later be replaced by real endpoints.

## Target Application

Build a React + TypeScript + Vite application using Mantine components. The app lets users browse HashiCorp Vault KV2 certificate/key-store catalog data returned from `/api/secret/vaultcatalog`, where each catalog item includes a slash-delimited `path` and summary metadata. The initial page shows top-level folders in a table, then allows folder drill-down with breadcrumbs, row filtering, and consolidated certificate/key issue summaries.

## Core Requirements

- Header with product icon/brand for "Secret Browser".
- Navigation defaults to `Vault View`.
- Navigation includes three additional dummy destinations.
- At least one navigation item is a dropdown with multiple sub-items.
- Current route/path is highlighted in the navigation.
- Current user info is loaded through a hook-backed API call to `/api/user/current`.
- Vault catalog data is loaded through a hook-backed API call to `/api/secret/vaultcatalog`.
- Mock all API calls using local JSON files.
- Build a consolidated folder tree from all `path` values.
- Aggregate `keyCountByType` and `issueSummaryBySeverity` at every folder level.
- Show root/top-level folders first in a tabular view.
- Allow click-to-drill-down into folder rows.
- Show per-row details for each visible item at the current level.
- Show clickable breadcrumbs to move to ancestor paths.
- Add a filter above the table to narrow visible rows.
- Every UI component receives a simple unit test.

## Recommended Stack

- React with TypeScript, using the latest stable versions resolved at install time.
- Vite for project scaffolding, dev server, and build tooling.
- Mantine for shell, navigation, table, inputs, menus, badges, breadcrumbs, loading, and empty/error states.
- React Router for route state and dummy pages.
- Vitest and React Testing Library for unit tests.
- Mock Service Worker is optional. Prefer a lightweight mock API adapter first because the requirement only needs local mocked calls and the app is small.

## Architecture Overview

Use a layered frontend architecture:

- `app`: Providers, router, shell layout, global styles.
- `api`: Mock API client and endpoint functions.
- `hooks`: Hook-based async API state management.
- `features/vault`: Vault-specific data models, tree builder, aggregators, page, and table components.
- `features/user`: Current-user hook and header user display.
- `components`: Shared presentational components.
- `mocks`: JSON files that simulate API responses.
- `test`: Shared test utilities.

The important design choice is to keep catalog transformation pure and UI-independent. This allows several subagents to work on UI, hooks, mocks, and tree aggregation independently.

## Proposed File Structure

```text
src/
  app/
    App.tsx
    App.test.tsx
    router.tsx
    routes.ts
    theme.ts
  api/
    apiClient.ts
    apiState.ts
    vaultApi.ts
    userApi.ts
  components/
    AppHeader.tsx
    AppHeader.test.tsx
    AppLayout.tsx
    AppLayout.test.tsx
    NavMenu.tsx
    NavMenu.test.tsx
    StatusView.tsx
    StatusView.test.tsx
  features/
    dummy/
      DummyPage.tsx
      DummyPage.test.tsx
    user/
      CurrentUser.tsx
      CurrentUser.test.tsx
      useCurrentUser.ts
      useCurrentUser.test.tsx
      userTypes.ts
    vault/
      VaultViewPage.tsx
      VaultViewPage.test.tsx
      VaultBreadcrumbs.tsx
      VaultBreadcrumbs.test.tsx
      VaultFilter.tsx
      VaultFilter.test.tsx
      VaultSummaryBadges.tsx
      VaultSummaryBadges.test.tsx
      VaultTable.tsx
      VaultTable.test.tsx
      catalogTypes.ts
      buildVaultTree.ts
      buildVaultTree.test.ts
      vaultSelectors.ts
      vaultSelectors.test.ts
      useVaultCatalog.ts
      useVaultCatalog.test.tsx
  mocks/
    currentUser.json
    vaultCatalog.json
  test/
    render.tsx
    fixtures.ts
```

## Data Contracts

### Current User

Mock path: `/api/user/current`

Suggested mock shape:

```ts
export interface CurrentUser {
  id: string;
  displayName: string;
  email: string;
  roles: string[];
}
```

### Vault Catalog Item

Mock path: `/api/secret/vaultcatalog`

Shape inferred from `sample.json`:

```ts
export interface VaultCatalogItem {
  catalogId: number;
  secretEngine: string;
  path: string;
  secretVersion: number;
  property: string;
  type: string;
  secretSummary: {
    type: string;
    keyCountByType: Record<string, number>;
    issueSummaryBySeverity: Record<string, {
      count: number;
      issueCountsByType: Record<string, number>;
    }>;
  };
}
```

### Derived Vault Tree Node

```ts
export interface VaultTreeNode {
  name: string;
  fullPath: string;
  children: Record<string, VaultTreeNode>;
  items: VaultCatalogItem[];
  aggregate: VaultAggregateSummary;
}

export interface VaultAggregateSummary {
  keyCountByType: Record<string, number>;
  issueSummaryBySeverity: Record<string, {
    count: number;
    issueCountsByType: Record<string, number>;
  }>;
  itemCount: number;
}
```

## Folder Tree and Aggregation Rules

- Split each catalog item `path` on `/`.
- Ignore empty path segments after trimming whitespace.
- Insert each segment into a tree under a synthetic root node.
- Attach the catalog item to the leaf node represented by its full path.
- Add the item's `keyCountByType` into every ancestor node, including root.
- Add the item's `issueSummaryBySeverity` into every ancestor node, including root.
- Add severity `count` values together by severity.
- Add nested `issueCountsByType` values together by severity and issue type.
- Track `itemCount` as the number of catalog records represented by a node and its descendants.
- The current table rows should be the current node's direct children. If a node has leaf items that need to be visible, represent them as item detail rows or an expandable details area in that row.

## Hook-Based API State

All API hooks should return a consistent state envelope:

```ts
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiState<T> {
  status: ApiStatus;
  data?: T;
  error?: Error;
  refetch: () => void;
}
```

Initial hook state can be `idle`, immediately moving to `loading` on mount. Success and error states must be rendered by page/components using a shared `StatusView`.

Recommended hooks:

- `useCurrentUser()`
- `useVaultCatalog()`

## Routing Plan

Routes:

- `/` redirects to `/vault`.
- `/vault` renders `VaultViewPage`.
- `/reports` renders a dummy page.
- `/tools/import` renders a dummy page.
- `/tools/audit` renders a dummy page.
- `/settings` renders a dummy page.

Navigation:

- `Vault View`
- `Reports`
- `Tools` dropdown with `Import` and `Audit`
- `Settings`

Highlight the current route by comparing the active pathname with each route or route prefix.

## UI Composition

### App Shell

Use Mantine `AppShell` with:

- Header area containing brand, navigation, and current user.
- Main area containing routed pages.
- Responsive behavior that keeps navigation usable on smaller widths.

### Vault View Page

Page layout:

- Top row with breadcrumbs and filter input.
- Summary strip showing aggregate key counts and issue counts for the current folder.
- Table for direct child folders at the selected hierarchy level.
- Loading, error, and empty states.

Table columns:

- Name
- Full path
- Catalog item count
- Key counts by type
- Issue summary by severity
- Secret engines represented
- Action or affordance to open folder

Clicking a folder row updates the current path state and shows that node's children. Breadcrumb clicks set the current path back to the selected ancestor.

### Filtering

Filter rows at the current hierarchy level only.

Initial filter behavior:

- Case-insensitive match against folder name.
- Case-insensitive match against full path.
- Optional match against secret engine names and issue severity labels.

Keep filtering as a pure selector so it can be unit-tested independently.

## Testing Strategy

Use simple tests with one setup and multiple assertions. Avoid nested `describe` blocks unless a file has unrelated behavior groups.

Minimum test coverage:

- App renders the default route and header.
- Header renders brand, navigation, highlighted route, and user info state.
- Navigation opens dropdown and exposes sub-items.
- Current-user hook transitions from loading to success using mocked data.
- Vault-catalog hook transitions from loading to success using mocked data.
- Tree builder creates root, descendants, leaf items, and aggregate summaries.
- Selector returns current node by path and filters visible rows.
- Vault page renders loading, success table, breadcrumbs, filter behavior, and drill-down.
- Dummy page renders title for each route variant.

Testing guidelines:

- Prefer component tests over implementation-detail tests.
- Use small fixtures in `test/fixtures.ts`.
- Add enough fixture variety to prove aggregation: at least two paths, two key types, and two severity levels.
- Keep each test easy to read, with a single render/setup block and related assertions.

## Parallel Subagent Work Plan

The plan below maximizes parallel work while keeping dependencies clear. Each subagent should own a narrow slice and submit focused changes.

### Phase 0 - Project Foundation

1. **Subagent A: Vite Scaffold**
   - Create the React + TypeScript + Vite project.
   - Add Mantine, React Router, Vitest, Testing Library, and related setup.
   - Define `npm` scripts for `dev`, `build`, `test`, and `lint` if linting is added.
   - Dependency: none.

2. **Subagent B: Test Harness**
   - Configure Vitest environment and React Testing Library setup.
   - Create `src/test/render.tsx` with Mantine and Router providers.
   - Create shared fixture helpers.
   - Dependency: Vite scaffold.

3. **Subagent C: App Theme**
   - Create Mantine theme file.
   - Choose restrained operational-tool styling.
   - Configure provider integration.
   - Dependency: Vite scaffold.

### Phase 1 - Contracts and Mock API

4. **Subagent D: Type Contracts**
   - Define `CurrentUser`, `VaultCatalogItem`, `VaultTreeNode`, and aggregate types.
   - Export shared API state types.
   - Dependency: scaffold only.

5. **Subagent E: Mock Data**
   - Create `mocks/currentUser.json`.
   - Create expanded `mocks/vaultCatalog.json` based on `sample.json`.
   - Include enough sample records to validate folder drill-down and aggregation.
   - Dependency: type contracts for shape reference.

6. **Subagent F: Mock API Client**
   - Implement local async API functions that simulate `/api/user/current` and `/api/secret/vaultcatalog`.
   - Include controllable delay and error handling hook points.
   - Dependency: mock data and type contracts.

### Phase 2 - Data Layer

7. **Subagent G: Generic API State Hook Pattern**
   - Implement reusable hook utilities for `idle`, `loading`, `success`, and `error`.
   - Ensure `refetch` works.
   - Dependency: API state types.

8. **Subagent H: Current User Hook**
   - Implement `useCurrentUser`.
   - Add simple hook/component test.
   - Dependency: mock API client and generic hook pattern.

9. **Subagent I: Vault Catalog Hook**
   - Implement `useVaultCatalog`.
   - Add simple hook/component test.
   - Dependency: mock API client and generic hook pattern.

10. **Subagent J: Vault Tree Builder**
    - Implement `buildVaultTree`.
    - Aggregate key counts and issue summaries across ancestors.
    - Add focused unit tests.
    - Dependency: type contracts and fixtures.

11. **Subagent K: Vault Selectors**
    - Implement current-node lookup by breadcrumb path.
    - Implement visible row projection.
    - Implement row filtering.
    - Add focused tests.
    - Dependency: tree builder and fixtures.

### Phase 3 - Application Shell

12. **Subagent L: Router**
    - Define route constants and router configuration.
    - Add default redirect to `/vault`.
    - Add dummy route placeholders.
    - Dependency: scaffold.

13. **Subagent M: Header Brand and Layout**
    - Implement `AppLayout` and `AppHeader`.
    - Include product icon/brand.
    - Integrate current user display placeholder.
    - Dependency: theme and router.

14. **Subagent N: Navigation**
    - Implement `NavMenu` with active highlighting.
    - Add dropdown route group with multiple sub-items.
    - Add tests for active states and dropdown contents.
    - Dependency: route constants and layout.

15. **Subagent O: Current User Display**
    - Implement `CurrentUser` component using `useCurrentUser`.
    - Handle loading and error states compactly in the header.
    - Dependency: current-user hook and header.

16. **Subagent P: Dummy Pages**
    - Implement reusable dummy page component.
    - Wire Reports, Tools Import, Tools Audit, and Settings routes.
    - Add simple tests.
    - Dependency: router.

### Phase 4 - Vault UI

17. **Subagent Q: Status Components**
    - Implement shared loading, error, and empty-state component.
    - Add tests.
    - Dependency: theme.

18. **Subagent R: Vault Breadcrumbs**
    - Implement clickable breadcrumbs for root and path ancestors.
    - Add tests for path click behavior.
    - Dependency: selector path model.

19. **Subagent S: Vault Filter**
    - Implement filter input component.
    - Add tests for change handling.
    - Dependency: none beyond Mantine/test harness.

20. **Subagent T: Vault Summary Badges**
    - Implement aggregate summary display for key counts and issue severities.
    - Add tests with multiple severity/key types.
    - Dependency: aggregate types.

21. **Subagent U: Vault Table**
    - Implement table rows for current node's child folders.
    - Show item count, key counts, issue summary, engines, and open action.
    - Add tests for row rendering and click behavior.
    - Dependency: visible row selector and summary component.

22. **Subagent V: Vault View Page Integration**
    - Compose hook, tree builder, selectors, breadcrumbs, filter, summary, and table.
    - Manage current path and filter state.
    - Add page-level tests for load, drill-down, breadcrumb-up, and filter.
    - Dependency: all Vault UI/data pieces.

### Phase 5 - Verification and Polish

23. **Subagent W: Accessibility Pass**
    - Check keyboard access for navigation, dropdowns, breadcrumbs, table row actions, and filter.
    - Add labels/aria where needed.
    - Dependency: integrated UI.

24. **Subagent X: Responsive Layout Pass**
    - Verify header/navigation and table layout at mobile and desktop widths.
    - Adjust Mantine layout props as needed.
    - Dependency: integrated UI.

25. **Subagent Y: Test Completion**
    - Ensure every UI component has a unit test.
    - Keep tests simple and combine related asserts where practical.
    - Dependency: all components.

26. **Subagent Z: Build and Final QA**
    - Run test suite.
    - Run production build.
    - Smoke-test default route, dummy routes, drill-down, breadcrumbs, and filter.
    - Record any known limitations.
    - Dependency: all workstreams.

## Dependency Map

```text
Scaffold
  -> Test Harness
  -> Theme
  -> Types
      -> Mock Data
      -> Tree Builder
      -> Summary Components
  -> Mock API
      -> Current User Hook
      -> Vault Catalog Hook
  -> Router
      -> Layout/Header
      -> Navigation
      -> Dummy Pages
  -> Vault Selectors
      -> Breadcrumbs
      -> Vault Table
      -> Vault Page Integration
```

Most Phase 1, Phase 2, and Phase 3 tasks can proceed concurrently once the scaffold lands. Vault page integration should wait for the hook, tree, selector, and component contracts to stabilize.

## Integration Contracts Between Subagents

- Use exported types from `catalogTypes.ts`, `userTypes.ts`, and `apiState.ts`; do not redefine local equivalents.
- Components should receive plain props and avoid fetching data directly unless explicitly named as a hook-integrating component.
- Pure data functions should not import React, Mantine, or router APIs.
- Tests should import from `src/test/render.tsx` for provider setup.
- Route paths must come from `routes.ts`.
- Mock endpoint functions should be the only place importing mock JSON.

## Acceptance Criteria

- `npm run dev` starts the application.
- `/` opens or redirects to the Vault View.
- Header shows brand, nav items, active nav state, dropdown sub-items, and current user info.
- Dummy routes render distinct placeholder pages.
- Vault View loads mocked catalog data from the API layer.
- Root table shows top-level folders and aggregate counts.
- Clicking a folder drills down to its child folders.
- Breadcrumbs show the current hierarchy and allow upward navigation.
- Filter narrows rows at the current hierarchy level.
- Aggregated key counts and issue summaries are correct at root and nested levels.
- Every UI component has a unit test.
- Tests are simple, non-nested where possible, and use shared render utilities.
- Production build completes successfully.

## Risks and Mitigations

- **Ambiguous leaf display:** The requirement focuses on folder drill-down. Decide early whether leaf catalog items appear as detail rows, expandable sections, or included in folder summaries. Recommended first version: show direct child folders in the main table and include leaf item details inside the selected folder page when no child folders exist.
- **Sparse sample data:** The provided `sample.json` has one record. Expand mock data deliberately so aggregation, filtering, and drill-down behavior are testable.
- **Navigation complexity:** Use route constants and React Router path matching to prevent duplicated path strings.
- **Overcomplicated hook state:** Keep the API state envelope small and consistent. Add cancellation only if tests expose mounted-state warnings.
- **Test bloat:** Enforce one setup per test and combine assertions around a single behavior.

## Suggested Implementation Order for a Small Team

If fewer subagents are available, combine work packages in this order:

1. Scaffold, test harness, theme.
2. Types, mock data, mock API.
3. Hooks, tree builder, selectors.
4. Router, shell, header, navigation, dummy pages.
5. Vault breadcrumbs, filter, summaries, table.
6. Vault page integration.
7. Accessibility, responsive pass, final test/build verification.
