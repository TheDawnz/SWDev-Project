const Company = require('../models/Company');

exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.seedCompanies = async (req, res) => {
  const seed = req.body.companies || [];
  try {
    await Company.deleteMany({});
    const created = await Company.insertMany(seed);
    res.json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
