const { msg } = require('../../helper/msg');
const { verify, generateJWT, authenticateToken } = require('../../helper/helper');
const User = require('../../models/user.model');
const jwtSecret = process.env.JWT_SECRET_TOKEN
module.exports.login = function (req, res) {
    let loginData = req.body;
    let loginSchema = {
        userType: 'required',
        email: 'required|email',
        password: 'required|minLength:6',
        deviceType: "required|between:1,3",
        deviceToken: "required"
    };
    var validateData = new node_validator(loginData, loginSchema);
    validateData.check().then( async (matched) => {
        if (!matched) {
            res.status(200).json({
                "status": false,
                "message": msgHelper.msg('MSG001'),
                "error": validateData.errors
            });
        } else {
            const isCandidateActive = await User.validateCandidate(loginData);
            if (isCandidateActive === false && isCandidateActive !== undefined) {
                res.status(200).json({
                    status: false,
                    "message": msgHelper.msg('MSG048')
                })
            } else {
                User.validateLogin(loginData, (err, result) => {
                    if (err)
                        res.status(200).json({ "status": false, "message": msgHelper.msg('MSG002'), "error": err });
    
                    else if (result != null && result.id != null) {
    
                        if (result.userType == 1) {
                            if (result.privilege == 1) {
                                result.role = "XXxxx  xx"
                                result.roleKey = "cxxxx-admin"
                            } else if (result.privilege == 2) {
                                if (result.role !== null) {
                                    result.roleKey = result.roleKey + '-admin'
                                    result.role = result.role + 'Admin'
                                } else {
                                    result.roleKey = 'admin'
                                    result.role = 'Admin'
                                }
                            } else {
                                if (result.role !== null) {
                                    result.role = 'User'
                                } else {
                                    result.role = result.role
                                }
                            }
                        } else {
                            result.role = result.role
                        }
    
                        let userArr = {
                            userID: result.id,
                            userType: result.userType,
                            userRole: result.role,
                            userRoleID: result.roleID,
                            userPrivilige: (result.privilege) ? result.privilege : null,
                            staffOrCandidateID: result.teamMemberID,
                        };
    
                        jwt.sign({ userArr }, jwtSecret, { expiresIn: '3d' }, (err1, token) => {
                            if (err1)
                                res.status(200).json({ "status": false, "message": msgHelper.msg('MSG003'), "error": err1 });
                            else {
                                res.status(200).json({
                                    "status": true,
                                    "message": msgHelper.msg('MSG005'),
                                    "data": { "token": token, "userInfo": result }
                                });
                            }
                        });
                    } else {
                        res.status(200).json({ "status": false, "message": "Invalid Email or Password!" });
                    }
                });
            }
            
        }
    });
}
