const { msg } = require('../../helper/msg');
const helper = require('../../helper/helper');
const User = require('../../models/user.model');
const TeamMember = require('../../models/member.model')
const Common = require('../../models/common.model')
const Mailer = require('../../helper/mailersend');

exports.create = function (req, res) {
    const newUser = new User(req.body);

    const {
        firstName,
        lastName
    } = req.body

    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send({ error: true, message: msg('MSG001') });
    }

    User.findByEmail(req.body.email, async (err1, user1) => {
        if (err1) {
            res.status(500).send({ error: true, message: msg('MSG002') });
            throw err;
        }

        if (user1.length === 0) {
            User.create(newUser, (err, user) => {
                if (err) {
                    console.log('err User create', err)
                    res.status(500).send({ error: true, message: msg('MSG002') });
                    throw err;
                }

                const newTeamMember = {
                    first_name: firstName,
                    last_name: lastName,
                    user_id: user
                }

                TeamMember.create(newTeamMember, (err, team_member) => {
                    if (err) {
                        res.status(500).send({ error: true, message: msg('MSG002') });
                        throw err;
                    }
                })

                return res.json({
                    success: true,
                    message: msg('MSG004'),
                    data: user
                })
            });
        } else {
            return res.status(400).send({ error: true, message: msg('MSG009') });
        }
    })
}

exports.forgotPassword = (req, res) => {
    try {
        const {
            email
        } = req.body

        // Verify request
        if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
            return res.status(400).send({ error: true, message: msg('MSG001') });
        }

        // Check user exists
        User.findByEmail(email, async (err1, user1) => {
            if (err1) {
                res.status(500).send({ error: true, message: msg('MSG002') });
                throw err;
            }

            if (user1.length > 0) {

                // Creating a reset token
                const token = helper.getRandomPassword(40)

                UserResetPassword.createNewResetLink({ email, token }, (err, cUser) => {
                    if (err) {
                        console.log('Error create reset link', err)
                        res.status(500).send({ error: true, message: msg('MSG002') });
                        throw err;
                    }

                    // Send Mail to reset Password 
                    const mailerSendData = {
                        name: `${email}`,
                        email: email.trim(),
                        url: process.env.XXXXXXXXXXXXX + "xxxxx-xxxxxx?xxxxxx=" + token
                    }
                    Mailer.sendResetPasswordMail(mailerSendData);

                    res.status(200).send({
                        message: msg('MSG018'),
                        success: true,
                    })
                });

            } else {
                return res.status(400).send({ error: true, message: msg('MSG023') });
            }
        })


    } catch (error) {
        res.status(500).send({
            error: true, data: error, message: msg('MSG025')
        })
    }
}


exports.resetPassword = (req, res) => {
    try {

        let {
            token,
            password
        } = req.body

        // Verify request
        if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
            return res.status(400).send({ error: true, message: msg('MSG001') });
        }

        UserResetPassword.findByToken(token, async (err1, user1) => {
            if (err1) {
                res.status(500).send({ error: true, message: msg('MSG002') });
                throw err;
            }

            // Token is valid
            if (user1.length > 0) {

                // WIP
                password = helper.encrypt(password)

                User.updatePassword({ password, email: user1[0].email }, (err, cUser) => {
                    if (err) {
                        console.log('Error create reset link', err)
                        res.status(500).send({ error: true, message: msg('MSG002') });
                        throw err;
                    }

                    // Send Mail to reset Password 
                    const mailerSendData = {
                        name: `${user1[0].email}`,
                        email: user1[0].email,
                        url: process.env.CREWHUB_URL + "login"
                    }
                    Mailer.sendPasswordChangedConfirmation(mailerSendData);

                    UserResetPassword.removeToken(token)

                    res.status(200).send({
                        message: msg('MSG017'),
                        success: true
                    })
                });

            }

            else {
                return res.status(400).send({ error: true, message: msg('MSG019') });
            }
        })

    } catch (error) {
        // console.log({error})
        res.status(500).send({
            error: true, message: msg('MSG026')
        })
    }
}

