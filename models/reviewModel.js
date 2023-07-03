const mongoose = require('mongoose');
const Item = require('./itemModel');

const reviewSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, 'comment can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'rating can not be empty'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    item: {
      type: mongoose.Schema.ObjectId,
      ref: 'Item',
      required: [true, 'Review must belong to an item'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'userName photo',
  });
  next();
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'item',
    select: 'title rentType subRentType',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (itemId) {
  const stats = await this.aggregate([
    {
      $match: { item: itemId },
    },
    {
      $group: {
        _id: '$item',
        nRating: { $sum: 1 },
        avgRatings: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Item.findByIdAndUpdate(itemId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRatings,
    });
  } else {
    await Item.findByIdAndUpdate(itemId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.item);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.item);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
