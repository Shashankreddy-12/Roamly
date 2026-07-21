const User = require("../models/user");
const Listing = require("../models/listings");

module.exports.addToWishlist = async (req, res) => {

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $addToSet: {
                wishlist: listing._id
            }
        }
    );

    req.flash("success", "Added to wishlist.");

    res.redirect(`/listings/${listing._id}`);
};

module.exports.removeFromWishlist = async (req, res) => {

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull: {
                wishlist: listing._id
            }
        }
    );

    req.flash("success", "Removed from wishlist.");

    res.redirect(`/listings/${listing._id}`);
};

module.exports.showWishlist = async (req, res) => {

    const user = await User.findById(req.user._id)
        .populate("wishlist");
    const validWishlist = user.wishlist.filter(
        listing => listing !== null
    ); 

    res.render("wishlist/index.ejs", {
        wishlist: validWishlist
    });

};