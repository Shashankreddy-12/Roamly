const mongoose = require("mongoose");
const Listing = require("../models/listings.js");
const { data } = require("./data.js");

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/roamly";

async function refreshListingImages() {
    await mongoose.connect(mongoUrl);

    let updated = 0;
    let missing = 0;

    for (const listing of data) {
        const result = await Listing.updateOne(
            // Seed records use this placeholder filename; this avoids touching a
            // user-created listing that happens to share a sample title.
            { title: listing.title, "image.filename": "listingimage" },
            {
                $set: {
                    "image.url": listing.image.url,
                    "image.filename": listing.image.filename
                }
            }
        );

        if (result.matchedCount === 0) {
            missing += 1;
            continue;
        }

        if (result.modifiedCount > 0) {
            updated += 1;
        }
    }

    console.log(`Listing images refreshed. Updated: ${updated}, unchanged: ${data.length - updated - missing}, not found: ${missing}.`);
}

refreshListingImages()
    .catch(error => {
        console.error("Failed to refresh listing images:", error);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
