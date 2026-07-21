const Listing = require("../models/listings.js");
const Review = require("../models/reviews.js");

module.exports.postreview = async(req,res)=>{
    const id=req.params.id;
    const listing= await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }
    const rev= new Review(req.body.review);
    rev.author=req.user._id;
    rev.listing=listing._id;
    console.log(rev);
    listing.reviews.push(rev);
    await rev.save();
    await listing.save();
    // console.log("Review added successfully");
    req.flash("success","Review added Successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyreview = async(req,res)=>{
    const {id,reviewid} = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    listing.reviews.pull(reviewid);
    await listing.save();
    
    await Review.findByIdAndDelete(reviewid);
    req.flash("success","Review deleted Successfully!");    
    res.redirect(`/listings/${id}`);
};
