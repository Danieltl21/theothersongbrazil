import bcrypt from 'bcryptjs';

const adminHash = bcrypt.hashSync('admin123', 10);
const userHash = bcrypt.hashSync('senha123', 10);

console.log('ADMIN_HASH =', adminHash);
console.log('USER_HASH  =', userHash);

console.log('Verify admin123:', bcrypt.compareSync('admin123', adminHash));
console.log('Verify senha123:', bcrypt.compareSync('senha123', userHash));
