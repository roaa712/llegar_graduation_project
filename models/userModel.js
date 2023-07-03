const mongooseIntlPhoneNumber = require('mongoose-intl-phone-number');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, 'Must provide your userName!'],
    },
    email: {
      type: String,
      required: [true, 'Must provide your email!'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email!'], //? kazlak@asd.com
    },
    password: {
      type: String,
      required: [true, 'Must provide your password!'],
      minlength: 8,
      select: false,
    },
    fullName: {
      type: String,
      required: [true, 'Must provide your fullName!'],
    },
    city: {
      type: String,
      required: [true, 'Must provide your city!'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Must provide your phoneNumber!'],
      validate: {
        validator: function (value) {
          const phoneNumber = parsePhoneNumberFromString(value);
          return phoneNumber && phoneNumber.isValid();
        },
        message: 'Invalid phone number',
      },
    },
    gender: {
      type: String,
      required: [true, 'Must provide your gender!'],
      enum: ['Male', 'Female'],
    },
    birthDate: {
      type: String,
      validate: [validator.isDate, 'Must Provide a valid birthDate'], //? YYYY/MM/DD
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    photo: {
      type: String,
      // required: [true, 'Must provide your photo'],
    },
    IDphoto: {
      type: String,
      // required: [true, 'provide your ID photo'],
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.plugin(mongooseIntlPhoneNumber, {
  hook: 'validate',
  phoneNumberField: 'phoneNumber',
  nationalFormatField: 'nationalFormat',
  internationalFormat: 'internationalFormat',
  countryCodeField: 'countryCode',
});

userSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'user',
  localField: '_id',
});

userSchema.virtual('items', {
  ref: 'Item',
  foreignField: 'Owner',
  localField: '_id',
});

userSchema.virtual('bookings', {
  ref: 'Booking',
  foreignField: 'user',
  localField: '_id',
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query.
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); //!

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.generateVerificationCode = function () {
  const code = Math.floor(1000 + Math.random() * 9000).toString();

  this.passwordResetCode = crypto
    .createHash('sha256')
    .update(code)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return code;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
