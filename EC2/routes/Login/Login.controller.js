const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY;

// Dummy User Data (Replace with database logic)
const users = [
    { username: "admin", password: "password123", hotelId: "ROOM GENIE" },
    { username: "guest", password: "guest123", hotelId: "ROOM GENIE" },

];

const getUserDetails = (username) => {
    return users.find((user) => user.username === username);
}

router.post('/', async (req, res) => {

    const { username, password } = req.body;

    const user = getUserDetails(username);
    if (!user || user.password !== password) {
        res.status(401).json({ message: "Invalid username or password" });
        return;
    }

    const hotelId = user.hotelId;

    // Generate JWT
    const token = jwt.sign({ username, hotelId }, SECRET_KEY, { expiresIn: "10h" });
    res.json({ token });

})

module.exports = router;
