const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Must provide Item Title!'],
      trim: true,
      maxlength: [
        30,
        'An Item title must have less or equal then 20 characters',
      ],
      //! minlength check for empty string
    },
    photos: [String],
    rentType: {
      type: String,
      required: [true, 'Must provide Rent type!'],
      enum: [
        'transportation',
        'Property',
        'clothes',
        'electronic_equipment',
        'Play_Areas',
        'Event_Rentals',
      ],
    },
    subRentType: {
      type: String,
      required: [true, 'Must provide Sub-Rent type!'],
      enum: [
        'cars',
        'motocycle',
        'bike',
        'yacht',
        'Scooters',
        'apartments',
        'hotel_rooms',
        'chalet',
        'male',
        'female',
        'Audio_equipment',
        'lighting_equipment',
        'Cameras',
        'playgrounds',
        'Water_Parks',
        'Miniature_golf',
        'Tables',
        'chairs',
        'Decor',
      ],
    },
    city: {
      type: String,
      required: [true, 'Must provide Location!'],
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
    description: {
      type: String,
      required: [true, 'Must provide a Description!'],
      trim: true,
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Must provide Price per day!'],
    },
    yourCondition: {
      type: String,
    },
    new: {
      type: Boolean,
      default: false,
    },
    used: {
      type: Boolean,
      default: false,
    },
    availablity: {
      type: Boolean,
      default: false,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    Owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

itemSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'item',
  localField: '_id',
});

itemSchema.virtual('bookings', {
  ref: 'Booking',
  foreignField: 'item',
  localField: '_id',
});

itemSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'Owner',
    select: 'userName photo',
  });
  next();
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
