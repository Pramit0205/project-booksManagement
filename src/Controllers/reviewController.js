const bookModel = require("../Models/bookModel")
const reviewModel = require("../Models/reviewModel")
const validation = require("../Middlewares/validation")
const ObjectId = require("mongoose").Types.ObjectId


//======================================================Create Review Api=====================================================
const createReview = async function (req, res) {
    try {
        const reviewData = req.body;
        const bookIdParams = req.params.bookId

        // Validation of Req Body
        if (!validation.isValidRequest(reviewData)) return res.status(400).send({ status: false, msg: "Please enter review data" })
        // Validation of book id in Params
        if (!ObjectId.isValid(bookIdParams)) return res.status(400).send({ status: false, msg: "Not a valid Book id in url" });

        let { bookId, reviewedBy, reviewedAt, rating, review } = reviewData
        // Validation of Book id in request body
        if (!validation.isValid(bookId)) return res.status(400).send({ status: false, msg: "Book Id is required" })
        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, msg: "Not a valid Book id" });

        // Matching the book id of url &  request body
        if (bookIdParams !== bookId) return res.status(400).send({ status: false, message: "Book ID's are not similar" })

        // Finding the book by id
        const findingBookId = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!findingBookId) return res.status(400).send({ status: false, message: "No book found with this Id" });

        // Validation of reviewby
        if (!validation.isValid(reviewedBy)) return res.status(400).send({ status: false, message: "Please Enter your name" });
        if (!validation.isValidName(reviewedBy)) return res.status(400).send({ status: false, message: "Name should contain on alphabets" });

        // Validation of review date
        if (!validation.isValid(reviewedAt)) return res.status(400).send({ status: false, message: "Review date is Required" })
        if (!validation.isValidDate(reviewedAt)) return res.status(400).send({ status: false, message: "Date should be valid & format will YYYY-MM-DD" })

        //Rating Validation
        if (!validation.isValid(rating)) return res.status(400).send({ status: false, msg: "Rating is required" })
        if (!validation.isValidRating(rating)) return res.status(400).send({ status: false, message: "Rating must be  1 to 5 numerical value" });

        // If review is present
        if (review) {
            if (!validation.isValid(review)) return res.status(400).send({ status: false, message: "Please Enter any review" });
        }

        // Updating the review count
        const updatingReviewCount = await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: +1 } }, { new: true }).select({ __v: 0 })
        //Creating Review data
        const createReview = await reviewModel.create(reviewData);
        // Getting Review List
        const reviewList = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({ isDeleted: false, __v: 0 })
        // Assigning reviews list
        const booksWithAllReviews = updatingReviewCount.toObject()
        booksWithAllReviews['reviewsData'] = reviewList

        res.status(200).send({ status: false, msg: "Review Successful", data: booksWithAllReviews })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}




module.exports.createReview = createReview