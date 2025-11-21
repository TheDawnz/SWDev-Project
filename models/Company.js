const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
	name: { type: String, required: true },
	address: { type: String },
	website: { type: String },
	description: { type: String },
	tel: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);