const crypto = require("crypto");

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

module.exports = { encrypt, decrypt };
