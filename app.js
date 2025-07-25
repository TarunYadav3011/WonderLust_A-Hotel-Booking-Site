const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");

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

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookies: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        mazAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.get("/", (req, res) => {
    res.send("Hi,i am root");
});

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res , next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
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