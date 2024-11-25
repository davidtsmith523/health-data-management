<h1 align="center">
    Health Data Management App
</h1>

This is an application with a basic UI to simulate a health management system. The main goal of this application is to use the secruity techniques learned in class to demonstrate how secruity is a crucial part to software.

This app consists of a few security techniques:

1. RBAC (Role-Base Access Control)

- This app allows for a doctor, nurse, or patient to login.
- Different dashboard operations and data or viewable for the certain role logged in.

2. RuBAC (Rule-Base Access Control)

To demostrate this security measure, we have emplaced a few rules to simulate HIPPA compliance that a real-world application would have to follow:

- Allow Access only during specifc hours. For example, a nurse shall only have access to the system during her working hours (6am - 6pm CST)

3. Encryption

- Saving patient data should be encrypted using AES encryption algorithm.
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

Install dependencies:

```
cd /server
```

```
npm install
```

Now, you can start a local server by running:

```
npm start
```
