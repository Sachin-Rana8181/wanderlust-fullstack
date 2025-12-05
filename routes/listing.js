const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require('../models/listing');
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// index Route
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("image"),   // ✅ FIXED HERE
        validateListing,
        wrapAsync(listingController.createListing)
    );

// new Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// show & update & delete Route
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("image"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
