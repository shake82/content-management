# Requirement
Create a new component called "Certificate Request Generator" the follows the following requirements

## Certificate Request Child component
Make this component independant so that it can be used in multiple places
### Subject Section
1. Allow for adding a subject field, subject field value combinition
2. Subject options are:
  1. Common Name (CN)
  2. Organizational Unit (OU)
  3. Organization (O)
  4. Locality (L)
  5. State (ST)
  6. Country (C)
3. Show pills of existing subjects already added the the botton with the ability to delete them one by one
4. A new subject is adding by concatinating the subject appreviation, the equal to sign and the subject value. e.g. "OU-Devices"
5. Existing subjects are always sorted by the order described above. So even in a CN is added last, it shows up first
6. Add the following subjects by default: 'OU=Devices', "OU=USCIS', 'OU=Department of Homeland Security', 'O=U.S. Government', 'C=US'. Also allow for the caller component to specify other defaults
7. Add validation that atleast one CN must be present
### Alterate Subjects
This section should be a multi line text box. Each line represents a seperate alternate subject. Provide hint that these are alternate DNS Subjects
### Output
If validation succeeds, return data to the parent component in the format:
```ts
{
  subject: string;
  alternateSubjects: string[]
}
```
Where the subject is a comma seperated string of all the subjects abd the alternateSubjects is an array of all the alternate subjects

## Page logic
1. On submit, post the results to the api /api/tools/generateCertificateRequest
2. Response contains the private key ("privateKey") and certificate requrest ("certificateRequest") in the PEM format. Render the results with action icons to both copy the contents of each to clipboard and a download button that saves the content as private.pem and certificate-request.pem respectively

## Unit Tests
1. Every UI component will have a unit test
2. Each unit test will be simple. No nested tests. Given a single set of setup create a single test with multiple asserts.
3. Combine multiple tests in one when possible
4. Strive for simplicity, not maximum coverage