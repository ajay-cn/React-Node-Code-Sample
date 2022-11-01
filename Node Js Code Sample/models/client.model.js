const dbConnect = require('../services/dbConnect');
const Common = require('./common.model');
const Project = require('./project.model');
const Client = function (client) {
    this.removed_xxxxxxxxx
    // 
    // 
    // 
    // 
    // 
    // Columns
    // 
    // 
    // 
    // 
    this.created_on = new Date;
    this.updated_on = new Date;
}

Client.getClientList = (data, result) => {
    /// Get data like sql array
    sql.select([
        'com.id',
        'com.name as companyName',
        'com.company_logo',
        'classfication.name as classification',
        'com.classification_id as classificationID',
        'com.status as statusID',
        '(SELECT COUNT(*) FROM xxxxxxxxxx WHERE xxxxxxx.company_id = com.id) as xxxxxxx',
        '(SELECT COUNT(*) FROM xxxxxxxxxx WHERE xxxx_xxxx_map.company_id = com.id) as csmCount'
    ])
    .join('xxxxxxxxxx classfication', 'classfication.id = com.classification_id', 'left')
    .join('xxxx_xxxx_map xxxxx_map', 'xxxxx_map.company_id = com.id', 'left')

    if (!helper.isEmpty(data.where)) {
        sql.where(data.where + ' AND (com.status NOT IN (4, 5))')
    } else {
        sql.where('(com.status NOT IN (4, 5))')
    }
    sql.limit(data.limit).offset(data.offset)
    sql.group_by('com.id')
    if (!helper.isEmpty(data.orderBy))
        sql.order_by(data.orderBy, (data.order) ? data.order : "DESC")
            .get('companies com', async (err, res) => {
                if (err)
                    result(err, null)
                else {
                    let dataArray = []
                    // result(null, res)
                    await async.forEachOf(res, async (item, key) => {
                        let item1 = item
                        let csm = await Client.getCSM(item.id)
                        item1.csm = csm 
                        dataArray.push(item1)
                    })
                    result(null, dataArray)
                }
            })
}

Client.getCSM = (cid) => {
    return new Promise((resolve, reject) => {
        try {
            
            // Company ID item.id
            dbConnect.query('SELECT team_members.first_name, team_members.last_name, team_members.profile_image FROM `xxxxxxxxxx` LEFT JOIN team_members ON team_members.user_id = xxxx_xxxx_map.csm_id WHERE company_id = '+cid+' ', (err, res) => {
                if (err){
                    // result(err,null);
                    resolve([])
                }else{
                    // result(null, res);
                    resolve(res)
                }
            });

        } catch (error) {
            resolve([])
        }
    })
}

Client.getClientListCount = (data, result) => {
    sql.select(['com.id', 'com.name as companyName', 'com.company_logo', '(SELECT CONCAT(first_name," ",last_name) FROM `xxxxxxxxxx` WHERE `contacts`.`contact_type` = 1 AND `contacts`.`company_id`=`com`.`id` ORDER BY `contacts`.`created_on` DESC  LIMIT 1) as primaryContact', 'classfication.name as classification', 'com.classification_id as classificationID', 'com.status as statusID', '(SELECT COUNT(*) FROM xxxxxxxxxx WHERE xxxxxxx.company_id = com.id) as xxxxxxx'])
        .join('xxxxxxxxxx classfication', 'classfication.id = com.classification_id', 'left')
        .join('xxxx_xxxx_map xxxxx_map', 'xxxxx_map.company_id = com.id', 'left')

    if (!helper.isEmpty(data.where)) {
        sql.where(data.where + ' AND (com.status NOT IN (4, 5))')
    } else {
        sql.where('(com.status NOT IN (4, 5))')
    }
    sql.group_by('com.id')
    sql.get('companies com', (err, res) => {
        if (err)
            result(err, null)
        else {
            result(null, res.length)
        }
    })
}

Client.getClientOption = function (result) {
    let filterData = {}
    let info1 = {}
    info1.column = ['id', 'name']
    info1.table = 'xxxxxxxxxx'
    Common.getAllRecords(info1, (err, res) => {
        if (err)
            result(err, null)
        else {
            filterData.classification = res
            filterData.status = helper.getCompanyStatus()
            Project.getAllCsmOptions((error11, res11) => {
                filterData.csm = res11
                result(null, filterData)
            })
        }
    })
}

