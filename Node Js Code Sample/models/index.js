'use strict';
const CONFIG = require('../config/config');

const settings = {
	host: CONFIG.db_host,
	user: CONFIG.db_user,
	password: CONFIG.db_password,
	database: CONFIG.db_name,
	dateStrings: true,
	charset: CONFIG.db_charset,
	collation: CONFIG.db_collation
};

const qb = require('node-querybuilder').QueryBuilder(settings, 'mysql', 'single');

console.log("Connection establish successfully!");

module.exports = qb;