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

    // keep the display format used by the app and merge sort
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

    // keep the original price string for the existing interface
    perPerson: {
      type: String,
      required: true,
      trim: true,
      maxlength: 25
    },

    // store price as integer cents for numeric database filtering
    priceCents: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isSafeInteger
    },

    // store the number of days separately from the display text
    durationDays: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isSafeInteger
    },

    // store a lowercase resort value for prefix searches
    resortSearch: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
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

// support resort searches with an optional price limit
tripSchema.index({ resortSearch: 1, priceCents: 1 });

// support queries that limit trip duration
tripSchema.index({ durationDays: 1 });

const Trip = mongoose.model('trips', tripSchema);

module.exports = Trip;