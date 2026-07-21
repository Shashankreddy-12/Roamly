const User = require("../models/user");
const Listing = require("../models/listings");
const Booking = require("../models/booking");
const Review = require("../models/reviews");

module.exports.showProfile = async (req, res) => {
    const [
        user,
        listings,
        bookings,
        reviews
    ] = await Promise.all([

        User.findById(req.user._id)
            .populate("wishlist"),

        Listing.find({
            owner: req.user._id
        }),

        Booking.find({
            user: req.user._id
        })
            .populate("listing")
            .sort({ createdAt: -1 }),

        Review.find({
            author: req.user._id
        })
            .populate("listing")
            .sort({ createdAt: -1 })

    ]);

    const validBookings = bookings.filter(
        booking => booking.listing !== null
    );

    const validReviews = reviews.filter(
        review => review.listing !== null
    );

    user.wishlist = user.wishlist.filter(
        listing => listing !== null
    );

    const stats = {
        listings: listings.length,
        bookings: validBookings.length,
        wishlist: user.wishlist.length,
        reviews: validReviews.length
    };
    res.render("profile/index.ejs", {
        user,
        listings,
        bookings: validBookings,
        reviews: validReviews,
        stats
    });

};