const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);

router.post('/verfiySignUp', authController.verfiySignUp);

router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);

router.post('/verfiyPassword', authController.verfiyPassword);

router.use(authController.protect);

router.patch('/resetPassword', authController.resetPassword);

router.patch('/updateMyPassword', authController.updatePassword);

router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin', 'user')); //!

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
