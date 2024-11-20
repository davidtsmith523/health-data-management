import React from "react";
import PropTypes from "prop-types";

const Table = ({ authenticatedUser, patients, handleEdit, handleDelete }) => {
  patients.forEach((patient, i) => {
    patient.id = i + 1;
  });

  return (
    <div className="contain-table">
      <table className="striped-table">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>DOB</th>
            <th>Last Visit</th>
            <th>Doctor Assigned</th>
            <th>Condition/Notes</th>
            <th>Action Required</th>
            <th>Status</th>
            <th colSpan={2} className="text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {patients.length > 0 ? (
            patients.map((patient, i) => (
              <tr key={patient.id}>
                <td>{patient.firstName}</td>
                <td>{patient.lastName}</td>
                <td>{patient.dateOfBirth}</td>
                <td>{patient.lastVisit}</td>
                <td>{patient.assignedTo}</td>
                <td>{patient.condition}</td>
                <td>{patient.action}</td>
                <td>{patient.status}</td>

                <td className="text-right">
                  {(authenticatedUser === "doctor" ||
                    authenticatedUser === "nurse") && (
                    <button
                      onClick={() => handleEdit(patient.id)}
                      className="button muted-button"
                    >
                      Edit
                    </button>
                  )}
                </td>

                {authenticatedUser === "doctor" && (
                  <td className="text-left">
                    <button
                      onClick={() => handleDelete(patient.id)}
                      className="button muted-button"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>No Patients</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
Table.propTypes = {
  authenticatedUser: PropTypes.string.isRequired,
  patients: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      dateOfBirth: PropTypes.string,
      lastVisit: PropTypes.string,
      assignedTo: PropTypes.string,
      condition: PropTypes.string,
      action: PropTypes.string,
      status: PropTypes.string
    })
  ).isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired
};

export default Table;
