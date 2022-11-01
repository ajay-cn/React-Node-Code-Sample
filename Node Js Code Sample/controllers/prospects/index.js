const { msg } = require('../../helper/msg');
const Prospect = require('../../models/prospects.model');
const Common = require('../../models/common.model');
const mysql = require('../../services/dbConnect');


module.exports.getProspectsList = function (req, res) {
    let formData = req.body;
    let data = {};
    let prospectSchema = {
        "order": "required",
        "orderBy": "required",
        "page": "required|integer",
        "perPageItem": "required|integer",
    };
    var validateData = new node_validator(formData, prospectSchema);
    validateData.check().then((matched) => {
        if (!matched) {
            res.status(200).json({
                "status": false,
                "message": msg('MSG001'),
                "error": validateData.errors
            });
        } else {
            let info = {
                "where": "",
                "limit": formData.perPageItem,
                "offset": (formData.page * formData.perPageItem) - formData.perPageItem,
                "order": formData.order,
                "orderBy": formData.orderBy,
                "classification": formData.classification,
                "status": formData.status,
            };


            //search
            if (!helper.isEmpty(formData.keyword)) {
                info.where = info.where + " (com.name LIKE '%" + formData.keyword + "%')";
            }

            //filter
            if (!helper.isEmpty(formData.classification)) {
                if (helper.isEmpty(info.where)) {
                    info.where = `(com.classification_id IN (${formData.classification.map(item => item)}))`;
                } else {
                    info.where += ` AND (com.classification_id IN (${formData.classification.map(item => item)}))`;
                }
            }

            Prospect.getProspectList(info, (err2, result) => {
                if (err2)
                    res.status(200).json({
                        "status": false,
                        "message": msg('MSG002'),
                        "error": err2
                    });
                else {
                    if (result != null) {
                        data.data = result
                        data.totalCount = 0;
                        Prospect.getProspectListCount(info, (err2, res2) => {
                            if (err2)
                                res.status(200).json({
                                    "status": false,
                                    "message": msg('MSG002'),
                                    "error": err2
                                });
                            else {
                                data.totalCount = res2;
                                Prospect.getProspectOption((err3, res3) => {
                                    if (err3)
                                        res.status(200).json({
                                            "status": false,
                                            "message": msg('MSG002'),
                                            "error": err3
                                        });
                                    else {
                                        data.option = res3;
                                        res.status(200).json({
                                            "status": true,
                                            "message": msg('MSG006'),
                                            "data": data
                                        });
                                    }
                                })
                            }
                        })
                    } else
                        res.json({
                            "status": true,
                            "message": msg('MSG007'),
                            "data": {}
                        });
                }
            })
        }
    })
}

module.exports.changeProspectIntoClient = function (req, res) {
    const prospectID = req.body.id;
    let info = {};

    /// Change Prospect to client 
    /// Change Company Status Name Prospect to Active
    let info1 = {}
    info1.data = {
        "status": 1, //for active
        "type": 2, //for client
        "xxxxx_status": 1 //for paid
    };
    info1.where = { "id": prospectID }
    info1.table = "xxxxxxxx";
    Common.updateRecord(info1.table, info1.data, info1.where, (err1, result1) => {
        if (err1) {
            res.status(200).json({
                "status": false,
                "message": msg('MSG002'),
                "error": err1
            });
        } else {
            res.status(200).json({
                "status": true,
                "message": msg('MSG012'),
            });
        }
    })
}

module.exports.getPersonalInfo = (req, res) => {
    try {
        let clientID = req.params.clientID;
        Prospect.getPersonalInfo({"co.id":clientID}, (err, data) => {
            if (err && !data ) {
                res.status(200).send({
                    error: true, 
                    message: msg('MSG002'),
                    error: err
                })
            }else{    
				res.status(200).send({
					status: true,
					message: msg('MSG006'),
					data: data
				})
			}
        })

    } catch (error) {
        res.status(200).send({
            error: true,
            message: msg('MSG002'),
            error: error
        })
    }
}

module.exports.updatePersonalInfo = (req, res) => {
    let formData = req.body;
    let data = {};
    let requestData = {
        "clientID": "required|integer",
        "name": "required|string",
        "addressFirst": "required|string",
        "state": "required|string",
        "city": "required|string",
        "country": "required|integer",
        "zipCode": "required|integer",
        "classification": "required|integer",
        "employeeCount": "required|integer"
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
            var tableData = {
                name: formData.name.trim(),
                address_one: formData.addressFirst,
                state: formData.state,
                city: formData.city,
                country_id: formData.country,
                zipcode: formData.zipCode,
                classification_id: formData.classification,
                employee_count: formData.employeeCount,
                website: formData.website,
                facebook_url: formData.facebookUrl,
                instagram_url: formData.instagramUrl,
                linkedin_url: formData.linkedInUrl,
                company_logo: (formData.company_logo) ? formData.company_logo : null
            };
            Common.updateRecord("companies", tableData,{"id":formData.clientID}, (err1, res1) => {
                if (err1) {
                    res.status(200).json({ "status": false, "message": msgHelper.msg('MSG001', req.body.language), "error": err22 });
                }else{
                    res.json({ "status": true, "message": msg('MSG031'), data: res1 });
                 }
            })
        }
    })
}

