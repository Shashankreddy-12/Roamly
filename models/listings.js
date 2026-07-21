const { number } = require("joi");
const mongoose = require("mongoose");
const { min } = require("../joi");
const Review = require("./reviews.js");
const User = require("./user.js");


const schema = mongoose.Schema;

const listingschema=new schema({
    title : {
        type: String,
        // required: true,
    },
    description : String,
    image : {
        url : String,
        filename : String,
    },
    price : {
        type: Number,
        min: 0
    },
    location: String,
    country: String,
    reviews : [{
        type: schema.Types.ObjectId,
        ref : "Review"
    }],
    owner : {
        type: schema.Types.ObjectId,
        ref: "User"
    },
    geometry :{
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    },
    category: {
        type: String,
        enum : [
            "Farms",
            "Rooms",
            "Amazing Views",
            "Iconic Cities",
            "Surfing",
            "Amazing Pools",
            "Beach",
            "Cabins",
            "OMG!",
            "Lakefront"
        ],
    }

});

listingschema.post("findOneAndDelete", async(listing)=>{
    if(listing){
        await Review.deleteMany({_id : {$in: listing.reviews}});
    }
});

const Listing= new mongoose.model("Listing",listingschema);
module.exports = Listing;