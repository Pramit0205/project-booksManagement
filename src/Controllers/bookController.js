const bookModel = require("../Models/bookModel");
const validation = require("../Middlewares/validation");
const userModel = require("../Models/userModel");
const ObjectId = require("mongoose").Types.ObjectId;

const createBook = async function (req, res) {
    try {
        let data = req.body;
        if (Object.keys(data).length === 0)
            return res.status(400).send({ status: false, msg: "data must be given" });

        const { title, excerpt, userId, ISBN, category, subcategory } = data;

        //===========================================================================Validate title
        if (!validation.isValid(title)) {
            return res
                .status(400)
                .send({ status: false, msg: "Book title is required" });
        }

        let uniqueTitle = await bookModel.findOne({ title });
        if (uniqueTitle) {
            return res
                .status(400)
                .send({ status: false, msg: "Title already exists" });
        }

        //===========================================================================Validate excerpt
        if (!validation.isValid(excerpt)) {
            return res
                .status(400)
                .send({ status: false, msg: "Book excerpt is required" });
        }

        //===================================================================================Validate userId
        if (!userId)
            return res.status(400).send({ status: false, msg: "userId is required" });
        if (!ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "Not a valid id" });
        }

        let validUser = await userModel.findById(userId);
        if (!validUser)
            return res
                .status(404)
                .send({ status: false, msg: "UserId doesn't exist" });

        //==============================================================================Validate ISBN
        if (!validation.isValid(ISBN)) {
            return res.status(400).send({ status: false, msg: "ISBN is required" });
        }
        if (!validation.isValidISBN(ISBN)) {
            return res.status(400).send({ status: false, msg: "Not a Valid ISBN " });
        }
        let uniqueISBN = await bookModel.findOne({ ISBN: ISBN });
        if (uniqueISBN)
            return res
                .status(400)
                .send({ status: false, msg: "ISBN already exists" });

        //==============================================================================Validate category
        if (!validation.isValid(category)) {
            return res
                .status(400)
                .send({ status: false, msg: "category is required" });
        }

        //==============================================================================Validate subcategory
        if (!validation.isValid(subcategory)) {
            return res
                .status(400)
                .send({ status: false, msg: "subcategory is required" });
        }

        if (subcategory) {
            if (Array.isArray(subcategory)) {
                data["subcategory"] = [...subcategory];
            }
            if (Object.prototype.toString.call(subcategory) === "[object string]") {
                data["subcategory"] = [subcategory];
            }
        }

        //==============================================================================Validate releasedAt
        /*if (!validation.isValid(releasedAt)) {
                return res.status(400).send({ status: false, msg: "releasedAt is required" });
            }
            // if (!validation.isValid(releasedAt)) {
            //     return res.status(400).send({ status: false, msg: "releasedAt is required" });
            // }
    
           
             // Validation of releasedAt
            /* if(!validation.isValidDate(releasedAt)) {
                return res.status(400).send({ status: false, msg: "Validation of releasedAt is required"})
            }*/

        const bookData = {
            title, excerpt, userId, ISBN, category, subcategory
            //reviews,
            // releasedAt: releasedAt ? releasedAt: "releasedAt is required",
        };
        const userIdFromToken = req.userId
        if (userIdFromToken !== userId) return res.status(403).send({ status: false, message: "Unauthorized Accesss." })
      
        let savedBook = await bookModel.create(bookData);
        return res
            .status(201)
            .send({ status: true, msg: "book created", data: savedBook });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
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
            if (!ObjectId.isValid(userId))
                return res
                    .status(400)
                    .send({ status: false, message: "Invalid UserId." });
            if (ObjectId.isValid(userId)) {
                filter["userId"] = userId;
            }
        }
        //===========================================================================If category is present on query
        if (validation.isValid(category)) {
            filter["category"] = category.trim()

        }
        //===========================================================================If Subcategory is present in query
        if (validation.isValid(subcategory)) {
            const subCategoryArray = subcategory
                .trim()
                .split(",")
                .map((s) => s.trim());
            filter["subcategory"] = { $all: subCategoryArray };
        }

        const findBooks = await bookModel
            .find(filter).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 });
        if (Array.isArray(findBooks) && findBooks.length === 0)
            return res
                .status(404)
                .send({ status: false, message: "No Book(s) found." });

        //===========================================================================Sort Alphabetically by title
        const sortedBooks = findBooks.sort((a, b) => a.title.localeCompare(b.title));
        res.status(200).send({ status: true, message: "Books list", data: sortedBooks });
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
};

module.exports.createBook = createBook;
module.exports.getBooks = getBooks;