module.exports.getProspectById = function (req, res) {
    let formData = req.body;
    let data = {};
    let prospectSchema = {
        "id": "required"
    }
    var validateData = new node_validator(formData, prospectSchema);
    validateData.check().then((matched) => {
        if (!matched) {
            res.status(200).json({
                "status": false,
                "message": msg('MSG001'),
                "error": validateData.errors
            });
        } else {
            Prospect.getProspectDataById(formData.id, (err, result) => {
                if (err) {
                    res.status(200).json({
                        "status": false,
                        "message": msg('MSG002'),
                        "error": err
                    });
                } else {
                    let data = {};
                    data = result;
                    res.status(200).json({
                        "status": true,
                        "message": msg('MSG006'),
                        "data": data
                    })
                }
            })
        }
    })
}

module.exports.getCreateProjectData = function (req, res) {
    let data = {}
    Prospect.getCsmOptions((err, result) => {
        if (err) {
            res.status(200).json({
                "status": false,
                "message": msg('MSG002'),
                "data": data
            });
        } else {
            data.csmOptions = result;
            Prospect.getDepartmentOptions((err1, result1) => {
                if (err1) {
                    res.status(200).json({
                        "status": false,
                        "message": msg('MSG002'),
                        "data": data
                    });
                } else {
                    data.departmentOptions = result1
                    res.status(200).json({
                        "status": true,
                        "message": msg('MSG006'),
                        "data": data
                    })
                }
            })
        }
    })
}

module.exports.updateProspectProjectByProjectId = function (req, res) {
    let formData = req.body;
    let projectSchema = {
        "project_id": "required",
        "user_id": "required",
        "project_role_title": "required",
        "department_id": "required",
        "target_start_date": "required",
        "project_category": "required",
    }
    var validateData = new node_validator(formData, projectSchema);
    validateData.check().then((matched) => {
        if (!matched) {
            res.status(200).json({
                "status": false,
                "message": msg('MSG001'),
                "error": validateData.errors
            });
        } else {
            let info = {};
            info.data = {
                "project_role_title": formData.project_role_title,
                "department_id": formData.department_id,
                "target_start_date": moment(formData.target_start_date).format('YYYY-MM-DD'),
                "project_category": formData.project_category,
                "company_id": formData.company_id,
            }
            info.where = `(id = ${formData.project_id})`;
            info.table = "xxxxxxx";
            Common.updateRecord(info.table, info.data, info.where, (err, result) => {
                if (err) {
                    res.status(200).json({
                        "status": false,
                        "message": msg('MSG002'),
                        "error": err
                    });
                } else {
                    let projectId = formData.project_id;
                    let csm_ids = formData.csm;
                    let user_id = formData.user_id;
                    Prospect.updateCsmByProjectId({projectId, csm_ids, user_id}, (err, result) => {
                        if(err){
                            res.status(200).json({
                                "status": false,
                                "message": msg('MSG002'),
                                "error": err
                            });
                        } else {
                            res.status(200).json({
                                "status": true,
                                "message": msg('MSG012'),
                            });
                        }
                    })
                }
            })
        }
    })
}

/*
 Description : File upload for form-data format.
 Parameter used : image object 
 */
module.exports.uploadCompanyLogo = function (req, res) {
  let uploadData = req.files;
  let uploadSchema = {
    image: "required|object",
  };
  var finalImage = "";
  let validateData = new node_validator(uploadData, uploadSchema);
  validateData.check().then((matched) => {
    if (!matched)
      res.status(200).json({
        status: false,
        message: msg("MSG001"),
        error: validateData.errors,
      });
    else {
      let uploadedFile = req.files.image; // image object
      let fileData = uploadedFile.data;
      let image_name = uploadedFile.name; // image name
      let fileExtension = image_name.split(".")[1]; //getting extenstion from file mimetype
      var extension = uploadedFile.mimetype;
      // extension = extension.split("/");
      if( uploadedFile.mimetype === "image/png" || uploadedFile.mimetype === "image/jpeg" || uploadedFile.mimetype === "image/jpg"){
        image_name = helper.getRandomCode(8) + Date.now() + "." + fileExtension;
        let filePath = 'prospects/logo/' + image_name;
        var imageURL = '';
        helper.uploadImageS3Bucket(
            fileData,
            filePath,
            uploadedFile.mimetype,
            (err1, res1) => {
                if (err1) {
                    res.status(200).json({
                      "status": false,
                      "message": msg("MSG002"),
                      "error": err1,
                    });
                } else {
                    imageURL = res1.image;
                    res.json({
                        "status": true,
                        "message": msg('MSG014'),
                        "data": imageURL,
                    });
                }
            }
        );
      }else{
        res.status(200).json({
            status: false,
            message: msg("MSG030"),
            error: 'Invalid data',
          });
      }
    }
  });
};
