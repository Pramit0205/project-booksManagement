const userModel = require("../Models/userModel")
const validation = require("../Middlewares/validation")
const jwt = require("jsonwebtoken")

// Create User
//=================================================== create User Api ========================================================================
let userData = async (req, res) => {
  try {
    let { title, name, phone, email, password, address } = req.body;
    //===================================== if Empty Body ================================================================
    if (Object.keys(req.body).length == 0)
      return res
        .status(400)
        .send({ status: false, msg: "plz enter User data" });
    //========================================== if Title missing & not Valid=======================================================        
    if (!title)
      return res.status(400).send({ status: false, msg: "title missing" });
    if (!validation.isValidTitle(title))
      return res
        .status(400)
        .send({ status: false, message: "Not a valid Title" });
    //====================================================== If Name Missing and Not Valid =========================================
    if (!validation.isValid(name))
      return res.status(400).send({ status: false, msg: "Name is missing" });

    if (!validation.isValidName(name))
      return res
        .status(400)
        .send({ status: false, message: "Not a valid Name" });
    //=================================================== If PhONE Missing and Not Valid and ALready Exists =======================================
    if (!phone)
      return res
        .status(400)
        .send({ status: false, msg: "Phone Number missing" });
    if (phone) {
      let validPhone = await userModel.findOne({ phone: phone });
      if (validPhone) {
        return res
          .status(400)
          .send({ status: false, msg: "Phone Number already exists" });
      }
    }
    if (!validation.isValidPhone(phone))
      return res
        .status(400)
        .send({ status: false, message: "Not a valid Phone Number" });
    //========================================================== If Email Missing and Not Valid and ALready exists ==================================
    if (!email)
      return res.status(400).send({ status: false, msg: "email missing" });
    if (email) {
      let validEmail = await userModel.findOne({ email: email });
      if (validEmail) {
        return res
          .status(400)
          .send({ status: false, msg: "emailId already exists" });
      }
    }
    if (!validation.isValidEmail(email))
      return res
        .status(400)
        .send({ status: false, message: "Not a valid emailId" });
    //=============================================== IF Password Missing and Not Valid  ================================================       
    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "password is required" });
    }

    if (!validation.isValidPassword(password))
      return res
        .status(400)
.send({ status: false, message: "Your password must contain atleast one number,uppercase,lowercase and special character[ @ $ ! % * ? & ] and length should be min of 8-15 charachaters" });
// =========================================================== Address Validation =============================================
let pinReg = /^[0-9]{6}$/
    //If address is present
    if (address) {
      //In address the street is present
      if (address.street) {
        if (!validation.isValid(address.street)) return res.status(400).send({ status: false, message: "Please Enter street" });
      }
      //In address the city is present
      if (address.city) {
        if (!validation.isValid(address.city)) return res.status(400).send({ status: false, message: "Please Enter city" });
      }
      //In address the pincode is present
      if (address.pincode) {
        if (!validation.isValid(address.pincode)) return res.status(400).send({ status: false, message: "Please Enter pincode" });
        if (!pinReg.test(address.pincode)) return res.status(400).send({ status: false, message: "not a valid pin code" });

      }
    }
    //   if (Object.keys(address).length == 0) return res.status(400).send({ status: false, msg: "Address Field cannot Be empty" });
    //   if (typeof address !== "Object") return res.status(400).send({ status: false, msg: "Address must be an Object" })
    // }


    //================================================================ Data creation ============================================
    const result = await userModel.create({ title, name, phone, email, password, address });
    res.status(201).send({ status: true, data: result });
  } 
  catch (err) {
    return res.status(500).send({ statuS: false, msg: err.message });
  }
};


//====================================================================Login User===================================================================
const loginUser = async function (req, res) {
  try {
    const credentials = req.body
// Validation of input
    if (!validation.isValidRequest(credentials)) return res.status(400).send({ status: false, message: "Please enter the required credentials." })
    const { email, password } = credentials

    // Input Value Validation
    if (!validation.isValid(email)) return res.status(400).send({ status: false, message: "Please enter the emailId" })
    if (!validation.isValid(password)) return res.status(400).send({ status: false, message: "Please enter the password" })

    // Validation email & password 
    if (!validation.isValidEmail(email)) return res.status(400).send({ status: false, message: "Not a valid emailId" })
    if (!validation.isValidPassword(password)) return res.status(400).send({ status: false, message: "Not a valid password" })

    // Finding the user
    const getUser = await userModel.findOne({ email })
    if (!getUser) return res.status(404).send({ status: false, message: "User email id not found." })

    // Checking the password
    const actualPassWord = getUser.password
    if (password!==actualPassWord) return res.status(401).send({ status: false, message: "Incorrect password" })

    // Token Generation
    const token = await jwt.sign({
      userId: getUser._id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 20 * 60 * 60
    }, "UrAnIuM#GrOuP@32");

    // Set header
    res.setHeader("x-api-key", token);
    res.status(200).send({ status: true, message: "Author login successful", data: { token } })
}
 catch (err) {
    res.status(500).send({ status: false, message: "Error", error: err.message })
  }
}


module.exports.userData = userData;
module.exports.loginUser = loginUser

