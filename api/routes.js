const express = require('express');
const router = express.Router();
const dash = require('../controller/dashboard')

router.get('/:idline1/:idline2', dash.dashboard);

module.exports = router