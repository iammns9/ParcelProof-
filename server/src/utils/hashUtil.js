const crypto = require('crypto');
const fs = require('fs');

/**
 * Computes SHA-256 hash of a file on disk via streaming.
 * @param {string} filePath - Absolute or relative path to file.
 * @returns {Promise<string>} Hex-encoded SHA-256 hash.
 */
const calculateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('error', (err) => reject(err));
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
};

/**
 * Computes SHA-256 hash of a buffer in memory.
 * @param {Buffer} buffer - Buffer data.
 * @returns {string} Hex-encoded SHA-256 hash.
 */
const calculateBufferHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Compares expected hash with recalculated hash using timingSafeEqual.
 * @param {string} filePath - Path to stored file.
 * @param {string} expectedHash - Recorded SHA-256 hash from database.
 * @returns {Promise<{ isValid: boolean, computedHash: string, expectedHash: string, verifiedAt: Date, explanation: string }>}
 */
const verifyFileIntegrity = async (filePath, expectedHash) => {
  if (!fs.existsSync(filePath)) {
    throw new Error('Physical evidence file was not found on server storage');
  }

  const computedHash = await calculateFileHash(filePath);

  const expectedBuf = Buffer.from(expectedHash.toLowerCase(), 'utf8');
  const computedBuf = Buffer.from(computedHash.toLowerCase(), 'utf8');

  let isValid = false;
  if (expectedBuf.length === computedBuf.length) {
    isValid = crypto.timingSafeEqual(expectedBuf, computedBuf);
  }

  const explanation = isValid
    ? 'Integrity Verified: The SHA-256 cryptographic checksum of the stored file matches the database signature bit-for-bit. The stored digital file has not been altered, replaced, or corrupted since its initial upload.'
    : 'Integrity Check Failed: The SHA-256 cryptographic checksum of the stored file does NOT match the signature recorded at upload time. The file may have been modified, replaced, or corrupted.';

  return {
    isValid,
    computedHash,
    expectedHash,
    verifiedAt: new Date(),
    explanation,
    disclaimer:
      'Notice: SHA-256 cryptographic verification confirms digital file integrity against the registered upload signature. It does not verify the physical contents or condition of the parcel.',
  };
};

module.exports = {
  calculateFileHash,
  calculateBufferHash,
  verifyFileIntegrity,
};
