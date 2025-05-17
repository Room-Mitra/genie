const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key"; // Replace with a secure key

// Dummy User Data (Replace with database logic)
const users = [
    { username: "admin", password: "password123" },
    { username: "guest", password: "guest123" },

];

router.post('/', async (req, res) => {

    const { username, password } = req.body;
    const user = users.find(
        (user) => user.username === username && user.password === password
    );

    console.log(user, username, password, req.body)
    if (!user) {
        res.status(401).json({ message: "Invalid username or password" });
        return;
    }

    // Generate JWT
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });

})

module.exports = router;
