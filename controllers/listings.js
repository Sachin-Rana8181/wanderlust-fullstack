const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


// =============================
// INDEX (CATEGORY + SEARCH)
// =============================
module.exports.index = async (req, res) => {
    const { category, search } = req.query;

    let filter = {};

    if (category) {
        filter.category = category;
    }

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } }
        ];
    }

    const alllistings = await Listing.find(filter);
    const total = await Listing.countDocuments(filter);

    res.render("listings/index", { 
        alllistings,
        category: category || "All",
        search: search || "",
        total
    });
};


// =============================
// RENDER NEW FORM
// =============================
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs", { search: "", category: "All" });
};


// =============================
// SHOW LISTING
// =============================
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" },
        }).populate("owner");

    if (!listing) {
        req.flash("error", "listing you requested for does not exist");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { 
        listing,
        search: "",
        category: "All"
    });
};


// =============================
// CREATE LISTING
// =============================
module.exports.createListing = async (req, res) => {

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    }).send();

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.category = req.body.listing.category;

    if (req.file) {
        newListing.image = { url: req.file.path, filename: req.file.filename };
    }

    newListing.geometry = response.body.features[0].geometry;

    await newListing.save();
    req.flash("success", "New listing Created!");
    res.redirect("/listings");
};


// =============================
// RENDER EDIT FORM
// =============================
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "listing you requested does not exist");
        return res.redirect("/listings");
    }

    let originalImageurl = listing.image.url;
    originalImageurl = originalImageurl.replace("/upload", "/upload/w_250");

    res.render("listings/edit.ejs", { 
        listing, 
        originalImageurl,
        search: "",
        category: "All"
    });
};


// =============================
// UPDATE LISTING
// =============================
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;
    listing.category = req.body.listing.category;

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


// =============================
// DELETE LISTING
// =============================
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};

