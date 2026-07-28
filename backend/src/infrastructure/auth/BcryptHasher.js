const bcrypt = require('bcryptjs');
const IHasher = require('../../application/interfaces/IHasher');

const SALT_ROUNDS = 10;

class BcryptHasher extends IHasher {
  async hash(plainText) {
    return bcrypt.hash(plainText, SALT_ROUNDS);
  }

  async compare(plainText, hash) {
    return bcrypt.compare(plainText, hash);
  }
}

module.exports = new BcryptHasher();
