const { msg } = require('../../helper/msg');
const Common = require('../../models/common.model');
const ProfileGroup = require('../../models/node-schedulers/profileGroup');
const UserNotes = require('../../models/userNotes.model');
const Client = require('../../models/client.model');

const uploadToS3 = (fileData, path) => {
    return new Promise((resolve, reject) => {
        let files = []
        async.forEachOf(fileData, function (file, key, callback) {
            let fileExtension = file.name.split('.').pop()
            let file_name = helper.getRandomCode(10) + '_' + Date.now() + "." + fileExtension
            let filePath = path + file_name
            let mimetype = file.mimetype

            helper.uploadImageS3Bucket(
                file.data,
                filePath,
                mimetype,
                (err1, res1) => {
                    if (err1) {
                        // console.log(err1)
                        console.log(`Error while saving on S3, fileName: ${filePath}`)
                        callback(err1)
                    } else {
                        let imageURL = res1.image;
                        files.push(imageURL)
                        callback()
                    }
                }
            );

        }, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        })
    })
}

module.exports.uploadFiles = (req, res) => {
    try {

        let path = req.body.path
        // path = (path.at(-1) === '/') ? path : `${path}/`
        path = (path.lastIndexOf('/') === (path.length - 1)) ? path : `${path}/`
        let fileData = req.files ? Object.values(req.files) : []
        Promise.all([uploadToS3(fileData, path)]).then(response => {
            res.status(200).send({
                status: true,
                message: msg('MSG014'),
                data: response[0]
            })

        })
            .catch(e => {
                console.log({ e })
                res.status(200).send({
                    status: false,
                    message: msg('MSG002'),
                    error: e
                })
            })

    } catch (error) {
        console.log(error);
        res.status(200).send({
            status: false,
            message: msg('MSG002'),
            error: error
        })
    }
}

module.exports.saveNotes = (req, res) => {
    let { userID } = req.authData.userArr

    let data = {
        user_id: req.body.user_id,
        note_title: req.body.noteTitle,
        notes: req.body.note,
        note_for: req.body.note_for,
        mentions: req.body.mentions,
        created_by: userID,
        updated_by: userID,
    }

    if (req.body && req.body.noteId) {

        UserNotes.updateNotes({ data, id: req.body.noteId, files: req.body.files }, (err, result) => {

            if (err) {
                res.status(200).send({
                    status: false,
                    message: msg('MSG002'),
                    error: err
                })
            }
            else {
                res.status(200).send({
                    status: true,
                    message: msg('MSG046'),
                    data: result
                })
            }

        })

    } else {
        UserNotes.saveNotes({ data, files: req.body.files }, (err, result) => {

            if (err) {
                res.status(200).send({
                    status: false,
                    message: msg('MSG002'),
                    error: err
                })
            }
            else {
                res.status(200).send({
                    status: true,
                    message: msg('MSG043'),
                    data: result
                })
            }

        })
    }

}

module.exports.getNotes = (req, res) => {
    let data = {
        user_id: req.body.user_id,
        note_for: req.body.note_for,
        page_no: req.body.page_no,
        limit: req.body.limit ? req.body.limit : 50
    }
    UserNotes.getNotes(data, (err, result) => {
        if (err) {
            res.status(200).send({
                status: false,
                message: msg('MSG002'),
                error: err
            })
        } else {
            res.status(200).send({
                status: true,
                message: msg('MSG044'),
                data: result
            })
        }
    })
}

module.exports.deleteNotes = (req, res) => {
    let data = {
        note_id: req.body.note_id
    }
    UserNotes.deleteNotes(data, (err, result) => {
        if (err) {
            res.status(200).send({
                status: false,
                message: msg('MSG002'),
                error: err
            })
        } else {
            res.status(200).send({
                status: true,
                message: msg('MSG047'),
                data: result
            })
        }
    })
}

module.exports.awaitingFeedbackForProfileGroup = (req, res) => {
    // ================================
    ProfileGroup.awaitingFeedbackForProfileGroup([], (err, response) => {
        if (err) {
            res.status(200).send({
                status: false,
                message: msg('MSG002'),
                error: err
            })
        } else {
            res.status(200).send({
                status: true,
                message: msg('MSG052'),
                data: response
            })
        }
    })
    // ================================
}

