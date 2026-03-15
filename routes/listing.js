const express=require("express");
const router=express.Router();
const Listing=require("../models/listing.js");
const wrapasync = require("../utils/wrapasync");
const { validateListing } = require("../utils/middleware.js");
const {isLoggedIn, isOwner}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer=require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer({storage})

router.route("/")
.get(wrapasync(listingController.index))
.post(isLoggedIn,upload.single("image"),validateListing, wrapasync (listingController.createListing));


//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router.route("/:id")
.get(wrapasync(listingController.showlisting))
.put(isLoggedIn,isOwner,upload.single("image"), validateListing,wrapasync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapasync(listingController.destroyListing));




//Edit route

router.get("/:id/edit",isLoggedIn,isOwner,wrapasync(listingController.renderEditForm));

module.exports=router;