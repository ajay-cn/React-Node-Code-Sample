const express = require('express');
const cors = require('cors');
global.async = require("async");
const bodyParser = require('body-parser');
var fileUploader = require('express-fileupload');
const logger = require('morgan');
const path = require('path');
global.dayjs = require('dayjs');
const helmet = require("helmet");
global.handlebars = require('handlebars');
global.moment = require('moment');
const CONFIG = require('./config/config');

const AWS = require('aws-sdk');
global.s3 = new AWS.S3({
  accessKeyId: CONFIG.AWS_S3_BUCKET_ACCESS_KEY,
  secretAccessKey: CONFIG.AWS_S3_BUCKET_SECRET_KEY,
  region: 'us-xxxx-x',
});
global.BUCKET_NAME = 'xxxxxxx';
global.FILE_PERMISSION = 'public-read';

global.helper = require('./helper/helper.js');
global.msgHelper = require('./helper/msg.js');
global.fs = require('fs');

const apiRouting = require('./routes/apiRouting');
var app = express();

app.use(cors());
app.use(logger('dev'));
/* app.use(bodyParser()); */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb',
  parameterLimit: 100000,
}));
app.use(fileUploader());
app.use(helmet());
app.use(express.static('public'))
console.log("Environment:", CONFIG.app)
app.use('/api', apiRouting);
app.use('/', function (req, res) {
  res.statusCode = 400; //send the appropriate status code
  res.json({ status: "false", message: "Bad Request", data: {} })
});

module.exports = app;