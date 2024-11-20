import React, { useState, useEffect } from "react";

import Login from "../Login/Login";
import Dashboard from "../Dashboard/Dashboard";

const App = () => {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("authenticated_user");
    const userEmail = localStorage.getItem("user_email");
    setUserEmail(userEmail);
    setAuthenticatedUser(user);
    setIsLoading(false);
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
        <Login setAuthenticatedUser={setAuthenticatedUser} />
      )}
    </>
  );
};

export default App;
