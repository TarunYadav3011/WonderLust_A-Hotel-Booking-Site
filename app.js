const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError");
const { listingSchema } = require("./schema.js");
const Review = require("./models/review.js");
const { reviewSchema } = require("./schema.js");


const   mongo_url = "mongodb://127.0.0.1:27017/WonderLust";

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


const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//Index Route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings } );
});

//New Route
app.get("/listings/new" , (req, res) => {
    res.render("listings/new.ejs");
});

//Show route
app.get("/listings/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");

    res.render("listings/show.ejs", { listing });
}));

//create route
app.post("/listings", 
    validateListing ,
    wrapAsync(async (req, res) => {

        

        if(!req.body.listing) {
            throw new ExpressError(400, "Send valid data for listing");
        }
        // let {title, description, image, price, country, location} = req.body;
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
 
    
}));

//edit route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//Update route
app.put("/listings/:id",
     validateListing ,
     wrapAsync(async (req, res ,next) => {
    
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${ id }`);
}));

//Delete route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deleteLisitng = await Listing.findByIdAndDelete(id);
    console.log(deleteLisitng);
    res.redirect("/listings");
}));

//Reviews
//Post  Route
app.post("/listings/:id/reviews",validateReview,
    wrapAsync( async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);


    listing.reviews.push(newReview);
    let { id } = req.params;

    await newReview.save();
    await listing.save();

    
   
    res.redirect(`/listings/${ id }`);
    
}));

//Delete Review Route
app.delete("/listings/:id/reviews/:reviewId", 
    wrapAsync(async (req, res) => {
        let {id, reviewId} = req.params;

        await listingSchema.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
        await Review.findByIdAndDelete(reviewId);

        res.redirect(`/listings/${id}`);
}));


// app.get("/testListing", async (req, res) => {
//     let sampleListing  = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("Sampler was saved");
//     res.send("Successful testing");
// });


app.all("*",(req, res, next) => {
    next(new ExpressError(404, "Page Not Found:"));
});

app.use((err, req, res, next) => { //Error-handling
    let { statusCode = 500, message="Something went wrong!" } = err;
    // res.status(statusCode).send(message);

    res.render("error.ejs", { err });
});

app.listen(8080, () => {
    console.log("Server is listening to port: 8080");
});