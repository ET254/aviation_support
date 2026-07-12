const bcrypt = require('bcryptjs');

// Password to hash may come from an environment variable or CLI argument.
// Usage:
//   node hash-password.js "MyPassword123"
// or set env var HASH_SAMPLE_PASSWORD
const password = process.argv[2] || process.env.HASH_SAMPLE_PASSWORD || 'Admin123!';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed password:', hash);
  console.log('Use this hash in Prisma Studio for the password field');
});