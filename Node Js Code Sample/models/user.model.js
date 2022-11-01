const dbConnect = require('../services/dbConnect');
const { hash } = require('../helper/helper');
const Common = require('../models/common.model');

const User = function (user) {
    this.email = user.email;
    this.password = user.password;
    this.ip_address = user.ip_address;
    // fields removed
    this.is_email_verified = 0;
    this.is_mobile_verified = 0;
    this.status = 1;
    this.user_type = user.user_type;
    this.timezone_id = user.timezone_id;
    this.created_by = user.created_by;
    this.created_on = new Date;
    this.updated_on = new Date;
}

User.validateLogin = function (loginUser, result) {
    let data = {
        // userType: loginUser.userType,
        email: loginUser.email,
        password: loginUser.password,
        deviceType: loginUser.deviceType,
        deviceToken: loginUser.deviceToken
    };
    sql.select(['id', 'email', 'status', 'user_type'])
        .where({ 'email': data.email, 'password': helper.encrypt(data.password), 'status !=': 3, 'status !=': 2 })
        .get('users', async (err, res) => {
            if (err)
                result(err, null);
            else {
                if (res != null && res.length > 0) {
                    res = res[0];
                    let dataArr = {
                        insertId: res.id,
                        deviceType: data.deviceType,
                        userType: res.user_type,
                        deviceToken: data.deviceToken,
                    }
                    await this.updateLastLogin(res.id)
                    this.updateUserDevice(dataArr, (err2, res2) => {
                        if (err2) {
                            result(err2, null);
                        }
                        else {
                            if (dataArr.userType == 1) {
                                User.getTeamMembersDetails({ 'email': data.email, 'user_type': dataArr.userType }, (err3, res3) => {
                                    if (err3)
                                        result(err3, null);
                                    else
                                        result(null, res3[0]);
                                })
                            } else {
                                User.getCandidateDetails({ 'email': data.email, 'user_type': dataArr.userType, 'user_id': res.id }, (err3, res3) => {
                                    if (err3)
                                        result(err3, null);
                                    else
                                        result(null, res3[0]);
                                })
                            }
                        }
                    });
                } else {
                    result(null, 0);
                }
            }
        });
}

User.updateLastLogin = function (userId) {
    return new Promise(function (resolve, reject) {
        let data1 = {
            last_login: moment().format('YYYY-MM-DD HH:mm:ss')
        };
        let where = '(id = ' + userId + ')';
        let table = "users";
        Common.updateRecord(table, data1, where, (err2, res2) => {
            if (err2)
                resolve("failed to update last login")
            else {
                resolve('updated last login')
            }
        });
    });
}

User.updateUserDevice = function (dataArr, result) {
    let data = {
        'insertId': (typeof dataArr.insertId !== "undefined" ? dataArr.insertId : null),
        'usertype': (typeof dataArr.userType !== "undefined" ? dataArr.userType : null),
        'deviceType': (typeof dataArr.deviceType !== "undefined" ? dataArr.deviceType : null),
        'deviceToken': (typeof dataArr.deviceToken !== "undefined" ? dataArr.deviceToken : null),
    }
    sql.get_where('userdevice', { "userid": data.insertId, "devicetype": data.deviceType, "token": data.deviceToken, "usertype": data.usertype }, (err, res) => {
        if (err)
            result(err, null);
        else {
            if (res.length == 0) {
                sql.insert('userdevice', {
                    "userid": data.insertId, "devicetype": data.deviceType, "token": data.deviceToken, "usertype": data.usertype,
                    "created": moment().format('YYYY-MM-DD HH:mm:ss'), "updated": moment().format('YYYY-MM-DD HH:mm:ss')
                }, (err2, res2) => {
                    if (err2)
                        result(err2, null);
                    else {
                        if (res2.affectedRows > 0) {
                            result(null, 1);
                        } else
                            result(msgHelper.msg('MSG002'), null);
                    }
                });
            }
            else {
                result(null, 1);
            }
        }
    })
}

User.getTeamMembersDetails = function (where, result) {

    const select = [
        `u.id as id`,
        `tm.id as teamMemberID`,
        `tm.profile_image as profileImage`,
        `CONCAT(tm.first_name,' ',tm.last_name) as fullName`,
        `u.email as email`,
        `u.password as password`,
        `u.ip_address as ipAddress`,
        `u.is_email_verified as isEmailVerified`,
        `u.is_mobile_verified as isMobileVerified`,
        `u.user_type as userType`,
        `u.timezone_id as timeZone`,
        `u.created_by as createdBy`,
        `u.updated_by as updatedBy`,
        `u.created_on as createdOn`,
        `u.updated_on as updatedOn`,
        `r.id as roleID`,
        `r.name as role`,
        `r.roleKey as roleKey`,
        `u.status as userStatus`,
        `tmr.status as teamMemberRoleStatus`,
        `tmr.privilege as privilege`,
        `r.status as roleStatus`
    ]

    sql.select(select).from('users u')
        .join('team_members tm', 'u.id = tm.user_id', 'left')
        .join('team_member_roles tmr', 'u.id = tmr.user_id', 'left')
        .join('roles r', 'tmr.role_id = r.id', 'left')
        .where("(u.status != 2 AND u.status != 3)")
        .where(where)
        .get((err, res) => {
            if (err) result(err, null)

            return result(null, res)
        })
}

