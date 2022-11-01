const dbConnect = require('../services/dbConnect');

const KeySkills = function (data) {
    this.name = data.name;
    this.status = data.status;
    this.key = data.key.toLowerCase();
    this.created_by = data.created_by;
    this.updated_by = data.updated_by;
    this.created_on = moment().format('YYYY-MM-DD HH:mm:ss');
    this.updated_on = moment().format('YYYY-MM-DD HH:mm:ss');

}

KeySkills.create = async function (data, result) {
    dbConnect.query('INSERT INTO key_skills SET ?', data, (err, res) => {
        if (err) {
            throw err;
        }
        result(null, res.insertId)
    });
}

KeySkills.findById = function (id, result) {
    dbConnect.query(`SELECT * FROM key_skills where id = ${id}`, (err, res) => {
        if (err) throw err;

        result(null, res)
    });
}

KeySkills.findAll = function (undefined, result) {
    dbConnect.query('SELECT * FROM key_skills', (err, res) => {
        if (err) throw err;

        result(null, res);
    });
}

KeySkills.update = function (id, data, result) {
    dbConnect.query('UPDATE key_skills SET name=?, status=?, created_by=?, updated_by=? WHERE id = ?', [
        data.name,
        data.status,
        data.created_by,
        data.updated_by,
        id
    ], (err, res) => {
        if (err) throw err;

        result(null, res);
    });
}

KeySkills.getActiveKeySkill = function (result) {
    dbConnect.query('SELECT * FROM key_skills where status = 1', (err, res) => {
        if (err) throw err;
        result(null, res);
    });
}

KeySkills.getSKillsList = function (data, result) {
    sql.select(['skills.id as id', 'skills.name', 'skills.key', 'skills.status', 'CONCAT(team_members.first_name," ",team_members.last_name) as createdBy', 'skills.created_on', 'skills.updated_on', 'skills.status as status', 'skills.id as keySkillsRowId',])
        .join('team_members', 'team_members.user_id = skills.created_by', 'left')
    if (!helper.isEmpty(data.where)) {
        sql.where(`${data.where} AND (skills.status != 2)`) // 2 = deleted
    } else {
        sql.where(`skills.status != 2`) // 2 = deleted
    }
    sql.limit(data.limit).offset(data.offset)
    if (!helper.isEmpty(data.orderBy))
        sql.order_by(data.orderBy, (data.order) ? data.order : "DESC")
            .get('key_skills skills', (err, res) => {
                if (err) {
                    result(err, null);
                } else {
                    result(null, res);
                }
            })
}

KeySkills.getSkillsListCount = function (data, result) {
    sql.select(['*'])
    if (!helper.isEmpty(data.where)) {
        sql.where(`${data.where} AND (skills.status != 2)`) // 2 = deleted
    } else {
        sql.where(`skills.status != 2`) // 2 = deleted
    }
    sql.get('key_skills skills', (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, res.length);
        }
    })
}

KeySkills.validateKey = function (key, result) {
    // console.log(key)
    sql.select(['*'])
        .where(`key = '${key}' AND status != '2'`) // 2 Deleted
    sql.get('key_skills', (err, res) => {
        if (err) {
            result(err, null);
        } else if (res.length > 0) {
            result(null, 1);
        } else {
            result(null, null)
        }
    })
}

module.exports = KeySkills;