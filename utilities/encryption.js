const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { jwtSecret, jwtExpirationInSeconds } = require("../config");

// Generates an Access Token using email and userId for the user's authentication
const generateAccessToken = (email, userId) => {
  return jwt.sign(
    {
      id: userId,
      email,
    },
    jwtSecret,
    {
      expiresIn: jwtExpirationInSeconds,
    }
  );
};

// Encrypts the password using SHA256 Algorithm, for enhanced security of the password
const encryptPassword = (password) => {
  // We will hash the password using SHA256 Algorithm before storing in the DB
  // Creating SHA-256 hash object
  const hash = crypto.createHash("sha256");
  // Update the hash object with the string to be encrypted
  hash.update(password);
  // Get the encrypted value in hexadecimal format
  return hash.digest("hex");
};

module.exports = { generateAccessToken, encryptPassword }