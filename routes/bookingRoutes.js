const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

// router.get('/checkout-session/:itemId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('user'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(
    bookingController.setTourUserIds,
    bookingController.checkBookingAvailability,
    bookingController.createBooking
  );

router.use(bookingController.isOwner);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
