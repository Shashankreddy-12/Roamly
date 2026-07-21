const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapasync");
const { isloggedin } = require("../middleware");
const profileController = require("../controllers/mylistings");

router.get(
    "/profile/listings",
    isloggedin,
    wrapAsync(profileController.myListings)
);
module.exports = router;