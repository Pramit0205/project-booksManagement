const bookModel = require("../Models/bookModel");
const reviewModel = require("../Models/reviewModel")
const validation = require("../Middlewares/validation");
const userModel = require("../Models/userModel");
const ObjectId = require("mongoose").Types.ObjectId;

//==========================================================Create Book Api======================================================
const createBook = async function (req, res) {
    try {
        let data = req.body;
        if (Object.keys(data).length === 0)
            return res.status(400).send({ status: false, message: "No input by user." });

        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data;

        //===========================================================================Validate title
        if (!validation.isValid(title))
            return res.status(400).send({ status: false, message: "Book title is required" });

        let uniqueTitle = await bookModel.findOne({ title });
        if (uniqueTitle)
            return res.status(400).send({ status: false, message: "Title already exists" });

        //===========================================================================Validate excerpt
        if (!validation.isValid(excerpt))
            return res.status(400).send({ status: false, message: "Book excerpt is required" });


        //===================================================================================Validate userId
        if (!validation.isValid(userId))
            return res.status(400).send({ status: false, message: "userId is required" });
        if (!ObjectId.isValid(userId))
            return res.status(400).send({ status: false, message: "Not a valid id" });

        let validUser = await userModel.findById(userId);
        if (!validUser)
            return res.status(404).send({ status: false, message: "UserId doesn't exist" });

        //==============================================================================Validate ISBN
        if (!validation.isValid(ISBN))
            return res.status(400).send({ status: false, message: "ISBN is required" });

        if (!validation.isValidISBN(ISBN))
            return res.status(400).send({ status: false, message: "Not a Valid ISBN " });

        let uniqueISBN = await bookModel.findOne({ ISBN: ISBN });
        if (uniqueISBN)
            return res.status(400).send({ status: false, message: "ISBN already exists" });

        //==============================================================================Validate category
        if (!validation.isValid(category))
            return res.status(400).send({ status: false, message: "category is required" });

        //==============================================================================Validate subcategory
        if (!validation.isValid(subcategory))
            return res.status(400).send({ status: false, message: "subcategory is required" });

        if (subcategory) {
            if (Array.isArray(subcategory)) {
                data["subcategory"] = [...subcategory];
            }
            if (Object.prototype.toString.call(subcategory) === "[object string]") {
                data["subcategory"] = [subcategory];
            }
        }

        //==============================================================================Validate releasedAt
        if (!validation.isValid(releasedAt)) return res.status(400).send({ status: false, message: "Release date is Required" })
        if (!validation.isValidDate(releasedAt)) return res.status(400).send({ status: false, message: "Date should be valid & format will YYYY-MM-DD" })

        const bookData = { title, excerpt, userId, ISBN, category, subcategory, releasedAt };

        //=============================================================================Authorization
        const userIdFromToken = req.userId
        if (userIdFromToken !== userId) return res.status(403).send({ status: false, message: "Unauthorized Accesss." })

        let savedBook = await bookModel.create(bookData);
        return res.status(201).send({ status: true, message: "book created", data: savedBook });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};


//==================================================================== Get books by query===========================================
const getBooks = async function (req, res) {
    try {
        const userQuery = req.query;
        // ===========================================================================If no query find all active blogs
        const filter = { isDeleted: false };
        const { userId, category, subcategory } = userQuery;

        // ===========================================================================Validation of user id and adding to query
        if (userId) {
            if (!ObjectId.isValid(userId)) {
                return res.status(400).send({ status: false, message: "Invalid UserId." });
            }
            else {
                filter["userId"] = userId;
            }
        }
        //===========================================================================If category is present on query
        if (validation.isValid(category)) {
            filter["category"] = category.trim()

        }
        //===========================================================================If Subcategory is present in query
        if (validation.isValid(subcategory)) {
            const subCategoryArray = subcategory.trim().split(",").map((s) => s.trim());
            filter["subcategory"] = { $all: subCategoryArray };
        }

        const findBooks = await bookModel
            .find(filter).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 });

        if (Array.isArray(findBooks) && findBooks.length === 0)
            return res.status(404).send({ status: false, message: "No Book(s) found." });

        //===========================================================================Sort Alphabetically by title
        const sortedBooks = findBooks.sort((a, b) => a.title.localeCompare(b.title));

        res.status(200).send({ status: true, message: "Books list", data: sortedBooks });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

// ================================================Get books reviews by ID======================================================

const getReviewDetails = async function (req, res) {
    try {
        const bookId = req.params.bookId
        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: "Not a valid book id" })

        let getBook = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({ __v: 0 })
        if (!getBook) return res.status(404).send({ status: false, message: "No book(s) found." })
        let getReviews = await reviewModel.find({ bookId })

        // let booksWithReview = getBook.toObject()
        // booksWithReview['reviewsData'] = getReviews

        let booksWithReview = getBook.toObject()
        Object.assign(booksWithReview, { reviewsData: getReviews })

        res.status(200).send({ status: true, message: "Book List", data: booksWithReview })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

//==================================================================Update Book By id=========================================

const updatebook = async function (req, res) {
    try {
        const paramsId = req.params.bookId
        const dataToUpdate = req.body
        const loggedUserId = req.userId
       
        // Id Validation
        if (!ObjectId.isValid(paramsId)) return res.status(400).send({ status: false, message: "Not a valid Book Id" })
        if (!ObjectId.isValid(loggedUserId)) return res.status(400).send({ status: false, message: "Not a valid User Id" })
        
        // Finding Books
        const findBook = await bookModel.findOne({ _id: paramsId, isDeleted: false })
        if (!findBook) return res.status(404).send({ status: false, message: "No book found." })
        
        // Authorization
        const requestUserId = findBook.userId
        if (loggedUserId !== requestUserId.toString()) return res.status(403).send({ status: false, message: "Unauthorized access" })
        
        // Destructuring
        const { title, excerpt, releasedAt, ISBN } = dataToUpdate
        if (!validation.isValidRequest(dataToUpdate)) return res.status(400).send({ status: false, message: "Please enter details you want to update." })

        // If title is present 
        if (title) {
            if (!validation.isValid(title)) return res.status(400).send({ status: false, message: "Title is invalid." })
            const uniqueTitle = await bookModel.findOne({ title })
            if (uniqueTitle) return res.status(400).send({ status: false, message: "Title is already present." })
        }
        dataToUpdate['title'] = title

        // If ISBN is present
        if (ISBN) {
            const uniqueISBN = await bookModel.findOne({ ISBN })
            if (uniqueISBN) return res.status(400).send({ status: false, message: "ISBN is already present." })
            if (!validation.isValidISBN(ISBN)) return res.status(400).send({ status: false, message: "ISBN is invalid." })
        }
        dataToUpdate['ISBN'] = ISBN

        // If Releaded date is present
        if (releasedAt) {
            if (!validation.isValid(releasedAt)) return res.status(400).send({ status: false, message: "Please enter Date." })
            if (!validation.isValidDate(releasedAt)) return res.status(400).send({ status: false, message: "Date should be valid & format will YYYY-MM-DD" })
        }
        dataToUpdate['releasedAt'] = releasedAt

        // If excerpt is present
        if (excerpt) {
            if (!validation.isValid(excerpt)) return res.status(400).send({ status: false, message: "Please enter a valid excerpt." })
        }
        dataToUpdate['excerpt'] = excerpt
        // Final data Updation
        const updatedDetails = await bookModel.findOneAndUpdate({ _id: paramsId }, dataToUpdate, { new: true })
        res.status(200).send({ status: true, msg: "Book details updated successfully", data: updatedDetails })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

//=====================Delete book by id============================================
const deleteBook = async function (req, res) {
    try {
        const bookId = req.params.bookId
       
        // Id validation
        if (!validation.isValid(bookId)) return res.status(400).send({ status: false, message: "Please provide the bookId" });
        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: "Please provide the valid bookId" });
       
        // Finding the book
        const findDeletedBook = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!findDeletedBook) return res.status(400).send({ status: false, message: "Book not found" });
        
        // Authorization
        const userIdFromToken = req.userId
        if (userIdFromToken !== findDeletedBook.userId.toString()) return res.status(403).send({ status: false, message: "Unauthorized Accesss." })
        
        // Book delete
        const deletedBook = await bookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
        return res.status(200).send({ status: true, message: "Book is Deleted", data: deletedBook });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports.createBook = createBook
module.exports.getBooks = getBooks
module.exports.getReviewDetails = getReviewDetails
module.exports.updatebook = updatebook
module.exports.deleteBook = deleteBook
