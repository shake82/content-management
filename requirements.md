## Requirement
Implement the Generate Keystore feature
### API
1. Use the API "/api/stagingCerts/${path}/generateKeyStore" to generate a keystore

### Render
1. On click of a button, show a modal dialog.
2. If in the original page response, under the first item in the keyEntries array, if the certificates array is a single item, then show a Parent Chain text box required field. If there are multiple certificates then do not allow uploading a Parent Chain
3. On clicking generate, call the api to generate keystore. pass the parent chain string as body of the request.
4. On success refresh the data on the page to show updated information.
5. On error, show error on the modal and do not close it 

## Unit Tests
1. Every UI component will have a unit test
2. Each unit test will be simple. No nested tests. Given a single set of setup create a single test with multiple asserts.
3. Combine multiple tests in one when possible
4. Strive for simplicity, not maximum coverage