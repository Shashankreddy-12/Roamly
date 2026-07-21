const mongoose = require("mongoose");
const schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userschema = new schema({
    email : {
        type: String,
        required : true,
    },
    wishlist:[
        {
            type:schema.Types.ObjectId,
            ref:"Listing"
        }
    ]
});

userschema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userschema);
