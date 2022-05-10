
const bookModel = require("../Models/bookModel")
const validation = require("../Middlewares/validation")
const userModel = require("../Models/userModel")
const ObjectId = require("mongoose").Types.ObjectId

const createBook = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, msg: "data must be given" })
        
        const { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = req.body;

        //Validate title
        if (!validation.isValid(title)) {
            return res.status(400).send({ status: false, msg: "Book title is required" });
        }

        //Validate excerpt
        if (!validation.isValid(excerpt)) {
            return res.status(400).send({ status: false, msg: "Book excerpt is required" });
        }

        //Validate userId
        if(!userId)return res.status(400).send({status:false, msg: "userId is required"})
        if (!ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "Not a valid id" });
        }
       
        let validUser = await userModel.findById(userId).catch(err => null)
        if (!validUser) return res.status(404).send({ status: false, msg: "UserId doesn't exist" })

       

        //Validate ISBN
        if (!validation.isValid(ISBN)) {
            return res.status(400).send({ status: false, msg: "ISBN is required" });
        }

        //Validate category
        if (!validation.isValid(category)) {
            return res.status(400).send({ status: false, msg: "category is required" });
        }

        
        //Validate subcategory
        if (!validation.isValid(subcategory)) {
            return res.status(400).send({ status: false, msg: "subcategory is required" });
        }
        //Validate releasedAt
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
            title,
            excerpt,
            userId,
            ISBN,
            category,
            subcategory,
            reviews,
           // releasedAt: releasedAt ? releasedAt: "releasedAt is required",
        };

        let savedBook = await bookModel.create(bookData);
        return res.status(201).send({status: true, msg: "book created", data: savedBook})
    }
    catch (e) {
        res.status(500).send({ status: false, msg: e.message })
    }
}
// Get books by query
const getBooks = async function(req,res){
    try{
        const userQuery = req.query
        // If no query find all active blogs
        const filter = {isDeleted:false}
        const {userId,category,subcategory} =userQuery
        
        // Validation of user id and adding to query
        if(userId){
            if(!ObjectId.isValid(userId)) return res.status(400).send({status:false, message:"Invalid UserId."})
            if(ObjectId.isValid(userId)) {
                filter["userId"] =userId
            }
        }
        // If category is present on query
        if(validation.isValid(category)){
            filter["category"] = category.trim()


}
    module.exports.createBook = createBook

        }

        // If Subcategory is present in query
        if(validation.isValid(subcategory)){
            const subCategoryArray = subcategory.trim().split(',').map(s=>s.trim())
            filter['subcategory'] = {$all:subCategoryArray}
        }

        const findBooks = await bookModel.find(filter).select({title:1,excerpt:1,userId:1,category:1,reviews:1,releasedAt:1})
        if(Array.isArray(findBooks) && findBooks.length ===0) return res.status(404).send({status:false, message:"No Book(s) found."})
        
        //Sort Alphabetically by title
        const sortedBooks = findBooks.sort((a,b)=>a.title.localeCompare(b.title))
        res.status(200).send({status:true, message: 'Books list', data: sortedBooks})
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
      }
}

module.exports.createBook = createBook
module.exports.getBooks =getBooks
