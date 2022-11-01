const express = require('express');
const router = express.Router();

const UsersController = require('../../controllers/xxxxxxxxxx/index');

router.post('/register', UsersController.create)

router.post('/forgot-password', UsersController.forgotPassword)
router.post('/reset-password', UsersController.resetPassword)
router.post('/change-password', helper.verifyToken, UsersController.changePassword)
router.post('/change-password-from-admin', helper.verifyToken, UsersController.changePasswordFromAdmin)

module.exports = router;
