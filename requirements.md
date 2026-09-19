# hashicorp vault certificate browser

## Context
This application should let you browse the vault to view Java key store contents stored in its KV2 secret engine as base64 encoded within a json property
API for the application already exists. It returns content in the form of the sample.json file attached. Only build the react front end app

## Setup
1. All API calls need to be mocked. Create JSON files that mock API calls.

## Requirement
### Header
1. Header should create an icon/brand for secret browser.
2. Navigation:
  - It should contain mutiple navigational items. Default to the "Vault View". 
  - Create three more that navigate to a dummy page. 
    - Have atleast one of them be a dropdown menu with multiple sub items. 
  - The current navigational path must be highlighted in the menu
3. Show the current logged in user's information. The data for this needs to come from an API call from path "/api/user/current"
### "Vault View" page
1. Get data from an API call to path "/api/secret/vaultcatalog". Data format can be infered from the sample.json file. All data is returned on the first call and there are no paging requirements
2. Create a data structure that consolidates all the "path" properties to create a folder structure. Also consolidate the keyCountByType and issueSummaryBySeverity properties as well
3. Show the top level folder in a tabular format initially. Also show the consolidated content and issue summary at the root folder level.
4. Let the user drill down to sub paths, expanding on each click. Show details per row for each item at the current level
5. Show breadcrumbs that show at which level of hierarchy you are. Let the user click on the breadcrumbs to move up to a higher level
6. Add a filter at the top to narrow down rows



## Toolset
1. Latest version of react
2. Typescript
3. Vite
4. mantine react components

## Architectural Expections
1. All API calls will be hook based that will cycle through different states (called, success, failed etc)

## Unit Tests
1. Every UI component will have a unit test
2. Each unit test will be simple. No nested tests. Given a single set of setup create a single test with multiple asserts.
3. Combine multiple tests in one when possible
4. Strive for simplicity, not maximum coverage