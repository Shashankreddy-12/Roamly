const User = require("../models/user");
const Listing = require("../models/listings");
const Booking = require("../models/booking");
const { cloudinary } = require("../cloudconfig");
const ExpressError = require("../utils/expresserror");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function geocodeLocation(location) {
    try {
        const response = await geocodingClient.forwardGeocode({
            query: location,
            limit: 1,
        }).send();
        const geometry = response.body?.features?.[0]?.geometry;

        if (!geometry || geometry.type !== "Point") {
            throw new ExpressError(400, "We could not find that location. Please enter a more specific location.");
        }

        return geometry;
    } catch (error) {
        if (error instanceof ExpressError) {
            throw error;
        }

        throw new ExpressError(502, "The location service is unavailable. Please try again shortly.");
    }
}

async function removeCloudinaryImage(publicId) {
    if (!publicId) {
        return;
    }

    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Failed to remove a Cloudinary image:", error);
    }
}

function isSeedListingImage(publicId) {
    return publicId === "listingimage" || publicId?.startsWith("roamly_DEV/seed-listings/");
}

function uploadImageToCloudinary(file) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "roamly_DEV",
                resource_type: "image",
                allowed_formats: ["jpg", "jpeg", "png", "webp"]
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

        uploadStream.end(file.buffer);
    });
}

module.exports.index = async (req, res) => {
    //pagination
    let page = parseInt(req.query.page) || 1;
    if (page < 1) {
        page = 1;
    }
    const limit = 12;

    //filters
    let { category, minPrice, maxPrice } = req.query;
    const search = typeof req.query.search === "string"
        ? req.query.search.trim().slice(0, 100)
        : "";
    let query = {};
    if (search) {
        const safeSearch = escapeRegex(search);
        query.$or = [
            { title: { $regex: safeSearch, $options: "i" } },
            { location: { $regex: safeSearch, $options: "i" } },
            { country: { $regex: safeSearch, $options: "i" } }
        ];
    }
    if (category) {
        query.category = category;
    }
    if (minPrice || maxPrice) {

        query.price = {};

        if (minPrice) {
            query.price.$gte = Number(minPrice);
        }

        if (maxPrice) {
            query.price.$lte = Number(maxPrice);
        }
    }

    //calculating number of pages from the total listings for the query
    const totalListings = await Listing.countDocuments(query);
    const totalPages = Math.ceil(totalListings / limit);
    //edge case when entered page is more than total pages
    if (totalPages > 0 && page > totalPages) {
        page = totalPages;
    }
    const skip = (page - 1) * limit;
    const alllistings = await Listing.find(query)
        .skip(skip)
        .limit(limit);

    const queryParams = {
        ...req.query
    };
    delete queryParams.page;
    
    //categories,filter preservation
    const filters = {
        search: search || "",
        category: category || "",
        minPrice: minPrice || "",
        maxPrice: maxPrice || ""
    };
    res.render("listing/index.ejs", { alllistings, category,currentPage: page,totalPages,queryParams,filters });
}

module.exports.rendernewform = (req, res) => {
    res.render("listing/newlis.ejs");
}

module.exports.showlisting = async (req, res) => {

    const id = req.params.id;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    if (!listing.owner) {
        req.flash("error", "This listing no longer has a valid owner.");
        return res.redirect("/listings");
    }

    listing.reviews = listing.reviews.filter(review => review.author);

    //for showing similar listings based on category
    const similarListings = await Listing.find({
        category: listing.category,
        _id: { $ne: listing._id }
    }).limit(3);

    //for showing if this listing is wishlisted or not
    let isWishlisted = false;

    if (req.user) {

        const user = await User.findById(req.user._id).select("wishlist");

        if (user) {
            isWishlisted = user.wishlist.some(
                item => item.equals(listing._id)
            );
        }

    }
    
    console.log(similarListings);

    res.render("listing/show.ejs", {
        listing,
        isWishlisted,
        similarListings
    });

};

module.exports.postnewlisting = async (req, res) => {
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Invalid input is written!");
    // }
    if (!req.file) {
        throw new ExpressError(400, "Please upload an image for your listing.");
    }

    let geometry;
    try {
        geometry = await geocodeLocation(req.body.listing.location);
    } catch (error) {
        throw error;
    }

    let uploadedImage;

    try {
        uploadedImage = await uploadImageToCloudinary(req.file);

        const newlisting = new Listing(req.body.listing);
        newlisting.owner = req.user._id;
        newlisting.image = {
            url: uploadedImage.secure_url,
            filename: uploadedImage.public_id
        };
        newlisting.geometry = geometry;

        await newlisting.save();
    } catch (error) {
        await removeCloudinaryImage(uploadedImage?.public_id);
        throw error;
    }

    req.flash("success", "Added successfully!");
    res.redirect("/listings");
}

module.exports.rendereditform = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing does not exist!");
        res.redirect("/listings");
        return;
    }
    console.log(listing.image.url);
    let imageurl = listing.image.url.replace("/upload/", "/upload/w_200/");
    console.log(imageurl);
    res.render("listing/editlis.ejs", { listing, imageurl });
}

module.exports.updateeditlisting = async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Invalid input is written!");
    }

    let geometry;
    try {
        geometry = await geocodeLocation(req.body.listing.location);
    } catch (error) {
        throw error;
    }

    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing does not exist!");
    }

    const { image, ...listingUpdates } = req.body.listing;
    const previousImageFilename = listing.image?.filename;
    Object.assign(listing, listingUpdates);
    listing.geometry = geometry;

    let uploadedImage;

    try {
        if (req.file) {
            uploadedImage = await uploadImageToCloudinary(req.file);
            listing.image = {
                url: uploadedImage.secure_url,
                filename: uploadedImage.public_id
            };
        }

        await listing.save();
    } catch (error) {
        await removeCloudinaryImage(uploadedImage?.public_id);
        throw error;
    }

    if (req.file && previousImageFilename && !isSeedListingImage(previousImageFilename)) {
        await removeCloudinaryImage(previousImageFilename);
    }

    req.flash("success", "Updated Successfully!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroylisting = async (req, res) => {
    const id = req.params.id;
    const listing = await Listing.findByIdAndDelete(id);

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    await Promise.all([
        Booking.deleteMany({ listing: listing._id }),
        User.updateMany({}, { $pull: { wishlist: listing._id } })
    ]);

    if (listing.image?.filename && !isSeedListingImage(listing.image.filename)) {
        await removeCloudinaryImage(listing.image.filename);
    }

    req.flash("success", "Deleted Successfully!");
    res.redirect("/listings");
}
