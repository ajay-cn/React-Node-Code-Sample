const express = require('express');
const router = express.Router();

const ProspectsController = require('../../controllers/xxxxxxxx');

router.post('/',helper.verifyToken, ProspectsController.getProspectsList);
router.post('/change-to-client',helper.verifyToken, ProspectsController.changeProspectIntoClient);

// Route.removed

router.get('/getPersonalInfo/:clientID',helper.verifyToken, ProspectsController.getPersonalInfo);
router.post('/updatePersonalInfo',helper.verifyToken, ProspectsController.updatePersonalInfo);

module.exports = router;
