const bookModel = require("../Models/bookModel")
const reviewModel = require("../Models/reviewModel")
const validation = require("../Middlewares/validation")
const ObjectId = require("mongoose").Types.ObjectId


//---------------------------------------------------------------------Create Review---------------------------------------------------------------
const createReview = async function (req, res) {
    try {
        const reviewData = req.body;
        const bookIdParams = req.params.bookId

        // Validation of Req Body
        if (!validation.isValidRequest(reviewData)) return res.status(400).send({ status: false, messege: "Please enter review data" })
        // Validation of book id in Params
        if (!ObjectId.isValid(bookIdParams)) return res.status(400).send({ status: false, messege: "Not a valid Book id in url" });

        let { reviewedBy, rating, review, isDeleted } = reviewData

        // Validation of reviewby
        if (reviewedBy) {
            if (!validation.isValid(reviewedBy)) return res.status(400).send({ status: false, message: "Please Enter reviwedBy name" });
            if (!validation.isValidName(reviewedBy)) return res.status(400).send({ status: false, message: "Reviewer's Name should contain alphabets only." });
        }
        //Rating Validation
        if (!validation.isValid(rating)) return res.status(400).send({ status: false, messege: "Rating is required" })
        if (((rating < 1) || (rating > 5)) || (!validation.isValidRating(rating)))
            return res.status(400).send({ status: false, message: "Rating must be  1 to 5 numeriacl value" });

        // If review is present
        if (review) {
            if (!validation.isValid(review)) return res.status(400).send({ status: false, message: "Please Enter any review" });
        }

        if (isDeleted == true) return res.status(400).send({ status: false, message: "You can't add this key at review creation time." })

        reviewData['bookId'] = bookIdParams
        reviewData['reviewedAt'] = new Date()

        //Creating Review data
        const createReview = await reviewModel.create(reviewData)

        // Getting new Review data
        const reviewList = await reviewModel.findOne({ _id: createReview._id }).select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })

        // Updating the review count
        const updatingReviewCount = await bookModel.findOneAndUpdate({ _id: bookIdParams }, { $inc: { reviews: +1 } }, { new: true }).select({ __v: 0 })

        // Assigning reviews list
        const bookWithReview = updatingReviewCount.toObject()
        bookWithReview['reviewsData'] = reviewList

        res.status(200).send({ status: true, messege: "Review Successful", data: bookWithReview })
    }
    catch (err) {
        return res.status(500).send({ status: false, messege: err.message })
    }
}
//-------------------------------------------------------------------Update Review---------------------------------------------------------------------

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
            if (!validation.isValid(reviewedBy) || !validation.isValidName(reviewedBy))
                return res.status(400).send({ status: false, message: "ReviewBy Should Contain only alphabets." })
        }
        dataToUpdate['reviewedBy'] = reviewedBy


        //If Rating by is present 
        if (rating == "") {
            return res.status(400).send({ status: false, message: "Rating cannot be empty" })
        } else if (rating) {
            if ( ((rating < 1) || (rating > 5)) || !validation.isValidRating(rating))
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
        const updatedReview = await reviewModel.findOneAndUpdate({ _id: reviewIdParams }, dataToUpdate, { new: true }).select({isDeleted:0, createdAt:0,updatedAt:0,__v:0})

        // Assigning reviews list with book details
        const booksWithUpdatedReview = findBook.toObject()
        booksWithUpdatedReview['reviewsData'] = updatedReview

        res.status(200).send({ status: true, messege: "Review Updated successfully", data: booksWithUpdatedReview })

    } catch (err) {
        return res.status(500).send({ status: false, messege: err.message })
    }
}


//---------------------------------------------------------------------------Delete Api for review---------------------------------------------------
const deleteReview = async function (req, res) {
    try {
        const bookIdParams = req.params.bookId
        const reviewId = req.params.reviewId

        // Validation of ID
        if (!ObjectId.isValid(bookIdParams))
            return res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })

        if (!ObjectId.isValid(reviewId))
            return res.status(400).send({ status: false, message: `${reviewId} is not a valid review id` })

        // Finding the book
        const findBook = await bookModel.findOne({ _id: bookIdParams, isDeleted: false });
        if (!findBook) return res.status(404).send({ status: false, message: `Book not Found` })

        // Finding the review
        const findReview = await reviewModel.findOne({ bookId: bookIdParams, _id: reviewId, isDeleted: false });
        if (!findReview) return res.status(404).send({ status: false, message: `Review not found` })

        // verifying review id belongs to the book or not
        const bookIdFromReview = findReview.bookId.toString()
        if (bookIdParams !== bookIdFromReview) return res.status(400).send({ status: false, messege: "The review you want to update not belongs to the book provide in url." })

        // Deleting the review
        await reviewModel.findOneAndUpdate({ _id: reviewId }, { isDeleted: true })

        // Decrease Review count of the book
        await bookModel.findOneAndUpdate({ _id: bookIdParams, }, { $inc: { reviews: -1 } })

        // const ChangeReviewCount = newReviewCount.toObject()
        // const reviewList = await reviewModel.find({ bookId: bookId, isDeleted: false })
        // ChangeReviewCount['reviewsData'] = reviewList

        return res.status(200).send({ status: true, message: `${reviewId} this review is deleted successfully` })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}



module.exports.createReview = createReview
module.exports.deleteReview = deleteReview
module.exports.updateReview = updateReview