Client.getPersonalInfo = function (where, result) {
    sql.select([
        'co.id',
        'co.name',
        'co.website',
        'co.classification_id',
        'co.address_one',
        'co.address_two',
        'co.country_id',
        'co.state',
        'co.city',
        'co.zipcode',
        'co.company_logo',
        'co.status',
        'co.id as companiesRowId'
    ])
        .where(where)

    sql.get('companies co', (err, res) => {
        if (err){
            result(err, null)
        }else {
            let data = []
            async.forEachOf(res, (item, key, callback) => {
                let item1 = item
                sql.select(['CONCAT(team_members.first_name," ",team_members.last_name) as name', 'team_members.user_id as userId', 'team_members.profile_image as profileImage'])
                    .join('team_members', 'team_members.user_id = xxxx_xxxx_map.csm_id', 'left')
                    .where(`xxxx_xxxx_map.company_id = ${item.id}`)
                sql.get('xxxx_xxxx_map', (err1, res1) => {
                    if (err1) {
                        callback(err1)
                    } else {
                        item1.csm = res1
                        data.push(item1)
                        callback(null)
                    }
                })
            }, function (err) {
                if (err) {
                    result(err, null)
                } else {
                    result(null, data)
                }
            })
        }
    })
}

Client.create = async (data, result) => {
    dbConnect.query(`INSERT INTO companies SET ?`, data, (err, res) => {
        if (err)
            result(err, null)
        else {
            result(null, res.insertId)
        }
    });
}

Client.update = async (data, result) => {
    sql.update('companies', data, { hubspot_company_id: data.hubspot_company_id }, (err, res) => {
        if (err) {
            return console.error(err)
        } else {
            result(null, res)
        }
    });
}

Client.getCompanyByObjectId = (objectId, result) => {
    sql.select(['*'])
        .where('hubspot_company_id = ', objectId)
        .get('companies', (err, res) => {
            if (err)
                result(err, null)
            else {
                result(null, res)
            }
        });
}

