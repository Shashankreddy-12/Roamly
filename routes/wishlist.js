const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapasync");
const { isloggedin, validateObjectIds } = require("../middleware");

const wishlistController = require("../controllers/wishlist");

router.get(
    "/profile/wishlist",
    isloggedin,
    wrapAsync(wishlistController.showWishlist)
);

router.post(
    "/wishlist/:id",
    validateObjectIds("id"),
    isloggedin,
    wrapAsync(wishlistController.addToWishlist)
);

router.delete(
    "/wishlist/:id",
    validateObjectIds("id"),
    isloggedin,
    wrapAsync(wishlistController.removeFromWishlist)
);

module.exports = router;
