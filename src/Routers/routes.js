const express = require('express');
const router = express.Router();

const userController = require("../Controllers/userController")
 const bookController = require("../Controllers/bookController")
// const reviewController = require("../Controllers/reviewController")
// const middleware = require("../Middlewares/auth")
//--------------------------------------------------------//

//--------------------------------------------------------//

//User API
router.post("/registerUser", userController.userData);
//LogIn API
router.post("/login", userController.loginUser)
// Book Api
router.post("/books", bookController.createBook)


module.exports = router