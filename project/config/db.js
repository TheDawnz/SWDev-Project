const mongoose = require('mongoose');

module.exports = function connectDB() {
	const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/swdev';
	mongoose.set('strictQuery', false);
	mongoose
		.connect(mongoURI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(() => console.log('MongoDB connected'))
		.catch((err) => {
			console.error('MongoDB connection error:', err.message);
			process.exit(1);
		});
};
