const Listing = require("./models/listings.js");
const Review = require("./models/reviews.js");
const mongoose = require("mongoose");
const ExpressError =require("./utils/expresserror.js");
const {listingschema,reviewschema} = require("./joi.js");

module.exports.isloggedin = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirecturl=req.originalUrl;
        // res.locals.redirecturl=req.originalUrl;
        req.flash("error","You must Login to perform this action");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveredirecturl = (req,res,next)=>{
    if(req.session.redirecturl){
        res.locals.redirecturl = req.session.redirecturl;
    }
    next();
}

module.exports.validateObjectIds = (...paramNames) => {
    return (req, res, next) => {
        const hasInvalidId = paramNames.some(
            paramName => !mongoose.isObjectIdOrHexString(req.params[paramName])
        );

        if (hasInvalidId) {
            return next(new ExpressError(404, "Resource not found!"));
        }

        next();
    };
};

module.exports.isowner = async (req,res,next)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing does not exist!");
        return res.redirect("/listings");
    }
    if(!listing.owner || !listing.owner.equals(req.user._id)){
        req.flash("error","You are not authorised to perform this action since you are not the owner!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.schemavalidatelisting = (req,res,next)=>{
    const {error}= listingschema.validate(req.body);
    if(error){
        const errmsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400,errmsg)
    }
    next();
}

module.exports.schemavalidatereview = (req,res,next)=>{
    const {error}= reviewschema.validate(req.body);
    if(error){
        const errmsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400,errmsg)
    }
    next();
}

module.exports.isreviewauthor = async (req,res,next)=>{
    let {id, reviewid} = req.params;
    const review = await Review.findById(reviewid);
    if(!review){
        req.flash("error","Review does not exist!");
        return res.redirect(`/listings/${id}`);
    }
    if(!review.author || !review.author.equals(req.user._id)){
        req.flash("error","You are not authorised to perform this action since you are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
