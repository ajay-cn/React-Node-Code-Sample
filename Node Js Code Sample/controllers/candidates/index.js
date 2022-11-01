const { msg } = require('../../helper/msg')
const Candidate = require('../../models/candidate.model')
const User = require('../../models/user.model');
const AddressDetail = require('../../models/addressDetail.model');
const TeamMemberRole = require('../../models/teamMemberRole.model');
const Mailer = require('../../helper/mailersend');
const Portal = require('../../models/portel.model');
const Role = require('../../models/role.model');
const Member = require('../../models/member.model');
const Common = require('../../models/common.model');
const { isEmpty } = require('../../helper/helper.js');
const Department = require('../../models/department.model');

const UserResetPassword = require('../../models/userResetPassword.model');
const mysql = require('../../services/dbConnect');
const { getToolsByUserId } = require('../../models/portel.model');

const newPassword = helper.getRandomPassword()

const updateCandidateSourcerTeamMap = (userId, sourcer) => {
    return new Promise(function (resolve, reject) {
        let data1 = {
            candidate_user_id: userId,
            team_user_id: sourcer,
            type: 'sourcer',
        };
        let where = { candidate_user_id: userId, type: 'sourcer' }
        let table = "candidate_team_map_ids";
        Common.addOrUpdateRecords(table, data1, where, (err2, res2) => {
            if (err2)
                resolve("failed to update sourcer")
            else {
                resolve('Sourcer updated')
            }
        });
    });
}

module.exports.removeCandidateJobHistoryByID = function (req, res) {
    let formData = req.body
    let candidateSchema = {
        "id": "required"
    }
    var validateData = new node_validator(formData, candidateSchema);
    validateData.check().then((matched) => {
        if (!matched) {
            res.status(200).json({
                status: false,
                message: msg('MSG001'),
                error: validateData.errors
            })
        } else {
            Portal.deleteJobHistoryById(formData.id, (err, result) => {
                if (err) {
                    res.status(200).json({
                        status: false,
                        message: msg('MSG001'),
                        error: err
                    })
                } else {
                    res.status(200).json({
                        status: true,
                        message: msg('MSG015')
                    })
                }
            })
        }
    })
}

module.exports.updateJobHistorybyID = function (req, res) {
    let formData = req.body
    let userId = formData.userID;

    let candidateSchema = {
        "userID": "required",
        "job_history_id": "required",
        "job_title": "required",
        "company": "required",
        "account_handled": "required",
        "start_date": "required",
        "job_responsibilities": "required",
        "is_currently_employed": "required",
    }
    if (formData.is_currently_employed !== 'true') {
        candidateSchema.end_date = "required"
    }
    var validateData = new node_validator(formData, candidateSchema);
    validateData.check().then((matched) => {
        if (!matched) {
            res.status(200).json({
                status: false,
                message: msg('MSG001'),
                error: validateData.errors
            })
        } else {
            let info = {}
            info.table = 'user_job_histories_maps'
            info.data = {
                "xxxxxxx": formData.xxxxxxx,
                "xxxxxxx": formData.xxxxxxx,
                "company": formData.company,
                "xxxxxxx": moment(formData.start_date).format('YYYY-MM-DD'),
                "job_xxxxxxxx": formData.job_xxxxxxxx,
                "is_currently_employed": formData.is_currently_employed === 'true' ? 1 : 0,
                "updated_xxxx": userId,
                "updated_xxxx": moment().format('YYYY-MM-DD HH:mm:ss')
            }
            if (formData.is_currently_employed !== 'true') {
                info.data.end_date = moment(formData.end_date).format('YYYY-MM-DD')
            } else {
                info.data.end_date = null
            }
            info.where = (`id = ${formData.job_history_id}`)
            Common.updateRecord(info.table, info.data, info.where, (err, result) => {
                if (err) {
                    res.status(200).json({
                        status: false,
                        message: msg('MSG001'),
                        error: err
                    })
                } else {
                    res.status(200).json({
                        status: true,
                        message: msg('MSG012')
                    })
                }
            })
        }
    })
}

module.exports.updateCandidateWorkDetailByID = function (req, res) {
    let formData = req.body
    let userId = formData.userID;

    let schema = {
        "userID": "required",
        "tools": "required",
        "skills": "required",
    }
    var validateData = new node_validator(formData, schema);
    validateData.check().then((matched) => {
        if (!matched) {
            res.status(200).json({
                status: false,
                message: msg('MSG001'),
                error: validateData.errors
            })
        } else {
            let tools = JSON.parse(formData.tools)
            let data = {
                "tools": tools,
                "userId": userId,
                "is_required": 1,
            }
            Portal.addOrUpdateTools(data, (err, result) => {
                if (err) {
                    res.status(200).json({
                        status: false,
                        message: msg('MSG001'),
                        error: err
                    })
                } else {
                    let skills = JSON.parse(formData.skills)
                    let data = {
                        "skills": skills,
                        "userId": userId,
                        "is_primary": 1,
                    }
                    Portal.addOrUpdateSkills(data, (err, result) => {
                        if (err) {
                            res.status(200).json({
                                status: false,
                                message: msg('MSG001'),
                                error: err
                            })
                        } else {
                            res.status(200).json({
                                status: true,
                                message: msg('MSG028')
                            })
                        }
                    })
                }
            })
        }
    })
}