User.getCandidateDetails = function (where, result) {

    const select = [
        `u.id as id`,
        `ca.id as candidateID`,
        `ca.profile_image as profileImage`,
        `CONCAT(ca.first_name,' ',ca.last_name) as fullName`,
        `u.email as email`,
        `u.password as password`,
        `u.ip_address as ipAddress`,
        `u.is_email_verified as isEmailVerified`,
        `u.is_mobile_verified as isMobileVerified`,
        `u.user_type as userType`,
        `u.timezone_id as timeZone`,
        `u.created_by as createdBy`,
        `u.updated_by as updatedBy`,
        `u.created_on as createdOn`,
        `u.updated_on as updatedOn`,
        `r.id as roleID`,
        `r.name as role`,
        `r.roleKey as roleKey`,
        `u.status as userStatus`,
        `r.status as roleStatus`,
        `ca.is_profile_locked as profileLocked`,
        `(SELECT count(id) FROM candidates_temp WHERE user_id = ${where.user_id}) as tempCount`
    ]

    sql.select(select).from('users u')
        .join('candidates ca', 'u.id = ca.user_id', 'left')
        .join('roles r', 'ca.role_id = r.id', 'left')
        .where("(u.status != 2 AND u.status != 3)")
        .where(where)
        .get((err, res) => {
            if (err) result(err, null)

            return result(null, res)
        })
}

User.create = async function (newUser, result) {
    await hash(newUser.password)
        .then((hashed) => {
            const nUser = {
                ...newUser,
                is_email_verified: 1,
                is_mobile_verified: 1,
                password: hashed
            }

            dbConnect.query('INSERT INTO users SET ?', nUser, (err, res) => {
                if (err) throw err;

                result(null, res.insertId)
            });
        })
}

User.findById = function (id, result) {
    dbConnect.query('SELECT * FROM users where id = ? ', id, (err, res) => {
        if (err) throw err;

        result(null, res)
    });
}

User.findByEmail = function (email, result) {

    const select = [
        `u.id as id`,
        `CONCAT(tm.first_name,' ',tm.last_name) as fullName`,
        `u.email as email`,
        `u.password as password`,
        `u.ip_address as ipAddress`,
        `u.is_email_verified as isEmailVerified`,
        `u.is_mobile_verified as isMobileVerified`,
        `u.user_type as userType`,
        `u.timezone_id as timeZone`,
        `u.created_by as createdBy`,
        `u.updated_by as updatedBy`,
        `u.created_on as createdOn`,
        `u.updated_on as updatedOn`,
        `r.name as role`,
        `u.status as userStatus`,
        `tmr.status as teamMemberRoleStatus`,
        `r.status as roleStatus`
    ]

    sql.select(select).from('users u')
        .join('team_members tm', 'u.id = tm.user_id', 'left')
        .join('team_member_roles tmr', 'u.id = tmr.user_id', 'left')
        .join('roles r', 'tmr.role_id = r.id', 'left')
        .where({ 'u.email': email, 'u.status !=': 3 })
        .get((err, res) => {
            if (err) throw err;

            return result(null, res)
        })
}

User.findAll = function (result) {
    dbConnect.query('SELECT * FROM users', (err, res) => {
        if (err) throw err;

        result(null, res);
    });
}

User.update = function (id, user, result) {
    dbConnect.query('UPDATE users SET email=?, password=?', [
        user.email,
        user.password
    ], (err, res) => {
        if (err) throw err;

        result(null, res);
    });
}

User.updatePassword = function (user, result) {
    dbConnect.query('UPDATE users SET password=? where email=?', [
        user.password,
        user.email
    ], (err, res) => {
        if (err) throw err;

        result(null, res);
    });
}

User.validateCandidate = async function (data) {
    return new Promise((resolve, reject) => {
        try {
            if (data.userType === 1) {
                resolve(true)
            } else {
                let select = ['roles.roleKey as role', 'candidates.profile_status']
                sql.select(select)
                sql.where({ 'users.email': data.email, 'users.password': helper.encrypt(data.password), 'users.status !=': 3, 'users.status !=': 2 })
                sql.join(`candidates`, `candidates.user_id = users.id`, 'left')
                sql.join('roles', 'roles.id = candidates.role_id', 'left')
                sql.get('users', (err, res) => {
                    if (err) {
                        resolve(undefined)
                    } else {
                        if (res && res.length > 0) {
                            let newRes = res[0]
                            if (newRes.role === 'contractor') {

                                if (newRes.profile_status === 7) resolve(false)
                                else resolve(true)

                            } else if(newRes.role === 'candidate') {

                                if (newRes.profile_status === 4) resolve(false)
                                else resolve(true)

                            } else resolve(true)
                        } else resolve(undefined)
                    }
                })
            }
        } catch (error) {
            resolve(false)
        }
    })

}
module.exports = User;

