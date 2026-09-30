const User = require("../models/user.js");

module.exports.rendersignup = (req,res)=>{
    res.render("user/signup.ejs");
}

module.exports.postsignup = async(req,res,next)=>{
    try{
        let {username, password, email} = req.body;
        const newuser=new User({email,username});
        const registereduser =await User.register(newuser,password);
        console.log(registereduser);
        req.login(registereduser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success",`Welcome to Roamly  ${username}`);
            res.redirect("/listings");
        })
        
    }catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
    }
}

module.exports.renderlogin = (req,res)=>{
    res.render("user/login.ejs");
}

module.exports.postlogin = async (req,res)=>{
    let {username}=req.body;
    req.flash("success",`Welcome back ${username}`);
    let redirecturl = res.locals.redirecturl || "/listings";
    res.redirect(redirecturl);
}

module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if(!err){
            req.flash("success","You are logged out successfully");
            return res.redirect("/listings");
        }
        next(err);
    })
}
