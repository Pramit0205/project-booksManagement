const { Router } = require('express');
const express = require('express');
const router = express.Router();

const userController = require("../Controllers/userController")
 const bookController = require("../Controllers/bookController")
// const reviewController = require("../Controllers/reviewController")
// const middleware = require("../Middlewares/auth")
//--------------------------------------------------------//

//--------------------------------------------------------//
router.post("/registerUser", userController.userData);
router.post("/books", bookController.createBook)

module.exports = router