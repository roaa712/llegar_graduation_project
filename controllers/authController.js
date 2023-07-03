const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, status, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(status).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // 1) Signup
  let newUser = await User.create(req.body);

  // 2) Generate the random reset token
  const resetCode = newUser.generateVerificationCode();
  const token = signToken(newUser._id);
  await newUser.save({ validateBeforeSave: false });

  // 3) Send it to newUser's email
  const message = `Your Verification code is: ${resetCode}`;

  try {
    sendEmail({
      email: newUser.email,
      subject: 'Your verification code (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Verification code sent to email!',
      token,
    });
  } catch (err) {
    newUser.passwordResetToken = undefined;
    newUser.passwordResetExpires = undefined;
    await newUser.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
  req.user = newUser;
});

exports.verfiySignUp = catchAsync(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');

  const currentToken = req.headers.authorization.split(' ')[1];

  // 2) Verification token.
  const decoded = await promisify(jwt.verify)(
    currentToken,
    process.env.JWT_SECRET
  );

  // 3) Check if user still exists
  let user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError(
        'The token belonging to this user does not longer exist.',
        401
      )
    );
  }

  user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    await User.findByIdAndDelete(decoded.id);
    return next(new AppError('Reset code invalid or expired'));
  }

  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;

  // 2) Reset code valid
  await user.save({ validateBeforeSave: false });
  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists & password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to clinet.
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! please log in to get access.', 401)
    );
  }
  // 2) Verification token.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        'The token belonging to this user does not longer exist.',
        401
      )
    );
  }

  // 4) Check if user chananged password after the token was issued.
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }
  req.user = freshUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }

  // 2) Generate the random reset token
  const resetCode = user.generateVerificationCode();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const message = `Your Verification code is: ${resetCode}`;

  try {
    sendEmail({
      email: user.email,
      subject: 'Your verification code (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Verification code sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.verfiyPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Reset code invalid or expired'));
  }

  // 2) Reset code valid
  // await user.save();
  await user.save({ validateBeforeSave: false });
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const user = await User.findById(req.user._id);
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400)); //!
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if posted current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.newPassword;
  await user.save();

  createSendToken(user, 200, res);
});
