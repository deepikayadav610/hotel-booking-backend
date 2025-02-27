const express = require("express");
const multer = require("multer");
const Listing = require("../models/listing");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 📌 Multer Configuration for Image Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Save files to the `uploads/` folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Unique file names
    },
});

const upload = multer({ storage: storage });

// 📌 Middleware to Check Vendor Role
const checkVendor = (req, res, next) => {
    if (req.user.role !== "Vendor") {
        return res.status(403).json({ msg: "Access denied. Vendors only." });
    }
    next();
};

/** 
 * 📌 Create a New Listing (Vendor Only)
 * @route   POST /api/listings
 */
router.post("/", authMiddleware, checkVendor, upload.array("images", 5), async (req, res) => {
    try {
        console.log("📥 Incoming Request Body:", req.body);
        console.log("🖼 Uploaded Files:", req.files);

        const { type, name, address, contact, description, facilities, pricing } = req.body;
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ msg: "At least one image is required." });
        }

        const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

        const newListing = new Listing({
            vendor: req.user.userId,
            type,
            name,
            address: JSON.parse(address), // Ensure address is parsed properly
            contact,
            description,
            facilities: facilities.split(","), // Convert string to array
            pricing,
            images: imagePaths,
        });

        await newListing.save();
        res.status(201).json({ msg: "Listing created successfully!", listing: newListing });
    } catch (err) {
        console.error("❌ Error Creating Listing:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});


/** 
 * 📌 Get All Listings
 * @route   GET /api/listings
 */
router.get("/", async (req, res) => {
    try {
        const listings = await Listing.find().populate("vendor", "name email");
        res.json(listings);
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

/** 
 * 📌 Get Single Listing by ID
 * @route   GET /api/listings/:id
 */
router.get("/:id", async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id).populate("vendor", "name email");
        if (!listing) return res.status(404).json({ msg: "Listing not found" });

        res.json(listing);
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

/** 
 * 📌 Update a Listing (Vendor Only) with Image Upload
 * @route   PUT /api/listings/:id
 */
router.put("/:id", authMiddleware, checkVendor, upload.array("images", 5), async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ msg: "Listing not found" });

        if (listing.vendor.toString() !== req.user.userId) {
            return res.status(403).json({ msg: "Access denied. You can only edit your own listings." });
        }

        // Update listing fields
        const updatedData = req.body;
        if (req.files.length > 0) {
            updatedData.images = req.files.map((file) => `/uploads/${file.filename}`);
        }

        const updatedListing = await Listing.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        res.json({ msg: "Listing updated successfully!", listing: updatedListing });
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

/** 
 * 📌 Delete a Listing (Vendor Only)
 * @route   DELETE /api/listings/:id
 */
router.delete("/:id", authMiddleware, checkVendor, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ msg: "Listing not found" });

        if (listing.vendor.toString() !== req.user.userId) {
            return res.status(403).json({ msg: "Access denied. You can only delete your own listings." });
        }

        await listing.deleteOne();
        res.json({ msg: "Listing deleted successfully!" });
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

module.exports = router;
