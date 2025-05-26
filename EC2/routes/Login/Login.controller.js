const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const { verifyUserCredentials } = require('./Login.service');

const SECRET_KEY = process.env.SECRET_KEY;




router.post('/', async (req, res) => {
    const { username, password, hotelId } = req.body;
    console.info(`Login attempt for user ${username} with hotelId ${hotelId}`)

    if (!username || !password || !hotelId) {
        res.status(400).json({ message: "Username, hotelId and password are required" });
    }

    try {
        const isValidUser = await verifyUserCredentials({ username, hotelId, password });
        if (!isValidUser) {
            res.status(401).json({ message: "Invalid hotel id or username or password" });
            console.info(`Login attempt for user ${username} with hotelId ${hotelId} : FAILED`)
            return;
        }

        // Generate JWT
        const token = jwt.sign({ username, hotelId }, SECRET_KEY, { expiresIn: "10h" });
        console.info(`Login successful for user ${username} with hotelId ${hotelId}`)
        res.json({ token });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: "An error occurred. Please try again." });
    }
})

module.exports = router;
