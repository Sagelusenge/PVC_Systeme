const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const BCRYPT_ROUNDS = 12;

function isBcryptHash(value = "") {
  return /^\$2[aby]\$/.test(value);
}

async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function verifyPassword(password, storedHash) {
  if (isBcryptHash(storedHash)) {
    return bcrypt.compare(password, storedHash);
  }

  const legacyHash = crypto.createHash("sha256").update(password).digest("hex");
  const left = Buffer.from(legacyHash);
  const right = Buffer.from(String(storedHash || ""));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

module.exports = { hashPassword, verifyPassword, isBcryptHash };
