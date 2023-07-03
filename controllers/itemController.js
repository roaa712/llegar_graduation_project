const multer = require('multer');
const sharp = require('sharp');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Item = require('../models/itemModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./factoryController');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([{ name: 'photos', maxCount: 10 }]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.photos) return next();

  // 1) Photos
  req.body.photos = [];

  await Promise.all(
    req.files.photos.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`itemPhotos/${filename}`);

      req.body.photos.push(filename);
    })
  );

  next();
});

exports.isOwner = catchAsync(async (req, res, next) => {
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

exports.getAllItems = factory.getAll(Item);
const options = { populate: ['reviews', 'bookings'] };
exports.getItem = factory.getOne(Item, options);
exports.createItem = factory.createOne(Item);
exports.updateItem = factory.updateOne(Item);
exports.deleteItem = factory.deleteOne(Item);