Client.getProjectByClientId = (data, result) => {
    sql.select(['xxxxxxx.id as id', 'xxxxxxx.project_role_title as projectName', 'xxxxxx-removed-columns-xxxxxx'])
        .join('xxxxxxxxx', 'xxxxxxxxx.xxxxxxxxx_id = xxxxxxx.xxxxxxxxx_id', 'left')
        .where(`company_id = ${data.clientId} AND xxxxxxx.status NOT IN (3, 4)`)
        .limit(data.limit).offset(data.offset)
        .order_by(data.orderBy, (data.order) ? data.order : "DESC")
        .get('xxxxxxx', (err, res) => {
            if (err)
                result(err, null)
            else {
                // result(null, res)
                let data = []
                async.forEachOf(res, (item, key, callback) => {
                    let item1 = item
                    sql.select(['CONCAT(team_members.first_name," ",team_members.last_name) as name', 'team_members.user_id as userId', 'team_members.profile_image as profileImage'])
                        .join('team_members', 'team_members.user_id = xxxx_xxxxx_map_ids.csm_id', 'left')
                        .where(`xxxx_xxxxx_map_ids.project_id = ${item.id}`)
                    sql.get('xxxx_xxxxx_map_ids', (err1, res1) => {
                        if (err1) {
                            callback(err1)
                        } else {
                            item1.csm = res1
                            data.push(item1)
                            callback(null)
                        }
                    })
                }, function (err) {
                    if (err) {
                        result(err, null)
                    } else {
                        // result(null, data)
                        let newArray = []
                        async.forEachOf(data, (item, key, callback) => {
                            let item2 = item
                            sql.select(['CONCAT(contacts.first_name," ",contacts.last_name) as name', 'contacts.id as id'])
                            sql.where(`project_contact_map_ids.project_id = ${item.id}`)
                            sql.join('contacts', 'contacts.id = project_contact_map_ids.contact_id', 'left')
                            sql.get('project_contact_map_ids', (err2, res2) => {
                                if (err2) {
                                    console.log(err2)
                                } else {
                                    item2.poc = res2
                                    Project.getProjectDocumentsByProjectId(item.id, (err, res) => {
                                        if (err) {
                                            callback(err)
                                        } else {
                                            item2.documents = res
                                            Project.getProjectMediaByProjectId(item.id, (err, res) => {
                                                if (err) {
                                                    callback(err)
                                                } else {
                                                    item2.media = res
                                                    Project.getProfileGroupCountByProjectId(item.id, (err, res) => {
                                                        if (err) {
                                                            callback(err)
                                                        } else {
                                                            item2.profile_group_count = res
                                                            newArray.push(item2)                                                    
                                                            callback(null)
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }, function (err) {
                            if (err) {
                                result(err, null)
                            } else {
                                result(null, newArray)
                            }
                        })
                    }
                })
            }
        })
}

Client.getProjectCountByClientId = (data, result) => {
    sql.select(['xxxxxxx.id as id', 'xxxxxxx.project_role_title as projectName', 'xxxxxxx.target_start_date as targetStartDate','xxxxxxx.renewalDate as renewalDate', 'xxxxxxx.kpi as kpis', 'xxxxxxx.total_contractor as contractorsVolume', 'xxxxxxx.description as idealCandidate','xxxxxxx.outline_performance as compensationPlan', 'xxxxxxx.pay_amount as rate', 'xxxxxxx.work_hours as workHours', 'xxxxxxx.timezone_id as timezone',
        'xxxxxxxxx.name as xxxxxxxxx','xxxxxxxxx.xxxxxxxxx_id as xxxxxxxxxId', 'xxxxxxx.sub_status as sub_status', 'xxxxxxx.status as status', 'xxxxxxx.id as xxxxxxxRowId', 'xxxxxxxxx.xxxxxxxxx_id as xxxxxxxxxRowId'])
        .join('xxxxxxxxx', 'xxxxxxxxx.xxxxxxxxx_id = xxxxxxx.xxxxxxxxx_id', 'left')
        .where(`company_id = ${data.clientId} AND xxxxxxx.status NOT IN (3, 4)`)
        .order_by(data.orderBy, (data.order) ? data.order : "DESC")
        .get('xxxxxxx', (err, res) => {
            if (err)
                result(err, null)
            else {
                result(null, res.length)
            }
        })
}
//Archived Client List
Client.getArchiveClientList = (data, result) => {
    /// Get data like sql array
    sql.select(['com.id', 'com.name as companyName', 'com.company_logo', '(SELECT CONCAT(first_name," ",last_name) FROM `xxxxxxxxxx` WHERE `contacts`.`contact_type` = 1 AND `contacts`.`company_id`=`com`.`id` ORDER BY `contacts`.`created_on` DESC  LIMIT 1) as primaryContact', 'classfication.name as classification', 'com.classification_id as classificationID', 'com.status as statusID','(SELECT COUNT(*) FROM xxxxxxxxxx WHERE xxxxxxx.company_id = com.id) as xxxxxxx'])
        .join('xxxxxxxxxx classfication', 'classfication.id = com.classification_id', 'left')

    if (!helper.isEmpty(data.where)) {
        sql.where(data.where + ' AND (com.status = 4)')
    } else {
        sql.where('(com.status = 4)')
    }
    sql.limit(data.limit).offset(data.offset)
    if (!helper.isEmpty(data.orderBy))
        sql.order_by(data.orderBy, (data.order) ? data.order : "DESC")
            .get('companies com', (err, res) => {
                // console.log(err)
                if (err)
                    result(err, null)
                else {
                   // result(null, res)
                   let dataArray = []
                    async.forEachOf(res, (item, key, callback) => {
                        let item1 = item
                        sql.select(['company_id', 'csm_id'])
                        sql.where(`company_id = ${item.id}`)
                        sql.get('xxxx_xxxx_map', (err, res) => {
                            if (err) {
                                callback(err)
                            } else {
                                let newArray = []
                                async.forEachOf(res, (item, key, callback) => {
                                    sql.select(['CONCAT(first_name," ",last_name) as name', 'users.id as id'])
                                    sql.where(`user_id = ${item.csm_id}`)
                                        .join('users', 'users.id = team_members.user_id', 'left')
                                    sql.get('team_members', (err, res) => {
                                        if (err) {
                                            callback(err)
                                        } else {
                                            newArray.push(...res)
                                            callback(null)
                                        }
                                    })
                                }, function (err) {
                                    if (err) {
                                        callback(err)
                                    } else {
                                        item1.csm = newArray
                                        dataArray.push(item1)
                                        callback(null)
                                    }
                                })
                            }
                        })
                    }, function (err) {
                        if (err) {
                            result(err, null)
                        } else {
                            result(null, dataArray)
                        }
                    })
                }
            })
}

Client.getArchiveClientListCount = (data, result) => {
    sql.select(['com.id', 'com.name as companyName', 'com.company_logo', '(SELECT CONCAT(first_name," ",last_name) FROM `xxxxxxxxxx` WHERE `contacts`.`contact_type` = 1 AND `contacts`.`company_id`=`com`.`id` ORDER BY `contacts`.`created_on` DESC  LIMIT 1) as primaryContact', 'classfication.name as classification', 'com.classification_id as classificationID', 'com.status as statusID', '(SELECT COUNT(*) FROM xxxxxxxxxx WHERE xxxxxxx.company_id = com.id) as xxxxxxx'])
        .join('xxxxxxxxxx classfication', 'classfication.id = com.classification_id', 'left')

    if (!helper.isEmpty(data.where)) {
        sql.where(data.where + ' AND (com.status = 4)')
    } else {
        sql.where('(com.status = 4)')
    }
    sql.get('companies com', (err, res) => {
        if (err)
            result(err, null)
        else {
            result(null, res.length)
        }
    })
}

Client.getPrimaryContactsByCompanyId = function (clientId, result) {
    sql.select(['cts.id as contactPersonID', 'cts.first_name', 'cts.last_name'])
    sql.where(`company_id = ${clientId}`)
    sql.where(`cts.contact_type = 1`)
    sql.where(`cts.status != 3`)
    sql.get('contacts cts', (err, res) => {
        if (err)
            result(err, null)
        else {
            result(null, res)
        }
    })
}

Client.getCandidateByClientId = (data, result) => {
    sql.select([
            'feedbacks.id as id',
            'cand.preferred_name',
            'cand.first_name',
            'cand.last_name',
            'cand.role_id',
            'cand.introduction_video',
            'cand.profile_image',
            'feedbacks.user_id as user_id',
            'pro.id as project_id',
            'pro.project_role_title as projectName',
            'feedbacks.company_id as companyId',
            'xxxxxxxxx.name as xxxxxxxxx',
            'pgroup.id as groupId',
            'pgroup.status as groupStatus',
            'pgroup.group_name as groupName',
            `AVG(feedbacks.rating) as avg_rating`,
            'feedbacks.profile_remark as remark',
            `CONCAT_WS('', feedbacks.user_id, IFNULL(feedbacks.group_id, 'CREWBLOOM') ) AS GROUP_BY_COL`,
            'feedbacks.is_directly_added as is_directly_added',
        ])
        .join('candidates cand', 'cand.user_id = feedbacks.user_id', 'left')
        .join('profile_group pgroup', 'pgroup.id = feedbacks.group_id', 'left')
        .join('xxxxxxx pro', 'pro.id = feedbacks.project_id', 'left')
        .join('xxxxxxxxx', 'xxxxxxxxx.xxxxxxxxx_id = pro.xxxxxxxxx_id', 'left')
        .where(`feedbacks.company_id = ${data.clientId}`)
        // .where(`cand.role_id = 11`)
        .where(`CONCAT_WS('', feedbacks.user_id, feedbacks.project_id) NOT IN (SELECT CONCAT_WS('', candidate_project_profiles.user_id, candidate_project_profiles.project_id) FROM xxxxxxxxxx)`)
        .where(`(pgroup.status NOT IN (3,7) OR (pgroup.status IS NULL))`) //1=active, 2=draft, 3=deleted , 4=> Awaiting Feedback, 5=> Feedback Submitted 
        .group_by('GROUP_BY_COL')
        .limit(data.limit).offset(data.offset)
        .order_by(data.orderBy, (data.order) ? data.order : "DESC")
        if(data.projectId){
            sql.where(`feedbacks.project_id = ${data.projectId} AND feedbacks.is_removed != 1`) // 1 is hired (By default is_removed is 0)
        } else {
            sql.where(`feedbacks.is_removed != 1`) // 1 is hired (By default is_removed is 0)
        }
        sql.get('company_user_profile_feedbacks feedbacks', async (err, res) => {
            if (err){
                result(err, null)
            }else {
                // result(null, res)
                let dataArray = []
                await async.forEachOf(res, async (item, key) => {
                    let item1 = item
                    //like count
                    let likes = await Client.getLikeCount(item.user_id, item.groupId)
                    item1.likes = likes 

                    //dislike count
                    let dislikes = await Client.getDislikeCount(item.user_id, item.groupId)
                    item1.dislikes = dislikes 

                    dataArray.push(item1)
                })
                result(null, dataArray)
            }
        })
}
Client.getLikeCount = (user_id, group_id) => {
    return new Promise((resolve, reject) => {
        try {
            dbConnect.query(`SELECT count('is_liked') as like_count FROM xxxxxxxxxx WHERE user_id = ${user_id} AND group_id = ${group_id} AND is_liked = 1`, (err, res) => {
                if (err){
                    resolve([])
                }else{
                    if(res !== null && res.length > 0){
                        res = res[0]
                    }
                    resolve(res)
                }
            });
        } catch (error) {
            resolve([])
        }
    })
}

Client.getDislikeCount = (user_id, group_id) => {
    return new Promise((resolve, reject) => {
        try {
            dbConnect.query(`SELECT count('is_liked') as dislike_count FROM xxxxxxxxxx WHERE user_id = ${user_id} AND group_id = ${group_id} AND is_liked = 0`, (err, res) => {
                if (err){
                    resolve([])
                }else{
                    if(res !== null && res.length > 0){
                        res = res[0]
                    }
                    resolve(res)
                }
            });
        } catch (error) {
            resolve([])
        }
    })
}

Client.updateCsmByCompanyId = (data, result) => {
    sql.where(`company_id = ${data.company_id}`)
    sql.delete('xxxx_xxxx_map', (err, res) => {
        if (err) {
            result(err, null)
        } else {
            let company_id = data.company_id;
            let csmData = JSON.parse(data.csm_ids).map(function (item) {
                let currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
                return {
                    "company_id": company_id,
                    "csm_id": item,
                    // "updated_by": data.user_id,
                    "updated_on": currentTime
                }
            });
            Common.batchInsert("xxxx_xxxx_map", csmData, (err1, result1) => {
                if (err1) {
                    result(err1, null)
                } else {
                    result(null, result1)
                }
            })
        }
    })
}


Client.getFeedbacksForCandidate = (data, result) => {
    sql.select([
            'feedbacks.id as id',
            'feedbacks.user_id as user_id',
            'pro.id as project_id',
            'feedbacks.rating',
            'feedbacks.comment',
            'feedbacks.is_liked',
            'feedbacks.profile_remark',
            'feedbacks.company_id as companyId',
            'contacts.first_name as contactFirstName',
            'contacts.last_name as contactLastName'
        ])
        .join('candidates cand', 'cand.user_id = feedbacks.user_id', 'left')
        .join('profile_group', 'profile_group.id = feedbacks.group_id', 'left')
        .join('xxxxxxx pro', 'pro.id = profile_group.project_id', 'left')
        .join('contacts', 'contacts.id = feedbacks.contact_id', 'left')
        .where(`feedbacks.company_id = ${data.clientId} AND feedbacks.group_id = ${data.groupId} AND feedbacks.user_id = ${data.userId}`)
        .limit(data.limit).offset(data.offset)
        .order_by(data.orderBy, (data.order) ? data.order : "DESC")
        .get('company_user_profile_feedbacks feedbacks', (err, res) => {
            if (err)
                result(err, null)
            else {
                result(null, res)
            }
        })
}


Client.getFeedbacksForCandidateCount = (data, result) => {
    sql.select([
            'feedbacks.id as id',
            'feedbacks.user_id as user_id',
            'pro.id as project_id',
            'feedbacks.rating',
            'feedbacks.comment',
            'feedbacks.profile_remark',
            'feedbacks.company_id as companyId',
            'contacts.first_name as contactFirstName',
            'contacts.last_name as contactLastName'
        ])
        .join('candidates cand', 'cand.user_id = feedbacks.user_id', 'left')
        .join('profile_group', 'profile_group.id = feedbacks.group_id', 'left')
        .join('xxxxxxx pro', 'pro.id = profile_group.project_id', 'left')
        .join('contacts', 'contacts.id = feedbacks.contact_id', 'left')
        .where(`feedbacks.company_id = ${data.clientId} AND feedbacks.group_id = ${data.groupId} AND feedbacks.user_id = ${data.userId}`)
        .get('company_user_profile_feedbacks feedbacks', (err, res) => {
            if (err)
                result(err, null)
            else {
                result(null, res.length)
            }
        })
}

Client.getCompanyIdByProjectId = (id, result) => {
    sql.select(['company_id'])
        .where(`id = ${id}`)
        .get('xxxxxxx', (err, res) => {
            if (err)
                result(err, null)
            else {
                if(res.length > 0){
                    result(null, res[0])
                }else{
                    result(null,null)
                }
            }
        });
}

Client.isAnyActiveProject = (user_id, result) => {
    dbConnect.query('SELECT * FROM `xxxxxxxxxx` WHERE `user_id` = '+ user_id +' AND (completed_date IS NULL) AND (project_id IS NOT NULL) ORDER BY created_on DESC LIMIT 1', (err, res) => {
        if (err){
            result(err, null)
        }else{
            result(null, res)
        }
    });
}

Client.getAllCompanyOptions = function ( result) {
    sql.select([
        'companies.id',
        'companies.name as name'
    ])
    .where(`companies.status = 1`)

    sql.get('companies', (err, res) => {
        if (err)
            result(err, null)
        else {
            result(null, res)
        }
    })
}

Client.getEndorsementList = (data, result) => {
    const select = [
        `c.id`,
        `u.id as user_id`,
        `c.first_name`,
        `c.last_name`,
        `c.preferred_name`,
        `c.profile_image`,
        `c.profile_status`,
        `u.email`,
        `d.name as xxxxxxxxx`,
        `c.xxxxxxxxx_id as xxxxxxxxx_id`,
        'roles.roleKey',
    ]

    sql.select(select)
        .join('users u', 'c.user_id = u.id', 'left')
        .join('xxxxxxxxx d', 'd.xxxxxxxxx_id = c.xxxxxxxxx_id', 'left')
        .join('roles', 'roles.id = c.role_id', 'left')
        .join('address_details ad', 'ad.user_id = c.user_id', 'left')
        .join('user_tools_map utm', 'utm.user_id = c.user_id', 'left')
        .join('user_key_skills_maps usm', 'usm.user_id = c.user_id', 'left')
        .where({ 'u.user_type': 2, 'u.status': 1, 'c.profile_status': 5 })
    if (!helper.isEmpty(data.where)) {
        sql.where(data.where)
    }
    sql.limit(data.limit).offset(data.offset)
    if (!helper.isEmpty(data.orderBy))
        sql.order_by(data.orderBy, (data.order) ? data.order : "DESC")
    sql.group_by("c.id")
    sql.get('candidates c', async (err, res) => {
            if (err)
                result(err, null)
            else {
                // result(null, res)
                let dataArray = []
                async.forEachOf(res, (item, key, callback) => {
                    // Get KeySkills
                    let item1 = item
                    sql.select(['key_skills.name'])
                    sql.where(`user_id = ${item.user_id}`)
                    sql.join(`key_skills`, 'key_skills.id = user_key_skills_maps.key_skill_id')
                    sql.get('user_key_skills_maps', (err, res) => {
                        if (err) {
                            callback(err)
                        } else {
                            let skills = []
                            res.forEach(row => {
                                skills.push(row.name)
                            })
                            item1.keySkills = skills
                            dataArray.push(item1)
                            callback(null)
                        }
                    })
                }, function (err) {
                    if (err) {
                        result(err, null)
                    } else {
                        result(null, dataArray)
                    }
                })
            }
        })
}

Client.getEndorsementListCount = (data, result) => {
    const select = [
        `c.id`,
        `u.id as user_id`,
        `c.first_name`,
        `c.last_name`,
        `c.preferred_name`,
        `c.profile_image`,
        `c.profile_status`,
        `u.email`,
        `d.name as xxxxxxxxx`,
        `c.xxxxxxxxx_id as xxxxxxxxx_id`,
        'roles.roleKey',
    ]

    sql.select(select)
        .join('users u', 'c.user_id = u.id', 'left')
        .join('xxxxxxxxx d', 'd.xxxxxxxxx_id = c.xxxxxxxxx_id', 'left')
        .join('roles', 'roles.id = c.role_id', 'left')
        .join('address_details ad', 'ad.user_id = c.user_id', 'left')
        .join('user_tools_map utm', 'utm.user_id = c.user_id', 'left')
        .join('user_key_skills_maps usm', 'usm.user_id = c.user_id', 'left')
        .where({ 'u.user_type': 2, 'u.status': 1, 'c.profile_status': 5 })
    if (!helper.isEmpty(data.where)) {
        sql.where(data.where)
    }
    if (!helper.isEmpty(data.orderBy))
        sql.order_by(data.orderBy, (data.order) ? data.order : "DESC")
    sql.group_by("c.id")
    sql.get('candidates c', async (err, res) => {
        if (err)
            result(err, null)
        else {
            result(null, res.length)
        }
    })
}

module.exports = Client;
