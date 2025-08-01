const express = require("express");
const router = express.Router( { mergeParams: true-});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");


const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


//Reviews
//Post  Route
router.post("/",validateReview,
    wrapAsync( async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);


    listing.reviews.push(newReview);
    let { id } = req.params;

    await newReview.save();
    await listing.save();
    req.flash("success", "New review cretated");
    res.redirect(`/listings/${ id }`);
}));

//Delete Review Route
router.delete("/:reviewId", 
    wrapAsync(async (req, res) => {
        let { id, reviewIdn } = req.params;

        await listingSchema.findByIdAndUpdate(id, { $pull: {reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Review deleted");

        res.redirect(`/listings/${id}`);
}));

module.exports = router;