const express = require("express");
const Listing = require("../models/listing");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/** 
 * 📌 Create a New Listing (Vendor Only)
 * @route   POST /api/listings
 */
router.post("/", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "Vendor") {
            return res.status(403).json({ msg: "Access denied. Vendors only." });
        }

        const { type, name, address, contact, description, facilities, pricing, images } = req.body;

        const newListing = new Listing({
            vendor: req.user.userId,
            type,
            name,
            address,
            contact,
            description,
            facilities,
            pricing,
            images,
        });

        await newListing.save();
        res.status(201).json(newListing);
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

/** 
 * 📌 Get All Listings
 * @route   GET /api/listings
 */
router.get("/", async (req, res) => {
    try {
        const listings = await Listing.find();
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
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ msg: "Listing not found" });

        res.json(listing);
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

/** 
 * 📌 Update a Listing (Vendor Only)
 * @route   PUT /api/listings/:id
 */
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ msg: "Listing not found" });

        if (listing.vendor.toString() !== req.user.userId) {
            return res.status(403).json({ msg: "Access denied. You can only edit your own listings." });
        }

        const updatedData = req.body;
        const updatedListing = await Listing.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        res.json(updatedListing);
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

/** 
 * 📌 Delete a Listing (Vendor Only)
 * @route   DELETE /api/listings/:id
 */
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ msg: "Listing not found" });

        if (listing.vendor.toString() !== req.user.userId) {
            return res.status(403).json({ msg: "Access denied. You can only delete your own listings." });
        }

        await listing.deleteOne();
        res.json({ msg: "Listing deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

module.exports = router;
