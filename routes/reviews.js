const express = require("express");
const router = express.Router({mergeParams : true});

const Review = require("../models/reviews.js");
const mongoose = require("mongoose");
const wrapAsync =require("../utils/wrapasync.js");
// const {listingschema,reviewschema} = require("../joi.js");
const Listing = require("../models/listings.js");
// const ExpressError =require("../utils/expresserror.js");
const {schemavalidatereview,isloggedin,isreviewauthor,validateObjectIds} = require("../middleware.js"); 
const reviewcontroller = require("../controllers/review.js");

//Post route
//Adding review
router.post("/",validateObjectIds("id"),isloggedin,schemavalidatereview, wrapAsync(reviewcontroller.postreview));

//Deleting the review
router.delete("/:reviewid",validateObjectIds("id", "reviewid"),isloggedin,isreviewauthor,wrapAsync(reviewcontroller.destroyreview));

module.exports= router;
