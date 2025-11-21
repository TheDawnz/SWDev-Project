const express = require('express');
const { getCompanies, getCompany, createCompany, deleteCompany, updateCompany } = require('../controllers/companies');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/',protect, getCompanies);
router.get('/:id', protect, getCompany);

// Admin-only: create, update and delete companies
router.post('/', protect, authorize('admin'), createCompany);
router.put('/:id', protect, authorize('admin'), updateCompany);
router.delete('/:id', protect, authorize('admin'), deleteCompany);

module.exports = router;
