import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import Header from "./Header";
import Table from "./Table";
import Add from "./Add";
import Edit from "./Edit";
import fetchPublicKey from "../../encryption/helpers.js";

const Dashboard = ({ setAuthenticatedUser, authenticatedUser, userEmail }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [signature, setSignature] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // const { encryptedAESKey } = await encryptData('');
        const response = await fetch(
          "http://localhost:5001/api/users/patient_info",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              authenticatedUser: authenticatedUser,
              userEmail: userEmail
            })
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setPatients(data.patients);
      } catch (error) {
        console.error("Error fetching patient info:", error.message);
      }
    };
    fetchPatients();
  }, [authenticatedUser, userEmail]);

  const handleEdit = (id) => {
    const [patient] = patients.filter((patient) => patient.id === id);

    setSelectedPatient(patient);
    setIsEditing(true);
  };

  const handleSignOff = async (id) => {
    Swal.fire({
      icon: "warning",
      title: "Approve Patient Info",
      text: "You must be the assigned doctor.",
      showCancelButton: true,
      confirmButtonText: "Sign Off",
      cancelButtonText: "No, cancel!"
    }).then(async (result) => {
      if (result.value) {
        const [patient] = patients.filter((patient) => patient.id === id);
        try {
          const signature = await signPatientData(patient);
          setSignature(signature);
          Swal.fire({
            icon: "success",
            title: "Signed off!",
            text: `${patient.firstName} ${patient.lastName}'s data has been signed off.`,
            showConfirmButton: false,
            timer: 1500
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Unable to sign off!",
            text: `${patient.firstName} ${patient.lastName}'s data failed to be signed off.`,
            showConfirmButton: false,
            timer: 1500
          });
          console.error("Failed to sign patient data:", error);
        }
      }
    });
  };

  async function signPatientData(patientData) {
    console.log(patientData);
    const response = await fetch(
      "http://localhost:5001/api/users/sign_patient_info",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ patientData })
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const { signature } = await response.json();
    return signature;
  }

  const handleDelete = async (id) => {
    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!"
    }).then(async (result) => {
      if (result.value) {
        const [patient] = patients.filter((patient) => patient.id === id);
        const deletedPatient = await deletePatient(id);
        console.log(deletedPatient);
        if (!deletedPatient) {
          console.log("Failed to delete patient");
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Failed to delete patient.",
            showConfirmButton: true
          });
        } else {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: `${patient.firstName} ${patient.lastName}'s data has been deleted.`,
            showConfirmButton: false,
            timer: 1500
          });

          const patientsCopy = patients.filter((patient) => patient.id !== id);
          setPatients(patientsCopy);
        }
      }
    });
  };

  if (authenticatedUser === null) {
    return <div>Loading...</div>;
  }

  const deletePatient = async (id) => {
    try {
      if (!id) {
        throw new Error("Email is required to delete a patient.");
      }

      const response = await fetch(
        "http://localhost:5001/api/users/delete_patient",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ id })
        }
      );
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (error) {
      console.error("Error deleting user:", error.message);
      return null;
    }
  };

  return (
    <div className="container">
      {!isAdding && !isEditing && (
        <>
          <Header
            authenticatedUser={authenticatedUser}
            setIsAdding={setIsAdding}
            setIsAuthenticated={setAuthenticatedUser}
          />
          <Table
            authenticatedUser={authenticatedUser}
            patients={patients}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleSignOff={handleSignOff}
          />
        </>
      )}
      {isAdding && (
        <Add
          patients={patients}
          setPatients={setPatients}
          setIsAdding={setIsAdding}
        />
      )}
      {isEditing && (
        <Edit
          authenticatedUser={authenticatedUser}
          patients={patients}
          selectedPatient={selectedPatient}
          setPatients={setPatients}
          setIsEditing={setIsEditing}
        />
      )}
    </div>
  );
};
Dashboard.propTypes = {
  setAuthenticatedUser: PropTypes.func.isRequired,
  authenticatedUser: PropTypes.string.isRequired,
  userEmail: PropTypes.string.isRequired
};

export default Dashboard;
