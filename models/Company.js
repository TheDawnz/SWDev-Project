const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
	name: { type: String, required: true },
	address: { type: String,required: true,default: '' },
	website: { type: String,required: true,default: '' },
	description: { type: String,required: true,default: '' },
	tel: { type: String,required: true,default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);