## Requirement
Create a new component called "Local Cert Viewer" the follows the following requirements
1. Create a nav for it in the header under the "Tools" nav
2. On the page itself, create two tabs. One with a File update/drag drop component. One second tab, out a multiline textbox with the label "Secret Value". Add an option to paste the contents of the clipboard in the textbox. Add instructions to paste Base64 encoded or plain PEM content in the box.
3. Either on uploading a file in the first tab or submitting text on the second tab with a button, post the contents to the endpoint "/api/tools/parsesecret". Response from the API can be infered from the sample.json file
4. Render the response in the same format as the "Keystore Details" page with the ability to view individual rows that can be expanded to show certificate chain
5. Allow the user to reset view to be able to upload a different secret

## Unit Tests
1. Every UI component will have a unit test
2. Each unit test will be simple. No nested tests. Given a single set of setup create a single test with multiple asserts.
3. Combine multiple tests in one when possible
4. Strive for simplicity, not maximum coverage