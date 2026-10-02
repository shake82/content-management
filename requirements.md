## Requirement
Update the StagingCertificateDetailPage
### Route
1. Change the route of stagingCertificates to "/staging"
2. Change the route of stagingCertificateDetail to "/staging/${key}"
### API
1. Use the API "/api/stagingCerts/${path}" to get data. Response format is defined in the sample.json file
2. Upload Certificate API: POST to the path "/api/stagingCerts/${path}". Post data contains two properties: "cert" and "parentChain"

### Render
#### Certificate Request
1. If a certificate request exists (certificateRequestInfo is not null), then show a banner saying that there is a current pending certificate request and upload a new Certificate response to generate a key pair
2. In the banner add three buttons with relavent icons
  - View In Vault: Opens the related vaultPath in a new tab
  - Device enrollment: Opens the device enrolement URL in a new tab. Make this url configurable through a constant variable
  - Upload Certificate: Open the Complete Certificate Request Modal
### Complete Certificate Request Modal
1. Add Two textboxes for PEM content. 
  - New Certificate (Required)
  - Parent Chain (Not Required)
2. Use functionality similar to the Local Certificate Browser 
  - Action button to copy from clipboard
  - Action button to select a file and copy its contents to the related textbox
3. On successful submit, refetch the "/api/stagingCerts/${path}" on the page to refresh data
4. Show errors on the modal itself and do not close it
### key Pair
1. If "keyPair" property is missing and then dont render anything.
2. If present then render the data same as the KeystoreDetailsPage page
  - Show the standard columns
  - Expand to show the certificate chain
3. If certificateRequestInfo is null then show:
  1. The same new button as the Parent Staging Certificate page. The only difference is that default the Common Name to the current key. API call and functionality remains the same. One success,  refetch the "/api/stagingCerts/${path}" on the page to refresh data
  2. Generate Keystore button if hasMissingKeystore is true. Right now just show an alert on click

## Unit Tests
1. Every UI component will have a unit test
2. Each unit test will be simple. No nested tests. Given a single set of setup create a single test with multiple asserts.
3. Combine multiple tests in one when possible
4. Strive for simplicity, not maximum coverage