module.exports.addCandidateEmergencyContact = function (req, res) {
    let formData = req.body
    let userId = formData.userID;

    let candidateSchema = {
        "userID": "required",
        "first_name": "required",
        "relationship": "required",
        "mobile_number": "required",
        "country_code": "required",
        "email": "required",
    }
    var validateData = new node_validator(formData, candidateSchema);
    validateData.check().then((matched) => {
        if (!matched) {
            res.status(200).json({
                status: false,
                message: msg('MSG001'),
                error: validateData.errors
            })
        } else {
            let info = {}
            info.table = 'emergency_contacts'
            info.data = {
                "user_id": userId,
                "first_name": formData.first_name,
                "relationship": formData.relationship,
                "mobile_number": formData.mobile_number,
                "country_code": formData.country_code,
                "email": formData.email,
                "created_by": userId,
                "updated_by": userId
            }
            if ((formData.last_name)) {
                info.data.last_name = formData.last_name
            }
            Common.insertRecord(info.table, info.data, (err, result) => {
                if (err) {
                    res.status(200).json({
                        status: false,
                        message: msg('MSG001'),
                        error: err
                    })
                } else {
                    res.status(200).json({
                        status: true,
                        message: msg('MSG031')
                    })
                }
            })
        }
    })

}

module.exports.updateEmergencyContactById = function (req, res) {
    let formData = req.body
    let userId = formData.userID;

    let candidateSchema = {
        "userID": "required",
        "emergency_contact_id": "required",
        "first_name": "required",
        "relationship": "required",
        "mobile_number": "required",
        "country_code": "required",
        "email": "required",
    }
    var validateData = new node_validator(formData, candidateSchema);
    validateData.check().then((matched) => {
        if (!matched) {
            res.status(200).json({
                status: false,
                message: msg('MSG001'),
                error: validateData.errors
            })
        } else {
            let info = {}
            info.table = 'emergency_contacts'
            info.data = {
                "first_name": formData.first_name,
                "relationship": formData.relationship,
                "mobile_number": formData.mobile_number,
                "country_code": formData.country_code,
                "email": formData.email,
                "updated_by": userId,
                "updated_on": moment().format('YYYY-MM-DD HH:mm:ss')
            }
            if ((formData.last_name)) {
                info.data.last_name = formData.last_name
            } else {
                info.data.last_name = null
            }
            info.where = (`id = ${formData.emergency_contact_id}`)
            Common.updateRecord(info.table, info.data, info.where, (err, result) => {
                if (err) {
                    res.status(200).json({
                        status: false,
                        message: msg('MSG001'),
                        error: err
                    })
                } else {
                    res.status(200).json({
                        status: true,
                        message: msg('MSG012')
                    })
                }
            })
        }
    })
}

module.exports.addProfessionalReference = function (req, res) {
    let formData = req.body
    let userId = formData.userID;

    let candidateSchema = {
        "userID": "required",
        "first_name": "required",
        "email": "required",
        "mobile_number": "required",
        "country_code": "required",
        "relationship": "required",
        "company_affiliation": "required",
        "type": "required"
    }
    var validateData = new node_validator(formData, candidateSchema);
    validateData.check().then((matched) => {
        if (!matched) {
            res.status(200).json({
                status: false,
                message: msg('MSG001'),
                error: validateData.errors
            })
        } else {
            let info = {}
            info.table = 'user_professional_references'
            info.data = {
                "user_id": userId,
                "first_name": formData.first_name,
                "email": formData.email,
                "mobile_number": formData.mobile_number,
                "country_code": formData.country_code,
                "relationship": formData.relationship,
                "company_affiliation": formData.company_affiliation,
                "type": formData.type,
                "created_by": userId,
                "updated_by": userId
            }
            if ((formData.last_name)) {
                info.data.last_name = formData.last_name
            }
            Common.insertRecord(info.table, info.data, (err, result) => {
                if (err) {
                    res.status(200).json({
                        status: false,
                        message: msg('MSG001'),
                        error: err
                    })
                } else {
                    res.status(200).json({
                        status: true,
                        message: msg('MSG031')
                    })
                }
            })
        }
    })
}