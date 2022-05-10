
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
        }*/
       
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
module.exports.createBook = createBook