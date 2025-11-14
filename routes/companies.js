const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companiesController');

router.get('/', companiesController.getCompanies);
router.post('/seed', companiesController.seedCompanies);

module.exports = router;
