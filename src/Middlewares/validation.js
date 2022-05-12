//email validation
const isValidEmail = function (email) {
    const emailRegex = /^([A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1}[A-Za-z.]{2,6})+$/
    return emailRegex.test(email)
}
//password validation
const isValidPassword = function (password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/
    return passwordRegex.test(password)
}
//name validation
const isValidName = function (name) {
    const nameRegex = /^[a-zA-Z ]{2,30}$/
    return nameRegex.test(name)
}
// mobile validation
const isValidPhone = function (Phone) {
    const mobileRegex = /^[6-9]\d{9}$/
    return mobileRegex.test(Phone)
}
//ISBN Validation
const isValidISBN =function (ISBN){
    const ISBNRegex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
    return ISBNRegex.test(ISBN)
}
//Date Validation
const isValidDate =function(date){
    const dateRegex = /^\d{4}-(02-(0[1-9]|[12][0-9])|(0[469]|11)-(0[1-9]|[12][0-9]|30)|(0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))$/
    return dateRegex.test(date)
}
//Script validation
const isValidScripts = function(script){
    const scriptRegex =/^[a-zA-Z0-9 '"$@,.;:?&!_-]{2,}$/
    return scriptRegex.test(script)
}
//title validation
const isValidTitle = function (title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}
//value validation
const isValid= function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}
//Rating validation
const isValidRating = function (rating) {
    const mobileRegex = /^[1-5]\d{0}$/
    return mobileRegex.test(rating)
}


//request validation
const isValidRequest = function (request) {
    return (Object.keys(request).length > 0)
}

module.exports = { isValidEmail, isValidPassword, isValid, isValidName, isValidTitle, isValidPhone, isValidRequest,isValidRating, isValidISBN, isValidDate, isValidScripts }