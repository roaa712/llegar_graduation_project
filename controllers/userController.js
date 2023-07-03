const jwt = require('jsonwebtoken');
const multer = require('multer');
const sharp = require('sharp');
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

exports.uploadUserPhoto = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'IDphoto', maxCount: 1 },
]);

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.files.photo || !req.files.IDphoto) return next();

  req.body.photo = `user-${req.user.id}-${Date.now()}.jpeg`;
  req.body.IDphoto = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.files.photo[0].buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`photos/${req.body.photo}`);

  await sharp(req.files.IDphoto[0].buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`IDphotos/${req.body.IDphoto}`);

  next();
});

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  const filteredBody = filterObj(
    req.body,
    'userName',
    'email',
    'fullName',
    'city',
    'gender',
    'birthDate'
  );

  if (req.body.photo) filteredBody.photo = req.body.photo;
  if (req.body.IDphoto) filteredBody.IDphoto = req.body.IDphoto;

  let updatedUser;
  updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  await updatedUser.save({ validateBeforeSave: true });

  signToken(updatedUser._id);
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!, Please use /signup instead',
  });
};

exports.getAllUsers = factory.getAll(User);
const options = { populate: ['items', 'reviews', 'bookings'] };
exports.getUser = factory.getOne(User, options);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
