const express = require("express");
const router = express.Router();
const bookingcontroller = require("../controllers/booking");
const wrapAsync = require("../utils/wrapasync");
const { isloggedin, validateObjectIds } = require("../middleware");

router.post("/listings/:id/bookings",validateObjectIds("id"),isloggedin,wrapAsync(bookingcontroller.createBooking));

router.get("/profile/bookings/my",isloggedin,wrapAsync(bookingcontroller.myBookings));

router.put("/profile/bookings/:id/cancel",validateObjectIds("id"),isloggedin,wrapAsync(bookingcontroller.cancelBooking));

module.exports = router;
