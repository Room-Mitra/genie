import express from "express";
const router = express.Router();

// register lead
router.post('/', async (req, res) => {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbzkxNDXj0ZAs4NlUTacaXPu_fADiFt5iX_e0dstEBIt1tkt7STR5zOI2X-fdPdl8-xt/exec"
    console.log("Lead added :: ", req.body)
    console.log("Lead added :: ", req)
    const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
    });
    const text = await response.text();
    res.send(text);
})

export default router;
