const { number } = require("joi");
const mongoose = require("mongoose");
const schema = mongoose.Schema;

const reviewschema = new schema({
    rating: {
        type:Number,
        min:1,
        max:5
    },
    comment: String,
    createdAt: {
        type: Date,
        default : Date.now
    },
    author: {
        type: schema.Types.ObjectId,
        ref: "User"
    },
    listing: {
        type: schema.Types.ObjectId,
        ref: "Listing",
        required: true
    }
});

module.exports = new mongoose.model("Review",reviewschema);