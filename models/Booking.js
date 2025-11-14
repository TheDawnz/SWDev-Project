const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  companies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
}, { timestamps: true });

// Static helper to check date in allowed range (May 10-13, 2022)
BookingSchema.statics.isAllowedDate = function (date) {
  const d = new Date(date);
  const start = new Date('2022-05-10T00:00:00Z');
  const end = new Date('2022-05-13T23:59:59Z');
  return d >= start && d <= end;
};

module.exports = mongoose.model('Booking', BookingSchema);
