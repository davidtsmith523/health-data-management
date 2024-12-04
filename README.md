<h1 align="center">
    Health Data Management App
</h1>

This is an application with a basic UI to simulate a health management system. The main goal of this application is to use the secruity techniques learned in class to demonstrate how secruity is a crucial part to software.

This app consists of a few security techniques:

1. RBAC (Role-Based Access Control)

- This app allows for a doctor, nurse, or patient to login.
- Different dashboard operations and data or viewable for the certain role logged in.
  - A Doctor can see all patients and perfrom Add/Edit operations on every patient.
  - A Nurse can see all patients, but only Add and Edit specific fields for a patient.
  - A Patient can only see their data. No Add/Edit operations available.

2. RuBAC (Rule-Based Access Control)

To demostrate this security measure, we have emplaced a few rules to simulate HIPPA compliance that a real-world application would have to follow:

- Allow Access only during specifc hours.
  - For example, a nurse shall only have access to the system during her working hours (6am - 6pm CST).

3. Encryption

- Saving patient data should be encrypted using AES encryption algorithm.
  - All login passwords are encrypted and then decypted when logging in.
  - Sensitive data such as first name, last name, and email are all encrypted as well in the database.
- Doctors shall be able to sign off on a patient using their RSA encrypted private key.

## Technologies Used

- [React](http://reactjs.org)
- [Primitive UI](https://taniarascia.github.io/primitive)
- [SweetAlert2](https://sweetalert2.github.io)
- [NodeJS/Express](https://expressjs.com/)
- [SQLite](https://www.sqlite.org/index.html)

## Development

To get a local copy of the code, clone it using git:

```
git clone https://github.com/davidtsmith523/health-data-management.git
```

Backend and Frontend must be running for the application to function correctly.

### Frontend

```
cd health-data-management-app
```

Install dependencies:

```
npm install
```

Now, you can start a local web server by running:

```
npm start
```

and then you can open http://localhost:3000 to view it in the browser.

### Backend

```
cd health-data-management-app/server
```

Install dependencies:

```
npm install
```

Now, you can start a local server by running:

```
npm start
```

Open http://localhost:3000 to view the application.

## Test Cases

1. Log in using the doctor, nurse, and patient
   - A doctor should be able to see all patients, add new patient, edit existing patient, and delete a patient.
   - A nurse (if time is between 6am - 6pm CST) should be able to see all patients, add new patient, and edit some properties on an existing patient.
   - A patient should be able to see only their data, and not be able to add, delete, or edit.
2. Add a new patient using the doctor log in.
   - Click on "Add New Patient Data" and fill in all fields. Click "Add". A success message should appear if successful.
3. Edit an existing patient using the doctor log in.
   - Click on "Edit" under a patient in the table and edit an existing field. Click "Update". A success message should appear if successful.
4. Delete an existing patient using the doctor log in.
   - Click on "Delete" under a patient in the table and confirm deletion. A success message should appear if successful.
5. Sign Off using the doctor RSA key.
   - Click on "Sign Off" under a patient in the table and confirm sign off. A success message should appear if successful.

### A few backend tests

```
cd health-data-management-app/server
```

```
npx jest login.test.js
```

will run a backend test suite for the login functionality (ensures that encryption/decryption and login functionality is working correctly)

```
npx jest addPatient.test.js
```

will run a backend test suite for the add functionality (ensures that encryption and adding patient data is working correctly)
