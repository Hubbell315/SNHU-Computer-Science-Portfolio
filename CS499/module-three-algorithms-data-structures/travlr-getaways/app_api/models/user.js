const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// user data and password hash details
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    // never save a plain text password
    hash: {
      type: String,
      required: true
    },
    salt: {
      type: String,
      required: true
    },

    // save the work factor so older accounts can still log in
    iterations: {
      type: Number,
      default: 100000
    }
  },
  {
    timestamps: true
  }
);

// create a random salt and hash the password before saving the user
userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.iterations = 100000;

  this.hash = crypto.pbkdf2Sync(
    password,
    this.salt,
    this.iterations,
    64,
    'sha512'
  ).toString('hex');
};

// compare a login password to the stored password hash
userSchema.methods.validPassword = function (password) {
  // original accounts used 1000 iterations so this keeps them working
  const iterations = this.iterations || 1000;

  const attemptedHash = crypto.pbkdf2Sync(
    password,
    this.salt,
    iterations,
    64,
    'sha512'
  ).toString('hex');

  // timing safe comparison avoids leaking information during login checks
  return crypto.timingSafeEqual(
    Buffer.from(this.hash, 'hex'),
    Buffer.from(attemptedHash, 'hex')
  );
};

// create a token used to access protected admin trip routes
userSchema.methods.generateJWT = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const User = mongoose.model('users', userSchema);

module.exports = User;