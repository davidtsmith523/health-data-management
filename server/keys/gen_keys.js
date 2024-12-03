const NodeRSA = require('node-rsa');
const fs = require('fs');

// Generate a new RSA key pair
const key = new NodeRSA({ b: 2048 }); // 2048-bit key size

// Export the keys in the PKCS#1 format
const privateKey = key.exportKey('pkcs1-private-pem');
const publicKey = key.exportKey('pkcs1-public-pem');

// Save the private key to a file
fs.writeFileSync('privateKey.pem', privateKey);

// Save the public key to a file
fs.writeFileSync('publicKey.pem', publicKey);

console.log('Keys generated and saved to files.');
