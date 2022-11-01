const express = require('express');
const router = express.Router();
const path = require('path');
global.jwt = require('jsonwebtoken');
global.sql = require('../models/index');
global.node_validator = require('node-input-validator');
global.Promises = require('promise');
global.datetime = require('node-datetime');
global.fs = require('fs');

const AuthTestController = require('../controllers/auth.controller');
const UsersRoutes = require('../routes/users/index');
// 
// removed
// 

/*============================== Authentication Routes Start =============================*/
router.use('/auth', AuthRoutes);
/*============================== Authentication Routes End =============================*/

/*============================== User Routes Start =============================*/
router.use('/users', UsersRoutes);
/*============================== User Routes End =============================*/

/*============================== Team Member Routes Start =============================*/
router.use('/members', MembersRoutes);
/*============================== Team Member Routes End =============================*/

/*============================== Master data Routes Start =============================*/
router.use('/master', MasterDataRoutes);
/*============================== Master data Routes End =============================*/

router.use('/prospects', ProspectRoutes);

/*============================== Candidates data Routes Start =============================*/
router.use('/candidates', candidates)
/*============================== Candidates data Routes End =============================*/

/*============================== Contractors data Routes Start =============================*/
router.use('/contractors', contractors)
/*============================== Contractors data Routes End =============================*/

// ================================ Client Routes Start =================================
router.use('/profile-group', ProfileGroup);
// ================================ Client Routes End =================================

// ================================ Shared Profiles Routes Start =================================
router.use('/shared-profiles', SharedProfile);
// ================================ Shared Profiled End =================================

// ================================ Dashboard Routes Start =================================
router.use('/dashboard', Dashboard);

// ================================ Dashboard Routes End =================================
router.use('/autoSave', AutoSave);
// ================================ Dashboard Routes End =================================


// ================================ Common Route =================================
router.use('/common', Common);

// `============================== Apollo Scheduler Routes Start =============================================\
router.use('/profileLock', ProfileLock);
// `============================== Apollo Scheduler Routes End =============================================

// ================================ Candidate Protal Routes Start =================================
router.use('/portal-temp', CandidatePortalTemp);
// ================================ Candidate Protal Routes End =================================

// ================================ Wordpress HTML to PDF Routes Start =================================
router.use('/wp', WordpressApi);
// ================================ Wordpress HTML to PDF Routes End =================================

module.exports = router;