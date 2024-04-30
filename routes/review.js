const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  //console.log(result);
  if (error) {
    //extra stuff
    let errMSG = error.details.map((e) => e.message).join(",");
    // throw new ExpressError(error, 400);
    throw new ExpressError(errMSG, 400);
  } else {
    next();
  }
};
//Reviews
//POST
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    //res.send("new reviews saved");
    res.redirect(`/listings/${listing._id}`);
  })
);
//DELETE Review route
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
  })
);
module.exports = router;