module.exports.updateImageFromCloudinary = (req, res) => {

    let data = {
        originalImage: req.body.originalImage,
        filteredImage: req.body.filteredImage,
        id: req.body.user_id,
        case: req.body.case
    }

    switch (data.case) {
        case 'candidate_profile_image':
            // code block

            // 

            let info = {}
            info.table = 'xxxxxxxxx'
            info.data = {
                profile_image: data.filteredImage,
                profile_image_original : data.originalImage
            }
            info.where = {
                user_id: data.id
            }

            Common.updateRecord(info.table, info.data, info.where, (err, result) => {
                if (err) {
                    res.status(200).json({
                        status: false,
                        message: msg("MSG002"),
                        error: err
                    })
                } else {
                    res.status(200).json({
                        status: true,
                        message: msg("MSG053"),
                    })
                }
            })

            break;
        case 'team_member_profile_image':
            // code block
            break;
        case 'featured_image':

            let info1 = {}
            info1.table = 'media'
            info1.data = {
                media_url: data.filteredImage,
                media_url_original : data.originalImage
            }
            info1.where = {
                id: data.id
            }

            Common.updateRecord(info1.table, info1.data, info1.where, (err, result) => {
                if (err) {
                    res.status(200).json({
                        status: false,
                        message: msg("MSG002"),
                        error: err
                    })
                } else {
                    res.status(200).json({
                        status: true,
                        message: msg("MSG055"),
                    })
                }
            })
            // code block
            break;
        default:
            res.status(200).json({
                status: false,
                message: msg("MSG054"),
            })
            // code block
    }
}

module.exports.endorsementList = function (req, res) {
    let formData = req.body;
    let schema = {
        "order": "required",
        "orderBy": "required",
        "page": "required",
        "perPageItem": "required"
    }
    var validateData = new node_validator(formData, schema);
    validateData.check().then((matched) => {
        if (!matched) {
            res.status(200).json({
                status: false,
                message: msg("MSG001"),
                error: validateData.errors,
            });
        } else {
            let info = {
                "where": "",
                "limit": formData.perPageItem,
                "offset": (formData.page * formData.perPageItem) - formData.perPageItem,
                "order": formData.order,
                "orderBy": formData.orderBy
            };

            //search
            if (!helper.isEmpty(formData.searchTerm)) {
                info.where = "((c.first_name LIKE '%" + formData.searchTerm + "%') OR (c.last_name LIKE '%" + formData.searchTerm + "%') OR (c.preferred_name LIKE '%" + formData.searchTerm + "%') OR u.email LIKE '%" + formData.searchTerm + "%')";
            }

            //filter
            if (!helper.isEmpty(formData.selectedDepartment)) {
                if (helper.isEmpty(info.where)) {
                    info.where = `(c.department_id IN (${formData.selectedDepartment}))`;
                } else {
                    info.where += ` AND (c.department_id IN (${formData.selectedDepartment}))`;
                }
            }

            // Gender
            if (!helper.isEmpty(formData.selectedGender)) {
                if (!helper.isEmpty(info.where)) {
                    info.where = `(${info.where}) AND (c.gender IN (${formData.selectedGender}))`;
                } else {
                    info.where = `(c.gender IN (${formData.selectedGender}))`;
                }
            }

            if (!helper.isEmpty(formData.countryChecked)) {
                if (helper.isEmpty(info.where)) {
                    info.where = "(ad.country_id IN (" + formData.countryChecked + "))";
                } else {
                    info.where += " AND (ad.country_id IN (" + formData.countryChecked + "))";
                }
            }

            if (!helper.isEmpty(formData.selectedTools)) {
                if (helper.isEmpty(info.where)) {
                    info.where = `(utm.tool_id IN (${formData.selectedTools}))`;
                } else {
                    info.where += ` AND (utm.tool_id IN (${formData.selectedTools}))`;
                }
            }

            if (!helper.isEmpty(formData.selectedSkills)) {
                if (helper.isEmpty(info.where)) {
                    info.where = "(usm.key_skill_id IN (" + formData.selectedSkills + "))";
                } else {
                    info.where += " AND (usm.key_skill_id IN (" + formData.selectedSkills + "))";
                }
            }

            let data = {}
            
            Client.getEndorsementList(info, (err, res1) => {
                if (err) {
                    res.status(200).json({
                        status: false,
                        message: msg("MSG002"),
                        error: err
                    })
                } else {
                    data.data = res1
                    Client.getEndorsementListCount(info, (err1, res2) => {
                        if (err1) {
                            res.status(200).json({
                                status: false,
                                message: msg("MSG002"),
                                error: err1
                            })
                        } else {
                            data.totalCount = res2
                            res.status(200).json({
                                status: true,
                                message: msg("MSG006"),
                                data: data
                            })
                        }
                    })
                }
            })
        }
    })
}

module.exports.downnloadFile = async function(req, res) {
    let formData = req.body
    let url = formData.url
    helper.downloadImageFromS3(url, function(err, result) {
        if (err) {
            res.status(200).json({
                status: false,
                message: msg('MSG002'),
                error: err
            })
        } else {
            res.status(200).json({
                status: true,
                message: msg('MSG006'),
                data: result
            })
        }
    })
}

module.exports.updateFileName = async function(req, res) {

    const data = req.body

    Common.updateRecord(data.table, {document_name: data.document_name}, {id: data.rowId}, (err, result) => {
        if (err) {
            res.status(200).json({
                status: false,
                message: msg("MSG002"),
                error: err
            })
        } else {
            res.status(200).json({
                status: true,
                message: msg("MSG056"),
            })
        }
    })
    
}
