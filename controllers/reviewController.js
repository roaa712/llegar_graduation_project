const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryController');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.isOwner = catchAsync(async (req, res, next) => {
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

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currUser = await User.findById(decoded.id);
  if (!currUser) {
    return next(
      new AppError(
        'The token belonging to this user does not longer exist.',
        401
      )
    );
  }

  req.user = currUser;

  next();
});

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.item) req.body.item = req.params.itemId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
