const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const Listing = require("../models/listing");  // ✅ ADD THIS
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Show all listings + create
router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// New listing form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show, update, delete listing
router.route("/:id")
  .get(wrapAsync(listingController.showListing))   // ✅ Weather handled inside controller
  .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Currency switch route
router.get("/currency/:code", (req, res) => {
  const { code } = req.params;
  req.session.currency = code;
  res.redirect("back");
});

// Search listings
router.get("/search", wrapAsync(async (req, res) => {
  const q = req.query.q || "";
  const results = await Listing.find({ title: { $regex: q, $options: "i" } });
  res.render("listings/search.ejs", { results, q });
}));

module.exports = router;
