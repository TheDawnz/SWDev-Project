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

exports.createCompany = async (req, res) => {
	try {
		const { name, address, website, description, tel } = req.body;
		if (!name) return res.status(400).json({ success:false, message: 'Name is required' });
		const company = await Company.create({ name, address, website, description, tel });
		res.status(201).json({ success: true, data: company });
	} catch (err) {
		console.error('Create company error:', err);
		res.status(500).json({ success:false, message: err.message || 'Server error' });
	}
};

exports.deleteCompany = async (req, res) => {
	try {
		const company = await Company.findById(req.params.id);
		if (!company) return res.status(404).json({ success:false, message: 'Not found' });
		await company.deleteOne();
		res.json({ success:true, message: 'Deleted' });
	} catch (err) {
		console.error('Delete company error:', err);
		res.status(500).json({ success:false, message: err.message || 'Server error' });
	}
};

exports.updateCompany = async (req, res) => {
	try {
		const { name, address, website, description, telephone } = req.body;
		const company = await Company.findById(req.params.id);
		if (!company) return res.status(404).json({ success:false, message: 'Not found' });

		if (name !== undefined) company.name = name;
		if (address !== undefined) company.address = address;
		if (website !== undefined) company.website = website;
		if (description !== undefined) company.description = description;
		if (telephone !== undefined) company.telephone = telephone;

		await company.save();
		res.json({ success:true, data: company });
	} catch (err) {
		console.error('Update company error:', err);
		res.status(500).json({ success:false, message: err.message || 'Server error' });
	}
};
