const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 12
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    length: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    start: {
      type: Date,
      required: true
    },
    resort: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    perPerson: {
      type: String,
      required: true,
      trim: true,
      maxlength: 25
    },
    image: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    }
  },
  {
    timestamps: true
  }
);

const Trip = mongoose.model('trips', tripSchema);

module.exports = Trip;