 //email validation
const isValidEmail = function (email) {
    const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
    return emailRegex.test(email)
}
//password validation
const isValidPassword = function (password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,15}$/
    return passwordRegex.test(password)
}
//name validation
const isValidName = function(name){
    const nameRegex = /^[a-zA-Z ]{2,30}$/
    return nameRegex.test(name)
}
// mobile validation
const isValidMobile = function(mobile){
    const mobileRegex = /^[6-9]\d{9}$/
    return mobileRegex.test(mobile)
}
//title validation
const validTitle = function (title) {                                                            
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}
//value validation
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}
//request validation
const isValidRequest = function (request) {
    return (Object.keys(request).length > 0)
}

module.exports ={isValidEmail,isValidPassword,isValid,isValidName,validTitle,isValidMobile,isValidRequest}