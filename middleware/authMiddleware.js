const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // Get token from request headers
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
        // Verify token and decode user information
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded; // Attach user details to request object
        next();
    } catch (err) {
        res.status(401).json({ msg: "Invalid token" });
    }
};
