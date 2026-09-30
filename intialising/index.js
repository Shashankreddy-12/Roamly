const mongoose = require("mongoose");
const initialisedb = require("./data.js");
const Listing = require("../models/listings.js");
const Booking = require("../models/booking.js");
const Review = require("../models/reviews.js");
const User = require("../models/user.js");

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/roamly";
const seedUsername = "roamly-demo-host";

async function getSeedOwner() {
    let owner = await User.findOne({ username: seedUsername });
    if (owner) {
        return owner;
    }

    owner = new User({
        username: seedUsername,
        email: "demo.host@roamly.local"
    });

    return User.register(
        owner,
        process.env.SEED_USER_PASSWORD || "ChangeThisDemoPassword123!"
    );
}

async function initDb() {
    if (process.env.NODE_ENV === "production") {
        throw new Error("Refusing to seed the production database.");
    }

    await mongoose.connect(mongoUrl);
    console.log("DB connected successfully.");

    const owner = await getSeedOwner();

    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Listing.deleteMany({});
    await User.updateMany({}, { $set: { wishlist: [] } });

    const listings = initialisedb.data.map(listing => ({
        ...listing,
        owner: owner._id
    }));

    await Listing.insertMany(listings);
    console.log(`Database initialized with ${listings.length} listings.`);
}

initDb()
    .catch(error => {
        console.error("Database initialization failed:", error);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
