async function signPatientData(patientData) {
  const response = await fetch("/sign_patient_info", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ patientData })
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const { signature } = await response.json();
  return signature;
}

async function verifyPatientSignature(patientData, signature, doctorPublicKey) {
  const response = await fetch("/verify_signature", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ patientData, signature, doctorPublicKey })
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const { isVerified } = await response.json();
  return isVerified;
}

async function fetchPublicKey() {
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
    return publicKey;
  } catch (error) {
    console.error("Error fetching key:", error.message);
  }
}

export default { signPatientData, verifyPatientSignature, fetchPublicKey };
