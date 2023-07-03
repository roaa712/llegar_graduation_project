const express = require('express');
const itemController = require('../controllers/itemController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');
const bookingRouter = require('../routes/bookingRoutes');

const router = express.Router();

router.use(authController.protect);

router.use('/:itemId/reviews', reviewRouter);
router.use('/:itemId/bookings', bookingRouter);

router
  .route('/')
  .get(itemController.getAllItems)
  .post(itemController.createItem);

router.use(authController.restrictTo('admin', 'user'));

router.use(itemController.isOwner);

router
  .route('/:id')
  .get(itemController.getItem)
  .patch(
    itemController.uploadTourImages,
    itemController.resizeTourImages,
    itemController.updateItem
  )
  .delete(itemController.deleteItem);

module.exports = router;
