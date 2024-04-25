const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

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
app.get("/", (req, res) => {
  res.send("Hi , I am root");
});
app.get("/testListing", async (req, res) => {
  let sampleListing = new Listing({
    title: "My new Villa",
    description: "By now",
    price: 1200,
    location: "india",
    country: "india",
  });
  await sampleListing.save();
  res.send("Successfull");
});
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
