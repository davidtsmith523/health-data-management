import React, { useState, useEffect } from "react";
import fetchPublicKey from "../../encryption/helpers.js"
import Login from "../Login/Login";
import Dashboard from "../Dashboard/Dashboard";

const App = () => {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [publicKey, setPublicKey] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("authenticated_user");
    const email = localStorage.getItem("user_email");
    setUserEmail(email);
    setAuthenticatedUser(user);
    setIsLoading(false);
    const fetchKey = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/users/get-rsa-public-key",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const { publicKey } = await response.json();
        setPublicKey(publicKey);
      } catch (error) {
        console.error("Error fetching public key:", error.message);
      }
    }
    fetchKey();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {authenticatedUser ? (
        <Dashboard
          setAuthenticatedUser={setAuthenticatedUser}
          authenticatedUser={authenticatedUser}
          userEmail={userEmail}
        />
      ) : (
        <Login
          setAuthenticatedUser={setAuthenticatedUser}
          setUserEmail={setUserEmail}
        />
      )}
    </>
  );
};

export default App;
