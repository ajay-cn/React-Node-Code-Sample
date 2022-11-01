const dbConnect = require('../services/dbConnect');

const Role = {}

Role.getRoles = function (result) {
    sql.select(['id', 'name', 'roleKey'])
        .where({ 'isForCandidate': 0 })
        .order_by('id ASC')
        .get('roles', (err2, res2) => {
            if (err2) {
                result(err2, null);
            }
            else {
                if (res2 != null && res2.length > 0) {
                    result(null, res2);
                }
                else {
                    result(null, null);
                }
            }
        });

}

Role.getRoleByRoleKey = function (roleKey, result) {
    sql.select(['id', 'name', 'roleKey'])
        .where({ 'roleKey': roleKey })
        .get('roles', (err2, res2) => {
            if (err2) {
                result(err2, null);
            }
            else {
                if (res2 != null && res2.length > 0) {
                    result(null, res2[0]);
                }
                else {
                    result(null, null);
                }
            }
        });

}

module.exports = Role;
