const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  website: String,
  description: String,
  telephone: String,
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);
