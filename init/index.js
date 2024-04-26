const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

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

const initDB = async () => {
  await Listing.deleteMany({});
  const data = initData.data.map((item) => ({
    ...item,
    image: item.image.url, // Extracting the URL string from the 'image' object
  }));
  await Listing.insertMany(data);
};

initDB();
