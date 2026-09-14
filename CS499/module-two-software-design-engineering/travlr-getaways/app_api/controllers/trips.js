const Trip = require('../models/travlr');

// only allow expected trip fields from client requests
const tripFields = [
  'code',
  'name',
  'length',
  'start',
  'resort',
  'perPerson',
  'image',
  'description'
];

// build clean trip data instead of passing the full request body to mongodb
function buildTripData(body, includeCode = true) {
  const tripData = {};

  tripFields.forEach((field) => {
    // trip code stays unchanged during updates
    if (!includeCode && field === 'code') {
      return;
    }

    if (body[field] !== undefined) {
      tripData[field] = typeof body[field] === 'string'
        ? body[field].trim()
        : body[field];
    }
  });

  // keep trip codes consistent for lookups and duplicate checks
  if (tripData.code) {
    tripData.code = tripData.code.toUpperCase();
  }

  return tripData;
}

// validate required data before sending it to mongodb
function validateTripData(tripData, requireAllFields) {
  const requiredFields = [
    'code',
    'name',
    'length',
    'start',
    'resort',
    'perPerson',
    'image',
    'description'
  ];

  if (requireAllFields) {
    const missingFields = requiredFields.filter(
      (field) => !tripData[field]
    );

    if (missingFields.length > 0) {
      return `missing required fields ${missingFields.join(', ')}`;
    }
  }

  // stop invalid dates before they reach the database
  if (tripData.start && Number.isNaN(Date.parse(tripData.start))) {
    return 'start date must be a valid date';
  }

  return null;
}

// return safe and consistent database error responses
function sendDatabaseError(res, error) {
  // mongodb duplicate key error from the unique trip code field
  if (error.code === 11000) {
    return res.status(409).json({
      message: 'a trip with that code already exists'
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: error.message
    });
  }

  // do not send internal database details to the client
  return res.status(500).json({
    message: 'an unexpected database error occurred'
  });
}

// get all public trips ordered by start date then name
const tripsList = async (req, res) => {
  try {
    const trips = await Trip.find({})
      .sort({ start: 1, name: 1 })
      .exec();

    return res.status(200).json(trips);
  } catch (error) {
    return sendDatabaseError(res, error);
  }
};

// get one trip using its unique trip code
const tripsFindByCode = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      code: req.params.tripCode.toUpperCase()
    }).exec();

    if (!trip) {
      return res.status(404).json({
        message: 'trip not found'
      });
    }

    return res.status(200).json(trip);
  } catch (error) {
    return sendDatabaseError(res, error);
  }
};

// add a new trip after authentication and validation
const tripsAddTrip = async (req, res) => {
  const tripData = buildTripData(req.body);
  const validationError = validateTripData(tripData, true);

  if (validationError) {
    return res.status(400).json({
      message: validationError
    });
  }

  try {
    const trip = await Trip.create(tripData);
    return res.status(201).json(trip);
  } catch (error) {
    return sendDatabaseError(res, error);
  }
};

// update only fields sent by the admin and keep the original trip code
const tripsUpdateTrip = async (req, res) => {
  const tripData = buildTripData(req.body, false);
  const validationError = validateTripData(tripData, false);

  if (validationError) {
    return res.status(400).json({
      message: validationError
    });
  }

  if (Object.keys(tripData).length === 0) {
    return res.status(400).json({
      message: 'provide at least one trip field to update'
    });
  }

  try {
    const trip = await Trip.findOneAndUpdate(
      { code: req.params.tripCode.toUpperCase() },
      tripData,
      {
        // return the new document and apply schema validation during updates
        new: true,
        runValidators: true
      }
    ).exec();

    if (!trip) {
      return res.status(404).json({
        message: 'trip not found'
      });
    }

    return res.status(200).json(trip);
  } catch (error) {
    return sendDatabaseError(res, error);
  }
};

// delete a trip after the route confirms the admin has a valid jwt
const tripsDeleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
      code: req.params.tripCode.toUpperCase()
    }).exec();

    if (!trip) {
      return res.status(404).json({
        message: 'trip not found'
      });
    }

    return res.status(200).json({
      message: 'trip deleted successfully',
      trip
    });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
};

module.exports = {
  tripsList,
  tripsFindByCode,
  tripsAddTrip,
  tripsUpdateTrip,
  tripsDeleteTrip
};