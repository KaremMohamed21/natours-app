const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Provide username']
  },
  email: {
    type: String,
    required: [true, 'Please provide a your Email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid Email']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'You have to comfirm password'],
    validate: {
      // Runs only in case of Create and Save
      validator: function(el) {
        return el === this.password;
      },
      message: 'The password is not the same!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

/**
 * Hashing the password
 */
userSchema.pre('save', async function(next) {
  // Only run this function if the password was modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete confirm password field
  this.passwordConfirm = undefined;

  next();
});

/**
 *  Updating the password changed at
 */
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

/**
 *  Sending active users
 */

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

/**
 *  Create Global model instance method
 *  Check if ther password is correct
 */
userSchema.methods.correctPassword = async function(password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

/**
 *  Check if the password was changed after the token was issued
 */
userSchema.methods.changedPassword = function(JWTiat) {
  if (this.passwordChangedAt) {
    const passwordStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTiat < passwordStamp;
  }

  // Return false if the password was not changed
  return false;
};

/**
 *  Generate a reset token
 */
userSchema.methods.createPasswordResetToken = function() {
  // Create reset token via crypto
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Save the reset token in hashed form into DB in order to compare it
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log(resetToken, this.passwordResetToken);

  // Create Expiry Date for the reset token
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
