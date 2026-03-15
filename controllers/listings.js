
const Listing = require("../models/listing");
const { geocodeAddress } = require("../utils/geocode"); // adjust path if needed

// List all listings
module.exports.index = async (req, res, next) => {
  try {
    const alllistings = await Listing.find({});
    res.render("listings/index.ejs", { alllistings });
  } catch (err) {
    next(err);
  }
};

// Render form to create a new listing
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// Show a single listing (with populated owner and reviews)
module.exports.showlisting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author" },
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing you requested for does not exist");
      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
  } catch (err) {
    next(err);
  }
};

// Create a new listing
module.exports.createListing = async (req, res, next) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const url = req.file ? req.file.path : undefined;
    const filename = req.file ? req.file.filename : undefined;

    const location = req.body.listing?.location;
    const coords = location ? await geocodeAddress(location) : null;

    const newListing = new Listing({
      ...req.body.listing,
      image: url && filename ? { filename, url } : undefined,
      geometry: { type: "Point", coordinates: [coords.lng, coords.lat] }
    });

    if (req.user && req.user._id) {
      newListing.owner = req.user._id;
    }

    await newListing.save();

    req.flash("success", "New listing created!");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Render edit form for a listing
module.exports.renderEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist");
      return res.redirect("/listings");
    }

    // If you want a resized/preview URL for cloud uploads (Cloudinary example)
    let originalImageUrl = listing.image && listing.image.url ? listing.image.url : null;
    if (originalImageUrl) {
      originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250,h_250,c_fill");
    }

    res.render("listings/edit.ejs", { listing, originalImageUrl });
  } catch (err) {
    next(err);
  }
};

// Update a listing
module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body.listing };

    if (updates.location) {
  const coords = await geocodeAddress(updates.location);
  updates.geometry = { type: "Point", coordinates: [coords.lng, coords.lat] };
}


    const listing = await Listing.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist");
      return res.redirect("/listings");
    }

    // If a new file was uploaded, replace the image and save
    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
      await listing.save();
    }

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};

// Delete a listing
module.exports.destroyListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
      req.flash("error", "Listing you requested for does not exist");
      return res.redirect("/listings");
    }

    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};