const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Customer reference
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true }, // Hotel/Restaurant reference
    unitType: { type: String, required: true }, // Room type (for hotels) or Table type (for restaurants)
    checkInDate: { type: Date, required: true }, // Check-in date (for hotels)
    checkOutDate: { type: Date }, // Check-out date (only for hotels)
    bookingTime: { type: String }, // Booking time (only for restaurants)
    totalPrice: { type: Number, required: true }, // Total booking price
    status: { type: String, enum: ["Pending", "Confirmed", "Cancelled"], default: "Pending" }, // Booking status
    createdAt: { type: Date, default: Date.now }, // Timestamp of booking
});

module.exports = mongoose.model("Booking", BookingSchema);
