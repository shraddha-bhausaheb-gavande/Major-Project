const express=require("express");
const router=express.Router({mergeParams: true});
const wrapasync=require("../utils/wrapasync.js");
const expresserror=require("../utils/expresserror.js")
const Listing=require("../models/listing.js");
const Review =require("../models/review.js");
const {validateReview, isLoggedIn,isReviewauthor}=require("../middleware.js");

const reviewController=require("../controllers/reviews.js");




//Reviews
router.post("/",isLoggedIn, validateReview, wrapasync(reviewController.createReview));

  //delete review route

  router.delete("/:reviewId",isLoggedIn,isReviewauthor, wrapasync(reviewController.destroyReview)
);

module.exports=router;