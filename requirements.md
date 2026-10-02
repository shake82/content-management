## Requirement
Create a new component called "Staging Certificates" the follows the following requirements
### Navigation and Access
1. Create a nav for it in the header
2. The nav and page should only be accessible if the current user has the permission "MANAGE_STAGING_CERTS"
### API
1. Use the API "/api/stagingCert" to get data. Response is a simple string array with vault keys. All data is retrieved in one go and no server side paging is required
2. For each item in the response, use the API "/api/stagingCert/<key>/getStatus" to get the detailed status on the item. Using axios, rate limit the requests such that only 3 requests should be in flight at a time with the rest waiting until space is available
  - format of this response is available in the sample.json file
3. Create Certificate request API: POST request to "/api/stagingCert". data format is the same as the GenerateCertificateRequestPayload interface. Reponse has two properties: "path" and "version"
### Render
#### Data table
1. Render similar to the "Certificate View" with a datatable. However the paging is entirely on the client side.
2. Only retreive the status of a row that has been rendered (from teh API section)
3. Table columns: 
  - "Name" coming from the first API
  - "Is Valid" coming from the Second API. These needs to show to seperate indicators:
    - Validity indicator with tooltip just like the "Certificate View" component. Color the indicator based on the highest severity. e.g. if both medium and high severity issues are present, show the highest severity indicator. And show all issues in the tooltip
    - Workflow issues indicator based on the missing/pending flags in the response. Have a seperate icon/color for each state
4. Add the ability to filter data in table as elsewhere. Filtering is entirely client side. 
5. Allow to navigate to a new detail component that takes the key as an argument. At the moment show only the title with the key name and a breadcrumb component to return back on this component.
#### New button
1. Create a "New" button with icon. This open a modal window with the Certificate Request Generator component. The existing validations remain the same
2. On successfull submit response, navigate toe the detail component using the "path" prop in the response as key


## Unit Tests
1. Every UI component will have a unit test
2. Each unit test will be simple. No nested tests. Given a single set of setup create a single test with multiple asserts.
3. Combine multiple tests in one when possible
4. Strive for simplicity, not maximum coverage