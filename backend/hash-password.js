const bcrypt = require('bcryptjs');

const password = 'Admin123!';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed password:', hash);
  console.log('Use this hash in Prisma Studio for the password field');
});