/* use for authorization token    */
const CONFIG = require('../config/config')
var crypto = require('crypto'),
    algorithm = 'xxs-xxx-cxx',
    password = 'xxxxxxxxx'
let key = crypto.createHash('sha256').update(String(password)).digest('base64').substr(0, 32)
const iv = Buffer.alloc(16, 0)
const salt = crypto.randomBytes(16).toString("hex")
const jwtSecret = process.env.JWT_SECRET_TOKEN
const CryptJS = require('crypto-js')

/* check string and array is empty or not    */
module.exports.isEmpty = function (obj) {
    switch (obj) {
        case "":
        case "undefined":
        case 0:
        case "0":
        case null:
            return true
        case false:
        default:
            if (typeof (obj) == "undefined") {
                return true
            } else if ((obj.length === 0)) {
                return true
            } else {
                return false
            }
    }
}
/* check object is empty or not    */
module.exports.isEmptyObj = function (obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            return false
        }
    }
    return true
}

/* check if property exists on object */
module.exports.propertyExists = (obj, property) => {
    return obj.hasOwnProperty(property)
}

/* get current date and time    */
module.exports.getCurrentDateTime = function () {
    return moment().format('YYYY-MM-DD HH:mm:ss')
}

/* get current date   */
module.exports.getCurrentDate = function () {
    return moment().format('YYYY-MM-DD')
}

/* get current time   */
module.exports.getCurrentTime = function () {
    return moment().format('HH:mm:ss')
}


/* generate encrypt password   */
module.exports.encrypt = function (text) {
    var cipher = crypto.createCipheriv(algorithm, key, iv);
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

/* generate decrypt password   */
module.exports.decrypt = function (text) {
    var decipher = crypto.createDecipheriv(algorithm, key, iv)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

/**
 * JWT Generator
 * @param email
 * @returns {Promise<*>}
 */
module.exports.generateJWT = async (email) => {
    return jwt.sign({ email }, jwtSecret, { expiresIn: '24h' });
}

/**
 * JWT Validator
 * @param token
 * @returns {Promise<*>}
 */
module.exports.authenticateToken = async (token) => {
    return jwt.verify(token, jwtSecret);
}

module.exports.encode64 = (rawStr) => {
    const wordArray = CryptJS.enc.Utf8.parse(rawStr)
    return CryptJS.enc.Base64.stringify(wordArray)
}

module.exports.decode64 = (b64) => {
    const parseWordArray = CryptJS.enc.Base64.parse(b64)
    return parseWordArray.toString(CryptJS.enc.Utf8)
}

module.exports.encodeUserDB = (rawStr, key) => {
    const userInfo = rawStr + ':' + key
    return this.encode64(userInfo)
}

module.exports.validateEmail = (email) => {
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return emailRegexp.test(email)
}

module.exports.validatePassword = (password) => {
    const passwordRegexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/
    return passwordRegexp.test(password)
}

/*
 Description : For authorization checking of user as per the module.
 Parameter used : None
 */
module.exports.verifyToken = function (req, res, next) {
    let token = req.headers['authorization'];
    token = JSON.parse(token.replace('Bearer ', ''))
    if (typeof token !== 'undefined') {
        jwt.verify(token, jwtSecret, { algorithm: 'HS256', ignoreExpiration: true }, (err, authData) => {
            if (err) {
                res.status(401).json({ "status": false, "message": "Authorization token has been expired! Please login again.", "error": [] });
            } else {
                req.authData = authData;
                next();
            }
        })
    } else {
        res.json({ "status": false, "message": "Missing authorization token!", "error": [] });
    }
}

module.exports.uploadImageS3Bucket = function (filesData, filePath, mimeType, result) {
    // var arr = new Array();
    const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: filePath,
        Body: filesData,
        ContentType: mimeType,
        ACL: FILE_PERMISSION
    };
    s3.upload(uploadParams, function (err, data) {
        if (err) {
            result(err, null);
        } if (data) {
            if (result != undefined) {
                result(null, { "status": true, "image": data.Location });
            }
        }
    });

}

module.exports.getRandomCode = function (length, value = 2) {
    return crypto.randomBytes(length).toString("hex");
}

/* get company status   */
module.exports.getXxxxxxxStatus = function () {
    var status = [
        {
            "id": 1,
            "label": "Active"
        },
        {
            "id": 2,
            "label": "Inactive"
        },
        {
            "id": 3,
            "label": "Xxxx"
        },
    ]
    return status
}

/* get contact type   */
module.exports.getXxxxxxxType = function () {
    var types = [
        {
            "id": 1,
            "label": "Primary"
        },
        {
            "id": 2,
            "label": "Secondary"
        }
    ]
    return types
}

/* get random password   */
module.exports.getRandomPassword = function (length = 8) {

    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;

}

module.exports.isEmptyField = function (obj) {
    if (obj === '') return true
    if (typeof obj === 'number') {
        if (String(obj) === '0') return true
    }
    if (obj === undefined) return true
    if (typeof obj === 'undefined') return true
    if (obj === null) return true
    if (typeof obj === 'array') {
        if (obj.length === 0) return true
    }
    return false
}

// Get getFormattedMobileNumber
module.exports.getFormattedMobileNumber = function (n) {
    if (n !== null) {
        let num = ''
        for (let index = 0; index < n.length; index++) {
            let n1 = n[index]
            n1 = (n1 == ' ') ? '' : n1
            num += !isNaN(n1) ? n1 : ''
        }
        if (num.length > 10) {
            num = num.substring(num.length - 10)
        }
        return num
    }
    return n;
}

module.exports.downloadImageFromS3 = function (filePath, result) {
    let newFilePath = filePath.replace('https://xxxxxxxxxx.s3.amazonaws.com/','')
    const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: newFilePath,
        Expires: (60 * 1000),
    };
    s3.getSignedUrl('getObject', uploadParams, (err, data) => {
        if (err) {
            result(err, null);
        } else {
            result(null, data);
        }
    });
}