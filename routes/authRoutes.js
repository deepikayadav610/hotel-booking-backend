const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
require("dotenv").config();

const router = express.Router();

// 📌 Register a new user (Customer, Vendor, or Admin)
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        user = new User({
            name,
            email,
            password: hashedPassword,
            role, // "Customer", "Vendor", "Admin"
        });

        await user.save();
        console.log("JWT_SECRET from .env:", process.env.JWT_SECRET);

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(201).json({ token, user });
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

// 📌 Update User Profile
router.put("/update", authMiddleware, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.json({ msg: "Profile updated successfully", user });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// 📌 Login a user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

// 📌 Get logged-in user details (Protected Route)
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) return res.status(404).json({ msg: "User not found" });

        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

module.exports = router;
