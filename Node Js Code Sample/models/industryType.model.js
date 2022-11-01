const dbConnect = require('../services/dbConnect');

const IndustryType = function (data) {
    this.name = data.name;
    this.status = data.status;
    // columns removed
    this.created_by = data.created_by;
    this.updated_by = data.updated_by;
    this.created_on = new Date;
    this.updated_on = new Date;

}

IndustryType.create = async function (data, result) {
    dbConnect.query('INSERT INTO industry_types SET ?', data, (err, res) => {
        if (err) {
            throw err;
        }
        result(null, res.insertId)
    });
}

IndustryType.findById = function (id, result) {
    dbConnect.query(`SELECT * FROM industry_types where id = ${id}`, (err, res) => {
        if (err) throw err;

        result(null, res)
    });
}

IndustryType.findAll = function (undefined, result) {
    dbConnect.query('SELECT * FROM industry_types', (err, res) => {
        if (err) throw err;

        result(null, res);
    });
}

IndustryType.update = function (id, data, result) {
    // xxxxxxxxxxxxxxxxx removed
}



module.exports = IndustryType;