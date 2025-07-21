const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mongo_url = "mongodb://127.0.0.1:27017/WonderLust";

main()
    .then(() => {
        console.log("cONNECTED TO DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(mongo_url);
};

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("Data was initialised");
};

initDB();