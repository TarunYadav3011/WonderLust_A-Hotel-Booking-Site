const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

const mongo_url = "mongodb://127.0.0.1:27017/WonderLust";

main()
    .then(() => {
        console.log("CONNECTED TO DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(mongo_url);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
// use ejs-locals for all ejs templates:
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));  //to add static files


app.get("/", (req, res) => {
    res.send("Hi,i am root");
});


app.use("/listings", listings);
app.use("/listings/:id/reviews/", reviews);

app.all("", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});
app.use((err, req, res, next) => { //Error-handling
    let { statusCode = 500, message="Something went wrong!" } = err;
    // res.status(statusCode).send(message);

    res.render("error.ejs", { err });
});

app.listen(8080, () => {
    console.log("Server is listening to port: 8080");
});