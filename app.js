const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");


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
app.use(express.static(path.join(__dirname, "/public")));  //to add static files


app.get("/", (req, res) => {
    res.send("Hi,i am root");
});

//Index Route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
});

app.get("/listings/new" , (req, res) => {
    res.render("listings/new.ejs");
});

//Show route
app.get("/listings/:id", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
});

//create route
app.post("/listings",async (req, res) => {
    // let {title, description, image, price, country, location} = req.body;
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    
});

//edit route
app.get("/listings/:id/edit", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});

//Update route
app.put("/listings/:id",async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
});

//Delete route
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let deleteLisitng = await Listing.findByIdAndDelete(id);
    console.log(deleteLisitng);
    res.redirect("/Listings");
});


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

app.listen(8080, () => {
    console.log("Server is listening to port: 8080");
});