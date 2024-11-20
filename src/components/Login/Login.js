import React, { useState } from "react";
import Swal from "sweetalert2";

const Login = ({ setAuthenticatedUser }) => {
  const doctorEmail = "doctor@example.com";
  const doctorPassword = "Doctor123";
  const nurseEmail = "nurse@example.com";
  const nursePassword = "Nurse123";
  const patientEmail = "patient@example.com";
  const patientPassword = "Patient123";

  const [email, setEmail] = useState("doctor@example.com");
  const [password, setPassword] = useState("Doctor123");

  const [nurseLogin, setNurseLogin] = useState(false);
  const [patientLogin, setPatientLogin] = useState(false);
  const [doctorLogin, setDoctorLogin] = useState(true);

  const handleNurseClick = () => {
    setNurseLogin(true);
    setPatientLogin(false);
    setDoctorLogin(false);
    setEmail(nurseEmail);
    setPassword(nursePassword);
  };

  const handlePatientClick = () => {
    setNurseLogin(false);
    setPatientLogin(true);
    setDoctorLogin(false);
    setEmail(patientEmail);
    setPassword(patientPassword);
  };

  const handleDoctorClick = () => {
    setNurseLogin(false);
    setPatientLogin(false);
    setDoctorLogin(true);
    setEmail(doctorEmail);
    setPassword(doctorPassword);
  };

  const checkHours = () => {
    const date = new Date();
    const CSTOffset = -6 * 60;
    const CSTTime = new Date(date.getTime() + CSTOffset * 60 * 1000);

    const currentHour = CSTTime.getHours();

    if (currentHour >= 6 && currentHour < 18) {
      return true;
    } else {
      return false;
    }
  };

  const checkCredentials = () => {
    if (
      nurseLogin &&
      email === nurseEmail &&
      password === nursePassword &&
      checkHours()
    ) {
      return true;
    } else if (
      patientLogin &&
      email === patientEmail &&
      password === patientPassword
    ) {
      return true;
    } else if (
      doctorLogin &&
      email === doctorEmail &&
      password === doctorPassword
    ) {
      return true;
    } else {
      return false;
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (checkCredentials()) {
      Swal.fire({
        timer: 1500,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
        willClose: () => {
          if (nurseLogin) {
            localStorage.setItem("authenticated_user", "nurse");
            setAuthenticatedUser("nurse");
          }
          if (patientLogin) {
            localStorage.setItem("authenticated_user", "patient");
            setAuthenticatedUser("patient");
          }
          if (doctorLogin) {
            localStorage.setItem("authenticated_user", "doctor");
            setAuthenticatedUser("doctor");
          }

          localStorage.setItem("user_email", email);

          Swal.fire({
            icon: "success",
            title: "Successfully logged in!",
            showConfirmButton: false,
            timer: 1500
          });
        }
      });
    } else {
      Swal.fire({
        timer: 1500,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
        willClose: () => {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Incorrect email or password.",
            showConfirmButton: true
          });
        }
      });
    }
  };

  return (
    <div className="small-container">
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "space-between",
          width: "100%",
          marginTop: "20px"
        }}
      >
        <button
          style={{
            backgroundColor: patientLogin ? "#0366ee" : "gray",
            border: "none"
          }}
          onClick={handlePatientClick}
        >
          Patient Login
        </button>
        <button
          style={{
            backgroundColor: doctorLogin ? "#0366ee" : "gray",
            border: "none"
          }}
          onClick={handleDoctorClick}
        >
          Doctor Login
        </button>
        <button
          style={{
            backgroundColor: nurseLogin ? "#0366ee" : "gray",
            border: "none"
          }}
          onClick={handleNurseClick}
        >
          Nurse Login
        </button>
      </div>
      <form onSubmit={handleLogin}>
        {nurseLogin && <h1>Nurse Login</h1>}
        {patientLogin && <h1>Patient Login</h1>}
        {doctorLogin && <h1>Doctor Login</h1>}
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input style={{ marginTop: "12px" }} type="submit" value="Login" />
      </form>
    </div>
  );
};

export default Login;
