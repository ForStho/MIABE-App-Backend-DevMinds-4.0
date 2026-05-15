const crypto = require('crypto');

// Génère une clé de 32 bytes (AES-256)
const key = crypto.randomBytes(32);

// Convertit en HEX (64 caractères)
const hexKey = key.toString('hex');

console.log('AES Key (hex):');
console.log(hexKey);