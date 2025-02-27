const express = require("express");
const User = require("../models/User");
const Listing = require("../models/listing");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 📌 Middleware to Check Admin Role
const checkAdmin = (req, res, next) => {
    if (req.user.role !== "Admin") {
        return res.status(403).json({ msg: "Access denied. Admins only." });
    }
    next();
};

/** 
 * 📌 Get All Users (Admin Only)
 * @route   GET /api/admin/users
 */
router.get("/users", authMiddleware, checkAdmin, async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Don't send passwords
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

/** 
 * 📌 Delete User (Admin Only)
 * @route   DELETE /api/admin/users/:id
 */
router.delete("/users/:id", authMiddleware, checkAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: "User deleted successfully!" });
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

/** 
 * 📌 Delete Listing (Admin Only)
 * @route   DELETE /api/admin/listings/:id
 */
router.delete("/listings/:id", authMiddleware, checkAdmin, async (req, res) => {
    try {
        await Listing.findByIdAndDelete(req.params.id);
        res.json({ msg: "Listing deleted successfully!" });
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

module.exports = router;
