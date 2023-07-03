const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/userModel');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Booking = require('../models/bookingModel');
const moment = require('moment');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryController');
const AppError = require('../utils/appError');

exports.checkBookingAvailability = catchAsync(async (req, res, next) => {
  const itemId = req.params.itemId;
  const { startDate, endDate } = req.body;

  const overlappingBookings = await Booking.find({
    item: itemId,
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
    ],
  });

  if (overlappingBookings.length > 0) {
    return next(new AppError('Booking dates not available'), 400);
  }

  next();
});

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

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
