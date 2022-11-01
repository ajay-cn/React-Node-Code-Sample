'use strict';
require('dotenv').config();
var Common = {};

/*
 * Get All records from any table. 
 * 
 * @param {OBJ} info, {callback_function} result
 * 
 */
Common.getAllRecords = function (info, result) {
    sql.select(info.column)
        .where({ 'status': '1' })
        .where('status !=', 3);
    if (info.where)
        sql.where(info.where);
    if (info.or_where)
        sql.or_where(info.or_where);
    if (info.orderBy)
        sql.order_by(info.orderBy, (info.order) ? info.order : "ASC");
    if (info.limit)
        sql.limit(info.limit);
    sql.get(info.table, (err1, res1) => {
        if (err1) {
            result(err1, null);
        }
        else {
            if (res1 != null) {
                result(null, res1);
            }
            else {
                result(null, null);
            }
        }
    });
}

/*
 * Get one record from any table. 
 * 
 * @param {OBJ} info, {callback_function} result
 * 
 */
Common.getOneRow = function (info, result) {
    sql.select(info.column)
    if (info.where)
        sql.where(info.where);
    if (info.or_where)
        sql.or_where(info.or_where);
    if (info.orderBy)
        sql.order_by(info.orderBy, (info.order) ? info.order : "ASC");
    sql.get(info.table, (err1, res1) => {
        if (err1) {
            result(err1, null);
        }
        else {
            if (res1.length > 0) {
                result(null, res1[0]);
            }
            else {
                result(null, null);
            }
        }
    });
}

/*
 * Get record count from any table. 
 * 
 * @param {OBJ} info, {callback_function} result
 * 
 */
Common.getRowCount = function (info, result) {
    sql.select('*')
    if (info.where)
        sql.where(info.where);
    sql.get(info.table, (err1, res1) => {
        if (err1) {
            result(err1, null);
        }
        else {
            if (res1 != null) {
                result(null, res1.length);
            }
            else {
                result(null, null);
            }
        }
    });
}

/*
 * Add new record in to any table. 
 * 
 * @param {String} table, {OBJ} data, {callback_function} result
 * 
 */
Common.insertRecord = function (table, data, result) {
    if (data) {
        let currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
        data.created_on = currentTime;
        data.updated_on = currentTime;
    }
    sql.insert(table, data, (err, res) => {
        if (err)
            result(err, null);
        else {
            if (res.affectedRows > 0) {
                result(null, res);
            } else
                result("Something went wrong while inserting data!", null);
        }
    })
}

/*
 * Update existing record in to any table. 
 * 
 * @param {String} table, {OBJ} data, {OBJ} where, {callback_function} result
 * 
 */
Common.updateRecord = function (table, data, where, result) {
    if (data) {
        let currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
        data.updated_on = currentTime;
    }
    sql.update(table, data, where, (err, res) => {
        if (err)
            result(err, null);
        else {
            if (res.affectedRows > 0) {
                result(null, res);
            } else
                result(true, null);
        }
    });
}

/*
 * Update existing record in to any table. 
 * 
 * @param {String} table, {OBJ} data, {OBJ} where, {callback_function} result
 * 
 */
Common.updateRecordWithoutCheck = function (table, data, where, result) {
    if (data) {
        let currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
        data.updated_on = currentTime;
    }
    sql.update(table, data, where, (err, res) => {
        if (err)
            result(err, null);
        else {
            result(null, res);
        }
    });
}

/*
 * Delete existing record in to any table. 
 * 
 * @param {OBJ} info, {callback_function} result
 * 
 */
Common.deleteRecord = function (info, result) {
    sql.delete(info.table, info.where, (err, res) => {
        if (err)
            result(err, null);
        else {
            result(null, res);
        }
    })
}

/*
 * Add New or Update existing record in to any table. 
 * 
 * @param {String} table, {OBJ} data, {OBJ} where, {callback_function} result
 * 
 */
Common.addOrUpdateRecords = function (table, data, where, result) {
    sql.get_where(table, where, (err, res) => {
        if (err)
            result(err, null);
        else {
            if (res.length == 0) {
                this.insertRecord(table, data, (err2, res2) => {
                    if (err2) {
                        result(err2, null);
                    }
                    else {
                        res2.isUpdated = false;
                        result(null, res2);
                    }
                });
            }
            else {
                this.updateRecord(table, data, where, (err2, res2) => {
                    if (err2) {
                        result(err2, null);
                    }
                    else {
                        res2.isUpdated = true;
                        res2 = { ...res2, ...res[0] }
                        result(null, res2);
                    }
                });
            }
        }
    })
}
Common.batchInsert = function (table, data, result) {
    sql.insert_batch(table, data, (err, res) => {
        if (err) {
            result(err, null);
        }
        else {
            result(null, res);
        }
    })
}

Common.getAllRecordsOnly = function (info, result) {
    sql.select(info.column)
    if (info.where)
        sql.where(info.where);
    if (info.or_where)
        sql.or_where(info.or_where);
    if (info.orderBy)
        sql.order_by(info.orderBy, (info.order) ? info.order : "ASC");
    if (info.limit)
        sql.limit(info.limit);
    sql.get(info.table, (err1, res1) => {
        if (err1) {
            result(err1, null);
        }
        else {
            if (res1 != null) {
                result(null, res1);
            }
            else {
                result(null, null);
            }
        }
    });
}

Common.getSubQueryData = function (info, result) {
    sql.select(info.column, false)
    if (info.where)
        sql.where(info.where);
    if (info.or_where)
        sql.or_where(info.or_where);
    if (info.orderBy)
        sql.order_by(info.orderBy, (info.order) ? info.order : "ASC");
    sql.get(info.table, (err1, res1) => {
        if (err1) {
            result(err1, null);
        }
        else {
            if (res1.length > 0) {
                result(null, res1);
            }
            else {
                result(null, null);
            }
        }
    });
}
Common.getLastRecord = function (info, result) {
    sql.select(info.column)
        .where('status !=', 3);
    if (info.where)
        sql.where(info.where);
    if (info.orderBy)
        sql.order_by(info.orderBy, (info.order) ? info.order : "ASC");
    if (info.limit)
        sql.limit(1);
    sql.get(info.table, (err1, res1) => {
        if (err1) {
            result(err1, null);
        }
        else {
            if (res1 != null) {
                result(null, res1);
            }
            else {
                result(null, null);
            }
        }
    });
}

Common.batchDelete = function (table, columnName, IDs, result) {
    let where = " WHERE " + columnName + " IN (" + IDs + ")";
    let query = "DELETE FROM " + table + " " + where;
    sql.query(query, (err, res) => {
        if (err)
            result(err, null);
        else {
            result(null, res);
        }
    })
}

Common.getRecords = function (info, result) {
    sql.select(info.column)
    if (info.where)
        sql.where(info.where);
    if (info.or_where)
        sql.or_where(info.or_where);
    if (info.orderBy)
        sql.order_by(info.orderBy, (info.order) ? info.order : "ASC");
    if (info.limit)
        sql.limit(info.limit);
    sql.get(info.table, (err1, res1) => {
        if (err1) {
            result(err1, null);
        }
        else {
            if (res1 != null) {
                result(null, res1);
            }
            else {
                result(null, null);
            }
        }
    });
}


module.exports = Common;