exports.changePassword = (req, res) => {
    let { userID, userRole } = req.authData.userArr;
    // console.log(req.authData.userArr)
    let formData = req.body;

    let requestData = {
        "new_password": "required|string",
        "user_id": "required|integer",
        "password": "required|string",
    };
    var validateData = new node_validator(formData, requestData);
    validateData.check().then((matched) => {
        if (!matched) {
            res.status(200).json({
                "status": false,
                "message": msg('MSG001'),
                "error": validateData.errors
            });
        } else {
            User.findById(formData.user_id, async (err2, result2) => {
                if (err2)
                    res.status(200).json({
                        "status": false,
                        "message": msg('MSG002'),
                        "error": err2
                    });
                else {
                    if (result2.length > 0) {
                        let currentTime = moment().format('YYYY-MM-DD HH:MM:SS')
                        let user = result2[0];
                        let getUserDetails = await getUserDetailsByUserIdAndUserType(user.id, user.user_type);
                        let userName = ''
                        if (getUserDetails) {
                            userName = getUserDetails.firstName + ' ' + (getUserDetails.lastName ? getUserDetails.lastName : '');
                        } else {
                            userName = user.email
                        }
                        if (helper.encrypt(formData.password) === user.password) {
                            let data = {
                                "password": helper.encrypt(formData.new_password),
                                'updated_by': userID,
                                'updated_on': currentTime
                            };
                            let where = '(id = ' + formData.user_id + ')';
                            let table = "users";
                            Common.updateRecord(table, data, where, (err3, res3) => {
                                if (err3)
                                    res.status(200).json({
                                        "status": false,
                                        "message": msg('MSG002'),
                                        "error": err3
                                    });
                                else {
                                    // Send Mail to reset Password 
                                    const mailerSendData = {
                                        name: userName,
                                        email: user.email,
                                        url: process.env.CREWHUB_URL + "login"
                                    }
                                    Mailer.sendPasswordChangedConfirmation(mailerSendData);

                                    res.status(200).json({ "status": true, "message": "Paasword changed successfully." });
                                }
                            });
                        } else {
                            res.status(200).json({ "status": false, "message": "Old password not matched." })
                        }

                    }
                }
            })
        }
    })
}

exports.changePasswordFromAdmin = (req, res) => {
    let { userID, userRole } = req.authData.userArr
    let formData = req.body
    let schema = {
        'new_password': "required",
        "user_id": "required"
    }
    // console.log(formData)
    var validateData = new node_validator(formData, schema)
    validateData.check().then((matched) => {
        if (!matched) {
            res.status(200).json({
                status: false,
                message: msg('MSG001'),
                error: validateData.errors
            })
        } else {
            User.findById(formData.user_id, async (err2, result2) => {
                if (err2)
                    res.status(200).json({
                        "status": false,
                        "message": msg('MSG002'),
                        "error": err2
                    });
                else {
                    let user = result2[0];
                    let getUserDetails = await getUserDetailsByUserIdAndUserType(user.id, user.user_type);
                    let userName = ''
                    if (getUserDetails) {
                        userName = getUserDetails.firstName + ' ' + (getUserDetails.lastName ? getUserDetails.lastName : '');
                    } else {
                        userName = user.email
                    }
                    let currentTime = moment().format('YYYY-MM-DD HH:mm:ss')
                    let data = {
                        "password": helper.encrypt(formData.new_password),
                        'updated_by': userID,
                        'updated_on': currentTime
                    };
                    let where = '(id = ' + formData.user_id + ')';
                    let table = "users";
                    Common.updateRecord(table, data, where, (err3, res3) => {
                        if (err3)
                            res.status(200).json({
                                "status": false,
                                "message": msg('MSG002'),
                                "error": err3
                            });
                        else {
                            const mailerSendData = {
                                name: userName,
                                email: user.email,
                                url: process.env.CREWHUB_URL + "login",
                                password: formData.new_password
                            }
                            Mailer.passwordChangeInformation(mailerSendData);
                            res.status(200).json({ "status": true, "message": "Password changed successfully" });
                        }
                    });
                }
            })

        }
    })

}

const getUserDetailsByUserIdAndUserType = (userId, userType) => {
    return new Promise((resolve, reject) => {
        let table = ''
        if (userType === 1) {
            table = 'xxxxxxxxxxxxxxx'
        } else if (userType === 2) {
            table = 'candidates'
        }
        sql.select(['first_name as firstName', 'last_name as lastName'])
        sql.where(`user_id = ${userId}`)
        sql.get(table, (err, results) => {
            if (err) {
                resolve(false)
            } else {
                let result = results[0]
                resolve(result)
            }
        })
        
    })
}