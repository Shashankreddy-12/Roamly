const mongoose = require("mongoose");

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const Listing = require("../models/listings.js");
const { cloudinary } = require("../cloudconfig.js");
const { data } = require("./data.js");

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/roamly";
const seedFolder = "roamly_DEV/seed-listings";

async function migrateSeedImages() {
    await mongoose.connect(mongoUrl);

    let migrated = 0;

    for (const [index, listing] of data.entries()) {
        const publicId = `${seedFolder}/${String(index + 1).padStart(2, "0")}`;
        const uploadedImage = await cloudinary.uploader.upload(listing.image.url, {
            public_id: publicId,
            overwrite: true,
            resource_type: "image"
        });

        const result = await Listing.updateOne(
            {
                title: listing.title,
                $or: [
                    { "image.filename": "listingimage" },
                    { "image.filename": publicId }
                ]
            },
            {
                $set: {
                    "image.url": uploadedImage.secure_url,
                    "image.filename": uploadedImage.public_id
                }
            }
        );

        if (result.matchedCount !== 1) {
            throw new Error(`Seed listing not found: ${listing.title}`);
        }

        migrated += 1;
    }

    console.log(`Migrated ${migrated} seed listing images to Cloudinary.`);
}

migrateSeedImages()
    .catch(error => {
        console.error("Failed to migrate seed listing images:", error);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
