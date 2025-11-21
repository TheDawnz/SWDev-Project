const Company = require('../models/Company');

exports.getCompanies = async (req, res) => {
	const companies = await Company.find();
	res.json({ success: true, data: companies });
};

exports.getCompany = async (req, res) => {
	const company = await Company.findById(req.params.id);
	if (!company) return res.status(404).json({ success:false, message:'Not found' });
	res.json({ success: true, data: company });
};
