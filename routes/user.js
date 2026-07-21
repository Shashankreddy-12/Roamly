const express = require("express");
const wrapAsync = require("../utils/wrapasync");
const User = require("../models/user.js");
const router = express.Router();
const passport = require("passport");
const {saveredirecturl} = require("../middleware.js");
const usercontroller = require("../controllers/user.js");

router.route("/signup")
.get(usercontroller.rendersignup)
.post(wrapAsync(usercontroller.postsignup));

router.route("/login")
.get(usercontroller.renderlogin)
.post(saveredirecturl,passport.authenticate("local",{
    failureRedirect: "/login",
    failureFlash: true,
}),usercontroller.postlogin);

router.get("/logout",usercontroller.logout);

module.exports = router;