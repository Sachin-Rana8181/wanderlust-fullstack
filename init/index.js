const mongoose = require("mongoose");
const Listing = require("../models/listing");

const initData = require("./data");


main().then(() => {
  console.log("connected to DB");
}).catch((err) => {
  console.log(err);
});

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data=initData.data.map((obj)=>({...obj,owner:"69228b6b404a725f12e55bb2"}))
  await Listing.insertMany(initData.data);
  console.log("Data was initialized");
};

initDB();
