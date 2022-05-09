

const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;                                 //email validation
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,15}$/    //password validation                                             

const validTitle = function (title) {                                                             //enum validation
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidRequest = function (request) {
    return (Object.keys(request).length > 0)
}

module.exports