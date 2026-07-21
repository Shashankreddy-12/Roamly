const Listing = require("../models/listings");

module.exports.myListings = async (req, res) => {
    const listings = await Listing.find({
        owner: req.user._id
    }).sort({ _id: -1 });

    res.render("mylistings/index.ejs", {
        listings
    });
};