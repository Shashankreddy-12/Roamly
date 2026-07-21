const Booking = require("../models/booking");
const Listing = require("../models/listings");

module.exports.createBooking = async (req, res) => {

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    if (listing.owner && listing.owner.equals(req.user._id)) {
        req.flash(
            "error",
            "You cannot book your own property"
        );
        return res.redirect(`/listings/${listing._id}`);
    }
    const { checkIn, checkOut, guests } = req.body;
    if (!checkIn || !checkOut) {
        req.flash(
            "error",
            "Check-in and Check-out are required"
        );
        return res.redirect(`/listings/${listing._id}`);
    }
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const today = new Date();

    // Remove time portion from today's date
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
        req.flash(
            "error",
            "Check-in date cannot be in the past."
        );
        return res.redirect(`/listings/${listing._id}`);
    }

    if (endDate <= startDate) {
        req.flash(
            "error",
            "Check-out must be after Check-in"
        );
        return res.redirect(`/listings/${listing._id}`);
    }

    //overlapping bookings handling
    const existingBooking = await Booking.findOne({
        listing: listing._id,
        status: "confirmed",
        checkIn: {
            $lt: endDate
        },
        checkOut: {
            $gt: startDate
        }
    });
    if (existingBooking) {
        req.flash(
            "error",
            "Sorry! These dates are already booked."
        );
        return res.redirect(`/listings/${listing._id}`);
    }

    const milliseconds = endDate - startDate;
    const nights = milliseconds / (1000 * 60 * 60 * 24);
    const totalPrice = nights * listing.price;
    const booking = new Booking({
        listing: listing._id,
        user: req.user._id,
        checkIn: startDate,
        checkOut: endDate,
        guests,
        nights,
        totalPrice
    });
    await booking.save();

    req.flash("success", "Booking created successfully");
    return res.redirect("/profile/bookings/my");
};

module.exports.myBookings = async (req, res) => {
    const bookings = await Booking.find({
        user: req.user._id
    }).populate("listing")
      .sort({ createdAt: -1 });

    const validBookings = bookings.filter(
        booking => booking.listing !== null
    );

    res.render("bookings/index.ejs", { bookings: validBookings});
};

module.exports.cancelBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/profile/bookings/my");
    }

    if (!booking.user.equals(req.user._id)) {
        req.flash("error", "You are not authorized to cancel this booking.");
        return res.redirect("/profile/bookings/my");
    }

    if (booking.status === "cancelled") {
        req.flash("error", "Booking is already cancelled.");
        return res.redirect("/profile/bookings/my");
    }

    booking.status = "cancelled";

    await booking.save();

    req.flash("success", "Booking cancelled successfully.");
    res.redirect("/profile/bookings/my");
};
