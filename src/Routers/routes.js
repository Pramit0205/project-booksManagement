const express = require('express');
const router = express.Router();

const userController = require("../Controllers/userController")
const bookController = require("../Controllers/bookController")
const reviewController = require("../Controllers/reviewController")
const middleware = require("../Middlewares/auth")


//User & Login API
router.post("/register", userController.userData);
router.post("/login", userController.loginUser);

//Book API
router.post("/books", middleware.mid1, bookController.createBook)
router.get("/books", middleware.mid1, bookController.getBooks)
router.get("/books/:bookId", middleware.mid1, bookController.getReviewDetails)
router.put("/books/:bookId", middleware.mid1, bookController.updatebook)
router.delete("/books/:bookId", middleware.mid1, bookController.deleteBook)

//Review API
router.post("/books/:bookId/review", reviewController.createReview)
router.put("/books/:bookId/review/:reviewId", reviewController.updateReview)
router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview)



module.exports = router