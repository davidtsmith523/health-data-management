import React from "react";
import PropTypes from "prop-types";

import Logout from "../Logout/Logout";

const Header = ({ authenticatedUser, setIsAdding, setIsAuthenticated }) => {
  return (
    <header>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e0e0e0"
        }}
      >
        <h1>Health Data Management Software</h1>
        <Logout setIsAuthenticated={setIsAuthenticated} />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "50px"
        }}
      >
        {authenticatedUser === "doctor" && <h2>Doctor View</h2>}
        {authenticatedUser === "patient" && <h2>Patient View</h2>}
        {authenticatedUser === "nurse" && <h2>Nurse View</h2>}

        {(authenticatedUser === "doctor" || authenticatedUser === "nurse") && (
          <button
            onClick={() => setIsAdding(true)}
            style={{
              display: "flex",
              alignItems: "center"
            }}
          >
            Add New Patient Data
          </button>
        )}
      </div>
    </header>
  );
};
Header.propTypes = {
  authenticatedUser: PropTypes.string.isRequired,
  setIsAdding: PropTypes.func.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired
};

export default Header;
