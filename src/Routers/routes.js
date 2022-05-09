const express = require('express');
const router = express.Router();

const userController = require("../Controllers/userController")
 const bookController = require("../Controllers/bookController")
// const reviewController = require("../Controllers/reviewController")
// const middleware = require("../Middlewares/auth")
//--------------------------------------------------------//

//--------------------------------------------------------//

//User API
router.post("/register", userController.userData);
router.post("/login", userController.loginUser)

router.post("/books", bookController.createBook)


module.exports = router