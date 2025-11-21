const express = require('express');
const { getCompanies, getCompany } = require('../controllers/companies');
const router = express.Router();

router.get('/', getCompanies);
router.get('/:id', getCompany);

module.exports = router;
