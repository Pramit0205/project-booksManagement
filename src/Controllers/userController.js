const userModel = require("../Models/userModel")
const validation = require("../Middlewares/validation")
const jwt = require("jsonwebtoken")

// Create User


//Login User
const loginUser = async function (req, res) {
    try {
        const credentials = req.body
        
        // Validation of input
        if (!validation.isValidRequest(credentials)) return res.status(400).send({ status: false, message: "Please enter the required credentials." })
        const { email, password } = credentials
       
        // Input Value Validation
        if (!validation.isValid(email)) return res.status(400).send({ status: false, message: "Please enter the emailId" })
        if (!validation.isValid(password))return res.status(400).send({ status: false, message: "Please enter the password" })
        
        // Validation email & password 
        if (!validation.isValidEmail(email)) return res.status(400).send({ status: false, message: "Not a valid emailId" })
        if (!validation.isValidPassword(password))return res.status(400).send({ status: false, message: "Not a valid password" })

        // Finding the user
        const getUser = await userModel.findOne({ email })
        if (!getUser) return res.status(404).send({ status: false, message: "User email id doesn't exit." })
        
        // Checking  the password
        const matchPassword = await userModel.findOne({password})
        if(!matchPassword) return res.status(401).send({ status: false, message: "Incorrect password"})
       
        // Token Generation
        const token = await jwt.sign({
            userId: getUser._id,
            iat: Math.floor(Date.now()/1000),
            exp: Math.floor(Date.now()/1000)+ 20*60*60
        }, "UrAnIuM#GrOuP@32");
        
        // Set header
        res.setHeader("x-api-key", token);
        res.status(200).send({ status: true, message: "Author login successful", data: { token } })
    } catch (err) {
        res.status(500).send({ status: false, message: "Error", error: err.message })
    }
}

module.exports.loginUser = loginUser