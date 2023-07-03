const mongoose = require('mongoose');
const moment = require('moment');
const AppError = require('../utils/appError');

const bookingSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.ObjectId,
      ref: 'Item',
      required: [true, 'Booking must belong to an Item!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to an User!'],
    },
    acceptCondition: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      required: [true, 'Must provide start date!'],
    },
    endDate: {
      type: Date,
      required: [true, 'Must provide end date!'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    amount: Number,
    commission: Number,
    insurance: Number,
    total: Number,
    cardName: {
      type: String,
      required: [true, 'Must provide the card name!'],
    },
    cardNumber: {
      type: Number,
      required: [true, 'Must provide the card number!'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Must provide the card name!'],
    },
    CVV: {
      type: Number,
      required: [true, 'Must provide the card CVV!'],
    },
  },
  { timestamps: true }
);

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'item',
    selcet: 'title rentType subRentType',
  });
  next();
});

// bookingSchema.statics.checkBookingAvailability = async function (
//   itemId,
//   startDate,
//   endDate
// ) {
//   const overlappingBookings = await Booking.aggregate([
//     {
//       $match: {
//         itemId: itemId,
//         $or: [
//           { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
//           { startDate: { $gte: startDate }, endDate: { $lte: endDate } },
//         ],
//       },
//     },
//     {
//       $project: {
//         startDate: 1,
//         endDate: 1,
//         _id: 0,
//       },
//     },
//   ]);

//   if (overlappingBookings.length > 0) {
//     return res.status(400).json({ error: 'Booking dates are not available' });
//   }

//   next();
// };

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
