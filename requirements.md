## Requirement
Create a new component called "Certificate View" the follows the following requirements
1. Create a nav for it in the header
2. On the page itself, get data  from an API call called "/api/secret/certCatalog". Data format can be infered from the sample.json file. The API supports paging of the format "?pageNumber=0&pageSize=15"
3. Render the data in tabular format with paging. Expected columns are "Type", "Is Valid", "Name", "Expiration". Hovering over the "Is Valid" cell should should the issue in a tooltip if any.
4. All each row to be expanded to show the two sections side by side:
  1. CertificateChain component that shows the current row's certificate chain information
  2. References section that shows all the places the certificate is being used. This can be rendered as a table with two columns, "Path" and "Type". Each row should also have a nav link to open the related "KeystoreDetailsPage" referenced here. This section can have a lot of rows so should have a max height with scrolling
5. Add a search bar the lets the user search. The API above supports searching by adding the querystring param "search"

## Unit Tests
1. Every UI component will have a unit test
2. Each unit test will be simple. No nested tests. Given a single set of setup create a single test with multiple asserts.
3. Combine multiple tests in one when possible
4. Strive for simplicity, not maximum coverage