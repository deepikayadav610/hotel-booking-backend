const express = require("express");
const Booking = require("../models/Booking");
const Listing = require("../models/listing.js");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/** 
 * 📌 Create a New Booking (Customer Only)
 * @route   POST /api/bookings
 */
router.post("/", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "Customer") {
            return res.status(403).json({ msg: "Access denied. Customers only." });
        }

        const { listingId, unitType, checkInDate, checkOutDate, bookingTime, totalPrice } = req.body;

        // Validate listing
        const listing = await Listing.findById(listingId);
        if (!listing) return res.status(404).json({ msg: "Listing not found" });

        // Create booking
        const newBooking = new Booking({
            customer: req.user.userId,
            listing: listingId,
            unitType,
            checkInDate,
            checkOutDate,
            bookingTime,
            totalPrice,
            status: "Pending",
        });

        await newBooking.save();
        res.status(201).json(newBooking);
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

/** 
 * 📌 Get All Bookings (Admin Only)
 * @route   GET /api/bookings
 */
router.get("/", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ msg: "Access denied. Admins only." });
        }

        const bookings = await Booking.find().populate("customer", "name email").populate("listing", "name type");
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

/** 
 * 📌 Get Customer's Own Bookings
 * @route   GET /api/bookings/my
 */
router.get("/my", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "Customer") {
            return res.status(403).json({ msg: "Access denied. Customers only." });
        }

        const bookings = await Booking.find({ customer: req.user.userId }).populate("listing", "name type");
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

/** 
 * 📌 Get Vendor's Bookings for Their Listings
 * @route   GET /api/bookings/vendor
 */
router.get("/vendor", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "Vendor") {
            return res.status(403).json({ msg: "Access denied. Vendors only." });
        }

        const bookings = await Booking.find().populate("listing", "vendor name type");
        const vendorBookings = bookings.filter((booking) => booking.listing.vendor.toString() === req.user.userId);

        res.json(vendorBookings);
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

/** 
 * 📌 Get a Single Booking by ID (Customer or Admin)
 * @route   GET /api/bookings/:id
 */
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("customer", "name email")
            .populate("listing", "name type");

        if (!booking) return res.status(404).json({ msg: "Booking not found" });

        if (req.user.role === "Customer" && booking.customer.toString() !== req.user.userId) {
            return res.status(403).json({ msg: "Access denied. You can only view your own bookings." });
        }

        res.json(booking);
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

/** 
 * 📌 Update Booking Status (Vendor or Admin)
 * @route   PUT /api/bookings/:id
 */
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate("listing", "vendor");

        if (!booking) return res.status(404).json({ msg: "Booking not found" });

        if (req.user.role === "Vendor" && booking.listing.vendor.toString() !== req.user.userId) {
            return res.status(403).json({ msg: "Access denied. Vendors can only update their own listings' bookings." });
        }

        if (req.user.role === "Admin" || req.user.role === "Vendor") {
            booking.status = req.body.status || booking.status;
            await booking.save();
            return res.json(booking);
        }

        res.status(403).json({ msg: "Access denied" });
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

/** 
 * 📌 Delete a Booking (Customer Only)
 * @route   DELETE /api/bookings/:id
 */
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ msg: "Booking not found" });

        if (booking.customer.toString() !== req.user.userId) {
            return res.status(403).json({ msg: "Access denied. You can only delete your own bookings." });
        }

        await booking.deleteOne();
        res.json({ msg: "Booking deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

module.exports = router;
