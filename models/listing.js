const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Vendor reference
    type: { type: String, enum: ["Hotel", "Restaurant"], required: true }, // Hotel or Restaurant
    name: { type: String, required: true },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
    },
    contact: { type: String, required: true },
    description: { type: String },
    facilities: [{ type: String }], // List of facilities like WiFi, Parking, Pool
    pricing: { type: Number, required: true }, // Base price per room/table
    availability: { type: Boolean, default: true }, // Available for booking or not
    images: [{ type: String }], // Array of image URLs
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Listing", ListingSchema);
