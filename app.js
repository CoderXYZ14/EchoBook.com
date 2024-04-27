const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");

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

app.get("/", (req, res) => {
  res.send("Hi , I am root");
});

//index route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings }); // Corrected path
});

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});
//Show route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

//Create ROute
app.post("/listings", async (req, res) => {
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
});
// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My new Villa",
//     description: "By now",
//     price: 1200,
//     location: "india",
//     country: "india",
//   });
//   await sampleListing.save();
//   res.send("Successfull");
// });
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
