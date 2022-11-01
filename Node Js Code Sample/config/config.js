require('dotenv').config();//instatiate environment variables

let CONFIG = {} //Make this global to use all over the application

CONFIG.app = process.env.APP || 'dev';
CONFIG.port = process.env.PORT || '3000';

CONFIG.db_dialect = process.env.DB_DIALECT || 'mysql';
CONFIG.db_host = process.env.DB_HOST || 'localhost';
CONFIG.db_port = process.env.DB_PORT || '3306';
CONFIG.db_name = process.env.DB_NAME || 'xxxxxxxx';
CONFIG.db_user = process.env.DB_USER || 'xxxxx';
CONFIG.db_password = process.env.DB_PASSWORD || '';
CONFIG.db_charset = 'xxxxxx';
CONFIG.db_collation = 'xxxxxxxxxxxxxx';
CONFIG.BASE_URL = process.env.CREWHUB_URL || 'http://localhost:3100';
CONFIG.SERVER_NAME = process.env.SERVER_NAME || 'xxxxxxxxx';


CONFIG.welcomeCandidate = '125d8741xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

// Mailer Send Configuration
CONFIG.mailerSendApiKey = process.env.MAILER_SEND_API_KEY || '';
CONFIG.mailerSendSetFrom = process.env.MAILER_SEND_SET_FROM || 'no-reply@xxxxxxxx.com';
CONFIG.mailerSendSetFromName = process.env.MAILER_SEND_SET_FROM_NAME || 'xxxxxxxx';

module.exports = CONFIG;