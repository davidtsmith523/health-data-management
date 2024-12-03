import React, { useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { statusOptions } from "../../Options/statusOptions";
import { doctors } from "../../Options/doctors";

const Edit = ({
  authenticatedUser,
  patients,
  selectedPatient,
  setPatients,
  setIsEditing
}) => {
  const id = selectedPatient.id;

  const [firstName, setFirstName] = useState(selectedPatient.firstName);
  const [lastName, setLastName] = useState(selectedPatient.lastName);
  const [email, setEmail] = useState(selectedPatient.email);
  const [dateOfBirth, setDateOfBirth] = useState(selectedPatient.dateOfBirth);
  const [lastVisit, setLastVisit] = useState(selectedPatient.lastVisit);
  const [assignedTo, setAssignedTo] = useState(selectedPatient.assignedTo);
  const [condition, setCondition] = useState(selectedPatient.condition);
  const [action, setAction] = useState(selectedPatient.action);
  const [status, setStatus] = useState(selectedPatient.status);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !dateOfBirth ||
      !lastVisit ||
      !assignedTo ||
      !condition ||
      !action ||
      !status
    ) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "All fields are required.",
        showConfirmButton: true
      });
    }

    const patient = {
      id,
      firstName,
      lastName,
      email,
      dateOfBirth,
      lastVisit,
      assignedTo,
      condition,
      action,
      status
    };

    const success = await editPatient(patient);
    setIsEditing(false);
    if (!success) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to add patient.",
        showConfirmButton: true
      });
    }

    for (let i = 0; i < patients.length; i++) {
      if (patients[i].id === id) {
        patients.splice(i, 1, patient);
        break;
      }
    }

    setPatients(patients);

    Swal.fire({
      icon: "success",
      title: "Updated!",
      text: `${patient.firstName} ${patient.lastName}'s data has been updated.`,
      showConfirmButton: false,
      timer: 1500
    });
  };

  const editPatient = async (patient) => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/users/edit_patient_info",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(patient)
        }
      );

      if (!response.ok) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="small-container">
      <form onSubmit={handleUpdate}>
        <h1>Edit Patient</h1>
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          name="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={authenticatedUser === "nurse"}
        />
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          type="text"
          name="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={authenticatedUser === "nurse"}
        />
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="text"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={authenticatedUser === "nurse"}
        />
        <label htmlFor="dateOfBirth">Date of Birth</label>
        <input
          id="dateOfBirth"
          type="date"
          name="dateOfBirth"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          disabled={authenticatedUser === "nurse"}
        />
        <label htmlFor="lastVisit">Last Visit</label>
        <input
          id="lastVisit"
          type="date"
          name="lastVisit"
          value={lastVisit}
          onChange={(e) => setLastVisit(e.target.value)}
        />
        <label htmlFor="assignedTo">Doctor Assigned</label>
        <select
          id="assignedTo"
          name="assignedTo"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
        >
          <option value="">Select Doctor</option>
          {doctors.map((doctor, index) => (
            <option key={index} value={doctor}>
              {doctor}
            </option>
          ))}
        </select>
        <label htmlFor="condition">Condition/Notes</label>
        <input
          id="condition"
          type="text"
          name="condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        />
        <label htmlFor="action">Action</label>
        <input
          id="action"
          type="text"
          name="action"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        />
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Select Status</option>
          {statusOptions.map((statusOption, index) => (
            <option key={index} value={statusOption}>
              {statusOption}
            </option>
          ))}
        </select>
        <div style={{ marginTop: "30px" }}>
          <input type="submit" value="Update" />
          <input
            style={{ marginLeft: "12px" }}
            className="muted-button"
            type="button"
            value="Cancel"
            onClick={() => setIsEditing(false)}
          />
        </div>
      </form>
    </div>
  );
};
Edit.propTypes = {
  authenticatedUser: PropTypes.string.isRequired,
  patients: PropTypes.array.isRequired,
  selectedPatient: PropTypes.shape({
    id: PropTypes.number.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    dateOfBirth: PropTypes.string.isRequired,
    lastVisit: PropTypes.string.isRequired,
    assignedTo: PropTypes.string.isRequired,
    condition: PropTypes.string.isRequired,
    action: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  setPatients: PropTypes.func.isRequired,
  setIsEditing: PropTypes.func.isRequired
};

export default Edit;
