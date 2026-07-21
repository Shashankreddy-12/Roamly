const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapasync");
const { isloggedin } = require("../middleware");

const profileController = require("../controllers/profile");

router.get(
    "/profile",
    isloggedin,
    wrapAsync(profileController.showProfile)
);

module.exports = router;