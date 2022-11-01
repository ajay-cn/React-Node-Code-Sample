const dbConnect = require('../services/dbConnect');
const Common = require('./common.model');

const Contact = {}

Contact.getContactsListing = function (where, result) {
    sql.select([
        'con.first_name',
        'con.last_name',
        '(SELECT CONCAT(con.first_name," ",con.last_name)) as name',
        'con.email',
        'con.job_title',
        'con.country_code',
        'con.mobile_number',
        'con.contact_type',
        'con.id',
        'con.mailing_address',
        'c.phonecode ',
        'con.id as contactsRowId'
    ])
        .join('countries c', 'c.id = con.country_code', 'left')
        .where('con.status != 3')
        .where(where)

    sql.get('contacts con', (err, res) => {
        if (err)
            result(err, null)
        else {
            // if (res.length) {
            result(null, res)
            // } else {
            //     result(null, null)
            // }
        }
    })
}

Contact.getContactById = function (where, result) {
    sql.select(['con.id',
        'con.first_name',
        'con.last_name',
        'con.email',
        'con.job_title',
        'con.country_code',
        'con.mobile_number',
        'con.contact_type',
        'con.mailing_address',
        'con.id'
    ])
        .where(where)

    sql.get('contacts con', (err, res) => {
        if (err)
            result(err, null)
        else {
            if (res.length) {
                result(null, res[0])
            } else {
                result(null, null)
            }
        }
    })
}

Contact.create = async function (data, result) {
    dbConnect.query('INSERT INTO contacts SET ?', data, (err, res) => {
        if (err)
            result(err, null)
        else {
            result(null, res)
        }
    });
}

Contact.deleteExistingFromXXXXXXX = async function (data, result) {
    var where = {
        company_id: data.company_id,
        'hubspot_contact_id IS NOT NULL': null
    };
    sql.delete("contacts", where, (err1, res1) => {
        if (err1) {
          result(err1, null);
        } else {
            if (res1.affectedRows > 0) {
                result(null, 1);
            } else {
                result(null, null);
            }
        }
    });
    
}

Contact.getPocContactList = function (info, result) {
    sql.select([
        'con.first_name',
        'con.last_name',
        '(SELECT CONCAT(con.first_name," ",con.last_name)) as name',
        'con.email',
        'con.job_title',
        'con.country_code',
        'con.mobile_number',
        'con.contact_type',
        'con.id',
        'con.mailing_address',
        'c.phonecode ',
    ])
        .join('countries c', 'c.id = con.country_code', 'left')
        .where(`(company_id = ${info.company_id}) AND (con.status != 3)`)
        .where(`con.id IN (SELECT contact_id from project_contact_map_ids where project_id = ${info.project_id})`)

    sql.get('contacts con', (err, res) => {
        if (err)
            result(err, null)
        else {
            result(null, res)
        }
    })
}

module.exports = Contact;
