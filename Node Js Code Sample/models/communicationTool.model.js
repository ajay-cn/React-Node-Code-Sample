const dbConnect = require('../services/dbConnect');

const CommunicationTool = function (data) {
    this.name = data.name;
    this.status = data.status;
    this.key = data.key.toLowerCase();
    this.created_by = data.created_by;
    this.updated_by = data.updated_by;
    this.created_on = moment().format('YYYY-MM-DD HH:mm:ss');
    this.updated_on = moment().format('YYYY-MM-DD HH:mm:ss');

}

CommunicationTool.create = async function (data, result) {
    dbConnect.query('INSERT INTO xxxxxxxx_tools SET ?', data, (err, res) => {
        if (err) {
            throw err;
        }
        result(null, res.insertId)
    });
}

CommunicationTool.findById = function (id, result) {
    dbConnect.query(`SELECT * FROM xxxxxxxx_tools where id = ${id}`, (err, res) => {
        if (err) throw err;

        result(null, res)
    });
}

CommunicationTool.findAll = function (result) {
    dbConnect.query('SELECT * FROM xxxxxxxx_tools', (err, res) => {
        if (err) throw err;

        result(null, res);
    });
}

CommunicationTool.update = function (id, data, result) {
    dbConnect.query('UPDATE xxxxxxxx_tools SET name=?, status=?, created_by=?, updated_by=? WHERE id = ?', [
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

CommunicationTool.getActiveTool = function (result) {
    dbConnect.query(`SELECT id, name FROM xxxxxxxx_tools where status = 1`, (err, res) => {
        if (err) throw err;
        result(null, res)
    });
}

CommunicationTool.getxxxxxxxxxxList = function (data, result) {
    sql.select(['xxxxxxxxxx.id as id', 'xxxxxxxxxx.name', 'xxxxxxxxxx.key', 'xxxxxxxxxx.status', 'CONCAT(team_members.first_name," ",team_members.last_name) as createdBy', 'xxxxxxxxxx.created_on', 'xxxxxxxxxx.updated_on', 'xxxxxxxxxx.status as status', 'xxxxxxxxxx.id as xxxxxxxxxxRowId'])
        .join('team_members', 'team_members.user_id = xxxxxxxxxx.created_by', 'left')
    if (!helper.isEmpty(data.where)) {
        sql.where(`${data.where} AND (xxxxxxxxxx.status != 2)`) // 2 = deleted
    } else {
        sql.where(`xxxxxxxxxx.status != 2`) // 2 = deleted
    }
    sql.limit(data.limit).offset(data.offset)
    if (!helper.isEmpty(data.orderBy))
        sql.order_by(data.orderBy, (data.order) ? data.order : "DESC")
            .get('xxxxxxxx_tools xxxxxxxxxx', (err, res) => {
                if (err) {
                    result(err, null);
                } else {
                    result(null, res);
                }
            })
}

CommunicationTool.getxxxxxxxxxxListCount = function (data, result) {
    sql.select(['*'])
    if (!helper.isEmpty(data.where)) {
        sql.where(`${data.where} AND (xxxxxxxxxx.status != 2)`) // 2 = deleted
    } else {
        sql.where(`xxxxxxxxxx.status != 2`) // 2 = deleted
    }
    sql.get('xxxxxxxx_tools xxxxxxxxxx', (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, res.length);
        }
    })
}

CommunicationTool.validateKey = function (key, result) {
    sql.select(['*'])
        .where(`key = '${key}' AND status != '2'`) // 2 Deleted
    sql.get('xxxxxxxx_tools', (err, res) => {
        if (err) {
            result(err, null);
        } else if (res.length > 0) {
            result(null, 1);
        } else {
            result(null, null)
        }
    })
}


module.exports = CommunicationTool;