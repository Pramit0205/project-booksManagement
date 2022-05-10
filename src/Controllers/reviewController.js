const bookModel = require("../Models/bookModel")
const reviewModel = require("../Models/reviewModel")
const validation = require("../Middlewares/validation")
const ObjectId = require("mongoose").Types.ObjectId


//POST /books/:bookId/review

const review = async function (req, res) {
    try {
        const data = req.body;

        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, msg: "data must be given" })
        let { bookId, isDeleted, reviewedBy, reviewedAt, rating, review } = data

        if (!bookId) return res.status(400).send({ status: false, msg: "bookId is required" })
        if (!ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, msg: "Not a valid id" });
        }
        const findingBookId = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!findingBookId) return res.status(400).send({ status: false, message: "No book found with this Id" });

        
        if (!reviewedBy) return res.status(400).send({ status: false, msg: "reviewedBy is required" })
        if (!validation.isValid(reviewedBy)) return res.status(400).send({ status: false, message: "Please Enter any name" });
      
        const isReviewRepeat = await reviewModel.findOne({ bookId: bookId, reviewedBy: reviewedBy, isDeleted: false });
        if (isReviewRepeat) return res.status(400).send({ staus: false, message: "This person as already reviewed this book" });


        if (!rating) return res.status(400).send({ status: false, msg: "rating is required" })
        if(rating<1 || rating>5) return res.status(400).send({status: false, message: "Rating must be  1 to 5"});  
        

        if (review) {
            if (!validation.isValid(review)) return res.status(400).send({ status: false, message: "Please Enter any review" });
        }

        if (!reviewedAt) return res.status(400).send({ status: false, msg: "reviewedAt is required" })
        reviewedAt=new Date();

        const updatingReview= await bookModel.findOneAndUpdate({_id: bookId}, {$inc: { reviews: +1}} ,{new: true})


        const createReview= await reviewModel.create({...data,reviewedAt});
        const allReviews= await createReview.find({bookId: bookId, isDeleted: false}).select({_id:1, bookId:1, reviewedBy:1, reviewedAt:1, review:1, rating:1});

        return res.status(200).send({ status: false, msg: "review creted successfully", data: allReviews })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports.review = review