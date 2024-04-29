const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const MONGO_URL = "mongodb://localhost:27017/wanderlust";
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(MONGO_URL);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("Hi , I am root");
});

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
//index route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings }); // Corrected path
  })
);

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});
//Show route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
  })
);

//Create ROute
app.post(
  "/listings",
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
    res.redirect("/listings");
  })
);

//Edit Route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    console.log(id);

    const listing = await Listing.findById(id);
    console.log(listing);
    res.render("listings/edit.ejs", { listing });
  })
);

//Update Route
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body });
    res.redirect(`/listings/${id}`);
  })
);

//DELETE Route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let id = req.params.id;
    let deletedListing = await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);

//Reviews
//POST
app.post(
  "/listings/:id/reviews",
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
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});
app.use((err, req, res, next) => {
  let { status, message } = err;
  res.render("listings/error.ejs", { err });
  //res.status(status || 500).send(message || "Something went wrong");
});
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
