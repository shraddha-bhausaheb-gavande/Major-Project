if(process.env.NODE_ENV !="production"){
  require("dotenv").config();
}


const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapasync=require("./utils/wrapasync.js");
const expresserror=require("./utils/expresserror.js")
const {listingSchema, reviewSchema}=require("./schema.js");
const { validateHeaderName } = require("http");
const { request } = require("https");
const Review =require("./models/review.js");
const session = require("express-session");
const { MongoStore } = require("connect-mongo"); 

const flash=require("connect-flash");
const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");



const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
  console.log("connected to DB");
}).catch(err=>{
  console.log(err);
})
async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const store = new MongoStore({
  mongoUrl: dbUrl,
  crypto: { 
    secret: process.env.SECRET,
   },
  touchAfter: 24 * 3600
});

const sessionOptions = {
  secret:  process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  store,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};




// app.get("/",(req,res)=>{
//   res.send("Hi, I am root");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
})

// app.get("/demouser",async(req,res)=>{
//   let fakeUser=new User({
//     email:"student@gmail.com",
//     username:"selta-student"
//   });
//   let registerUser=await User.register(fakeUser,"helloworld");
//   res.send(registerUser);
// })

const validateListing=(req,res,next)=>{
  let {error}=listingSchema.validate(req.body);
  if (error){
    let errmsg=error.details.map((el)=>el.message).join(",");
    throw new expresserror(400,errmsg);
  }else{
    next();
  }
};

const validateReview=(req,res,next)=>{
  let {error}=reviewSchema.validate(req.body);
  if (error){
    let errmsg=error.details.map((el)=>el.message).join(",");
    throw new expresserror(400,errmsg);
  }else{
    next();
  }
};


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

app.all(/.*/,(req, res, next) => {
  next(new expresserror(404, "Page not found!"));
});


app.use((err,req,res,next)=>{
  let  {statuscode=500,message="something went wrong!"}=err;
  res.status(statuscode).render("error.ejs",{message});
  // res.status(statuscode).send(message);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT,()=>{
  console.log(`server is listening to port ${PORT}`);
});




