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
        if (!validation.isValidRequest(reviewData)) return res.status(400).send({ status: false,messege: "Please enter review data" })
        // Validation of book id in Params
        if (!ObjectId.isValid(bookIdParams)) return res.status(400).send({ status: false, messege: "Not a valid Book id in url" });

        let { bookId, reviewedBy, reviewedAt, rating, review } = reviewData
        // Validation of Book id in request body
        if (!validation.isValid(bookId)) return res.status(400).send({ status: false, messege: "Book Id is required" })
        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, messege: "Not a valid Book id" });

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
        if (!validation.isValid(rating)) return res.status(400).send({ status: false, messege: "Rating is required" })
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
        const reviewList = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({ isDeleted:0, __v: 0 })
        // Assigning reviews list
        const booksWithAllReviews = updatingReviewCount.toObject()
        booksWithAllReviews['reviewsData'] = reviewList
        
        res.status(200).send({ status: false, messege: "Review Successful", data:booksWithAllReviews  })
    }
    catch (err) {
        return res.status(500).send({ status: false, messege: err.message })
    }
}
// Upadate Book Review============================================

const updateReview = async function (req, res) {
    try {
        const bookIdParams = req.params.bookId
        const reviewIdParams = req.params.reviewId
        const dataToUpdate = req.body
        // Validation of Id's from Url
        if (!ObjectId.isValid(bookIdParams)) return res.status(400).send({ status: false, msg: "Not a valid Book id from url." });
        if (!ObjectId.isValid(reviewIdParams)) return res.status(400).send({ status: false, msg: "Not a valid Review id from url." });
        
        // Finding the book by Id in url
        const findBook = await bookModel.findOne({ _id: bookIdParams, isDeleted: false }).select({ __v: 0 })
        if (!findBook) return res.status(404).send({ status: false, message: "No Book found" })
       
        // Finding the review by if in url
        const findReview = await reviewModel.findOne({ _id: reviewIdParams, isDeleted: false })
        if (!findReview) return res.status(404).send({ status: false, message: "No Review found" })

        // verifying review id belongs to the book or not
        const bookIdFromReview = findReview.bookId.toString()
        if (bookIdParams !== bookIdFromReview) return res.status(400).send({ status: false, messege: "The review you want to update not belongs to the book provide in url." })

        // User input validation
        const { reviewedBy, rating, review } = dataToUpdate
        if (!validation.isValidRequest(dataToUpdate)) return res.status(400).send({ status: false, message: "Please enter details you want to update." })

        //If Reviewed by is present 
        if (reviewedBy == "") {
            return res.status(400).send({ status: false, message: "Reviewer's name cannot be empty" })
        } else if (reviewedBy) {
            if (!validation.isValid(reviewedBy) || !validation.isValidName(reviewedBy) ) 
            return res.status(400).send({ status: false, message: "Title is invalid. Should Contain only alphabets." })
        }
        dataToUpdate['reviewedBy'] = reviewedBy


        //If Rating by is present 
        if (rating == "" ) {
            return res.status(400).send({ status: false, message: "Rating cannot be empty" })
        } else if (rating) {
            if (!validation.isValid(rating) || !validation.isValidRating(rating)) 
            return res.status(400).send({ status: false, message: "Rating must be 1 to 5 numerical value" });
        }
        dataToUpdate['rating'] = rating

        //If Review by is present 
        if (review == "") {
            return res.status(400).send({ status: false, message: "Review cannot be empty" })
        } else if (review) {
            if (!validation.isValid(review)) return res.status(400).send({ status: false, message: "Review is invalid." })
        }
        dataToUpdate['review'] = review

        // Updating The review details
        const updatedReview = await reviewModel.findOneAndUpdate({ _id: reviewIdParams }, dataToUpdate, { new: true })
        // Finding the book's review list
        const reviewList = await reviewModel.find({ bookId: bookIdParams, isDeleted: false }).select({ isDeleted: 0, __v: 0 })
        // Assigning reviews list with book details
        const booksWithAllReviews = findBook.toObject()
        booksWithAllReviews['reviewsData'] = reviewList

        res.status(200).send({ status: false, messege: "Review Updated successfully", data: booksWithAllReviews })

    } catch (err) {
        return res.status(500).send({ status: false, messege: err.message })
    }
}


//---------------------------------------------------------------------------Delete Api for review---------------------------------------------------------------------------
const deleteReview = async function (req, res) {
    try {


        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        if (!validation.isValid(bookId)) {
            return res.status(400).send({ status: false, message: 'BookId is required' })

        }
        if (!ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })

        }

        const book = await bookModel.findOne({ _id: bookId, isDeleted: false });

        if (!book) {
            return res.status(400).send({ status: false, message: `book does not exist` })

        }

        if (!validation.isValid(reviewId)) {
            return res.status(400).send({ status: false, message: 'reviewId is required' })
        }
        if (!ObjectId.isValid(reviewId)) {
            return res.status(400).send({ status: false, message: `${reviewId} is not a valid review id` })

        }

        const review = await reviewModel.findOne({ bookId: bookId, _id: reviewId, isDeleted: false });

        if (!review) {
            return res.status(400).send({ status: false, message: `review does not exist` })

        }

        await reviewModel.findOneAndUpdate({ _id: reviewId }, { isDeleted: true })
       const newReviewCount= await bookModel.findOneAndUpdate({ _id: bookId, }, { $inc: { reviews: -1 } }, { new: true })

       // const DeleteReviewCount = await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } }, { new: true }).select({ __v: 0 })
        const ChangeReviewCount = newReviewCount.toObject()
        const reviewList = await reviewModel.find({ bookId: bookId, isDeleted: false })
       ChangeReviewCount ['reviewsData'] = reviewList

        return res.status(200).send({ status: true, message: `${reviewId} this review is deleted successfully`,data:ChangeReviewCount  })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}




module.exports.createReview = createReview
module.exports.deleteReview = deleteReview
module.exports.updateReview=updateReview