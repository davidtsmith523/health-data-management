const crypto = require("crypto");
const fs = require("fs");
const NodeRSA = require("node-rsa");

const rsaPrivateKey = fs.readFileSync("./keys/privateKey.pem", "utf8");

const SECRET_KEY =
  process.env.SECRET_KEY ||
  "e9b0f907ea4f90b36c7c1c8a8f4f44078fbd88a98cc0b3f33f35b4d71273a8db"; // Ideally, load from environment variable

const IV_LENGTH = 16;

function encrypt(text) {
  const keyBuffer = Buffer.from(SECRET_KEY, "hex");

  if (keyBuffer.length !== 32) {
    throw new Error("Invalid key length. AES-256 requires a 32-byte key.");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted; // Store IV + Encrypted text
}

// AES decryption function
function decrypt(encryptedText) {
  const keyBuffer = Buffer.from(SECRET_KEY, "hex");
  if (keyBuffer.length !== 32) {
    throw new Error("Invalid key length. AES-256 requires a 32-byte key.");
  }
  const [ivHex, encryptedHex] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedBuffer = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
  let decrypted = decipher.update(encryptedBuffer, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

function encryptWithAESAndRSA(text, rsaPublicKey) {
  const aesKey = crypto.randomBytes(32); // Generate a random AES key
  const keyBuffer = Buffer.from(SECRET_KEY, "hex");

  if (keyBuffer.length !== 32) {
    throw new Error("Invalid key length. AES-256 requires a 32-byte key.");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const ivAndEncryptedText = iv.toString("hex") + ":" + encrypted; // Store IV + Encrypted text
  const rsaKey = new NodeRSA(rsaPublicKey);
  const encryptedAESKey = rsaKey.encrypt(aesKey, "base64");

  return {
    encryptedData: ivAndEncryptedText,
    encryptedKey: encryptedAESKey
  };
}

// AES decryption function
function decryptWithAESAndRSA({ encryptedData, encryptedKey }, rsaPrivateKey) {
  const rsaKey = new NodeRSA(rsaPrivateKey);
  const decryptedAESKey = rsaKey.decrypt(encryptedKey, "utf8");
  const keyBuffer = Buffer.from(decryptedAESKey, "hex");
  if (Buffer.from(keyBuffer, "hex").length !== 32) {
    throw new Error("Invalid key length. AES-256 requires a 32-byte key.");
  }
  const [ivHex, encryptedHex] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedBuffer = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(decryptedAESKey, "hex"),
    iv
  );
  let decrypted = decipher.update(encryptedBuffer, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

function signData(data) {
  const rsaKey = new NodeRSA(rsaPrivateKey, "pkcs1");
  const dataToHash = JSON.stringify(data);
  const hashData = crypto.createHash('sha256').update(dataToHash).digest('hex');
  const signature = rsaKey.sign(hashData, "base64");
  return signature;
}

function verifySignature(data, signature, publicKey) {
  const rsaKey = new NodeRSA(publicKey);
  const isVerified = rsaKey.verify(data, signature, "utf8", "base64");
  return isVerified;
}

module.exports = {
  encrypt,
  decrypt,
  encryptWithAESAndRSA,
  decryptWithAESAndRSA,
  signData,
  verifySignature
};
