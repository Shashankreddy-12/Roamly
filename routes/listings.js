const express = require("express");
const router = express.Router();
const Listing = require("../models/listings.js");
const mongoose = require("mongoose");
const wrapAsync =require("../utils/wrapasync.js");
// const {listingschema,reviewschema} = require("../joi.js");
// const ExpressError =require("../utils/expresserror.js");
const {isloggedin,isowner,schemavalidatelisting,validateObjectIds} = require("../middleware.js"); 
const { populate } = require("../models/user.js");
const listingcontroller = require("../controllers/listing.js");
const multer=require('multer');
const ExpressError = require("../utils/expresserror.js");

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const listingimages = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (!allowedImageTypes.has(file.mimetype)) {
            return callback(
                new ExpressError(400, "Only JPEG, PNG, and WebP images are allowed.")
            );
        }

        callback(null, true);
    }
});

//Index Route,Post Route
router.route("/")
.get(wrapAsync(listingcontroller.index))
.post(isloggedin,listingimages.single('listing[image]') ,schemavalidatelisting ,wrapAsync(listingcontroller.postnewlisting));

//New Route
router.get("/new",isloggedin,listingcontroller.rendernewform);

//Show Route,Delete Route,Put Route
router.route("/:id")
.get(validateObjectIds("id"), wrapAsync(listingcontroller.showlisting))
.put(validateObjectIds("id"), isloggedin,isowner,listingimages.single('listing[image]'),schemavalidatelisting ,wrapAsync(listingcontroller.updateeditlisting))
.delete(validateObjectIds("id"), isloggedin,isowner, wrapAsync(listingcontroller.destroylisting));

//Edit Route
router.get("/:id/edit",validateObjectIds("id"),isloggedin,isowner,wrapAsync(listingcontroller.rendereditform));


module.exports= router;

// router.get("/templisting", async (req,res)=>{
//     const newlisting= new Listing({
//         title: "Novotel",
//         description : "Premium rooms with airport view",
//         price : 20000,
//         location: "Shamshabad, Hyderabad",
//         country: "India",
//     });
//     await newlisting.save();
//     console.log("Listing added");
//     res.send("New Listing added successfully");
// });
