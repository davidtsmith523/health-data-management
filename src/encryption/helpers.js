// import NodeRSA from 'node-rsa';

// function encryptAES(text, aesKey, iv) { 
//     const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv); 
//     let encrypted = cipher.update(text, 'utf8', 'hex'); 
//     encrypted += cipher.final('hex'); 
//     return iv.toString('hex') + ':' + encrypted; 
// } 
// // Encrypt data function 
// async function encryptData(text) { 
//     const publicKey = await fetchPublicKey(); // Fetch the server's RSA public key 
//     // Generate a random AES key and IV 
//     const aesKey = crypto.randomBytes(32); const iv = crypto.randomBytes(16); // Encrypt the data using AES 
//     const encryptedData = encryptAES(text, aesKey, iv); // Encrypt the AES key using RSA 
//     const rsa = new NodeRSA(publicKey); 
//     const encryptedAESKey = rsa.encrypt(aesKey, 'base64'); 
//     return { encryptedData, encryptedAESKey };
// }

async function signPatientData(patientData) {
    const response = await fetch('/sign_patient_info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patientData }),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const { signature } = await response.json();
    return signature;
}

async function verifyPatientSignature(patientData, signature, doctorPublicKey) {
    const response = await fetch('/verify_signature', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patientData, signature, doctorPublicKey }),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
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
      return publicKey
    } catch (error) {
      console.error("Error fetching key:", error.message);
    }
  }

export default { signPatientData, verifyPatientSignature, fetchPublicKey };
