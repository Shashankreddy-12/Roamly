if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app= express();
const mongoose = require("mongoose");

const Listing = require("./models/listings.js");
const Review = require("./models/reviews.js");
const User=require("./models/user.js");
const Booking=require("./models/booking.js");

const session=require("express-session");
const {MongoStore}=require("connect-mongo");
// console.log(MongoStore);
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy = require("passport-local");

const path=require("path");
const methodOverride=require("method-override");
const ejsmate=require("ejs-mate");
const wrapAsync =require("./utils/wrapasync.js");
const ExpressError =require("./utils/expresserror.js");
const {listingschema,reviewschema} = require("./joi.js");

const listingrouter = require("./routes/listings.js");
const reviewrouter = require("./routes/reviews.js");
const userrouter = require("./routes/user.js");
const bookingrouter = require("./routes/bookings.js");
const wishlistRoutes = require("./routes/wishlist");
const profileRoutes = require("./routes/profile");
const mylistingsRoute = require("./routes/mylistings");

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/roamly";
const port = Number(process.env.PORT) || 1202;

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname,"/public")));

const store=MongoStore.create({
    mongoUrl: mongoUrl,
    crypto:{
        secret: process.env.SECRET_CODE
    },
    touchAfter: 24*60*60
});
store.on("error",(err)=>{
    console.log("Error in Mongo Session Store",err);
})
const expressOptions={
    store,
    secret : process.env.SECRET_CODE,
    resave : false,
    saveUninitialized: true,
    cookie :{
        expires : Date.now()+ 24*60*60*1000,
        maxAge : 24*60*60*1000,
        httpOnly : true,
    },
}

app.use(session(expressOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.successmsg = req.flash("success");
    res.locals.errormsg = req.flash("error");
    res.locals.loggeduser = req.user;
    res.locals.search=req.query.search || "";
    next();
});

app.get("/", (req, res) => {
    res.redirect("/listings");
});

const informationPages = {
    "/privacy": {
        title: "Privacy",
        paragraphs: [
            "Roamly is a portfolio project. Please do not submit sensitive personal information.",
            "A reviewed privacy policy must be published before any public commercial launch."
        ]
    },
    "/terms": {
        title: "Terms of Use",
        paragraphs: [
            "Roamly is currently provided as a demonstration application.",
            "Formal terms of use are required before accepting public users or payments."
        ]
    },
    "/compdetails": {
        title: "Company Details",
        paragraphs: [
            "Roamly is an educational portfolio project and is not a registered accommodation provider.",
            "Company and support details must be added before a commercial launch."
        ]
    }
};

for (const [route, page] of Object.entries(informationPages)) {
    app.get(route, (req, res) => {
        res.render("static/info.ejs", page);
    });
}

// app.get("/demouser",async(req,res)=>{
//     let fakeuser= new User({
//         email: "fakeemail@gmail.com",
//         username: "hacker",
//     });
//     const registereduser = await User.register(fakeuser , "password");
//     res.send(registereduser);
// });

app.use("/listings",listingrouter);
app.use("/listings/:id/review",reviewrouter);
app.use("/",userrouter);
app.use("/", bookingrouter);
app.use(mylistingsRoute);
app.use(wishlistRoutes);
app.use(profileRoutes);

app.use((req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
});

app.use((err,req,res,next)=>{
    if (err.code === "LIMIT_FILE_SIZE") {
        err.statusCode = 400;
        err.message = "Image size must not exceed 5 MB.";
    }

    let {statusCode=500, message = "Some error occured"} = err;
    res.status(statusCode).render("error.ejs",{err});
    // res.status(statusCode).send(message);
});

// app.use((err, req,res,next)=>{
//         res.send("Error occured due to invalid input data!");
// });

async function startServer() {
    try {
        await mongoose.connect(mongoUrl);
        console.log("DB connected successfully.");
        app.listen(port, () => {
            console.log(`Port ${port} is connected to Roamly website`);
        });
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        process.exit(1);
    }
}

startServer();
