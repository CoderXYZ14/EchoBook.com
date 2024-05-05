const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
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

//index route

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings }); // Corrected path
  })
);

//New Rout
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});
//Show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
  })
);

//Create ROute
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res, next) => {
    const { title, description, price, location, country } = req.body;
    const newListing = new Listing({
      title,
      description,
      price,
      location,
      country,
    });
    await newListing.save();
    req.flash("success", "New Listing Added");
    res.redirect("/listings");
  })
);

//Edit Route
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    console.log(id);

    const listing = await Listing.findById(id);
    console.log(listing);
    res.render("listings/edit.ejs", { listing });
  })
);

//Update Route
router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body });
    res.redirect(`/listings/${id}`);
  })
);

//DELETE Route
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let id = req.params.id;
    let deletedListing = await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);
module.exports = router;
