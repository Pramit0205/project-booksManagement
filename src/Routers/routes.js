const express = require('express');
const router = express.Router();

const userController = require("../Controllers/userController")
// const bookController = require("../Controllers/bookController")
// const reviewController = require("../Controllers/reviewController")
// const middleware = require("../Middlewares/auth")
//--------------------------------------------------------//

router.get("/test-me", function (req, res) {
    res.status(200).send("My server is running awesome!")
})
//--------------------------------------------------------//