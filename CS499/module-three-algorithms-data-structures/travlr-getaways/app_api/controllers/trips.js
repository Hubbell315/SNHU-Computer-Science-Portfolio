const Trip = require('../models/travlr');

// Only allow expected trip fields from client requests.
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

// Build clean trip data instead of passing the
// entire request body directly to MongoDB.
function buildTripData(
  body,
  includeCode = true
) {
  const tripData = {};

  tripFields.forEach((field) => {

    // The trip code stays unchanged during updates.
    if (!includeCode && field === 'code') {
      return;
    }

    if (body[field] !== undefined) {
      tripData[field] =
        typeof body[field] === 'string'
          ? body[field].trim()
          : body[field];
    }
  });

  // Keep trip codes consistent for lookups
  // and duplicate checks.
  if (tripData.code) {
    tripData.code =
      tripData.code.toUpperCase();
  }

  return tripData;
}

// Validate required data before sending
// the request to MongoDB.
function validateTripData(
  tripData,
  requireAllFields
) {
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
    const missingFields =
      requiredFields.filter(
        (field) => !tripData[field]
      );

    if (missingFields.length > 0) {
      return (
        'missing required fields ' +
        missingFields.join(', ')
      );
    }
  }

  // Stop invalid dates before they reach
  // the database.
  if (
    tripData.start &&
    Number.isNaN(
      Date.parse(tripData.start)
    )
  ) {
    return 'start date must be a valid date';
  }

  return null;
}

// Return safe and consistent database
// error responses.
function sendDatabaseError(
  res,
  error
) {

  // MongoDB duplicate-key error from
  // the unique trip-code field.
  if (error.code === 11000) {
    return res.status(409).json({
      message:
        'a trip with that code already exists'
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: error.message
    });
  }

  // Do not expose internal database details.
  return res.status(500).json({
    message:
      'an unexpected database error occurred'
  });
}

// Escape user-provided text before using
// it inside a MongoDB regular expression.
function escapeRegExp(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}

// Build validated public search criteria
// for the trip-listing endpoint.
function buildTripQuery(query) {

  const tripQuery = {};

  if (query.resort !== undefined) {

    if (typeof query.resort !== 'string') {
      return {
        error:
          'resort search must be text'
      };
    }

    const resort =
      query.resort.trim();

    if (resort.length > 100) {
      return {
        error:
          'resort search must be 100 characters or fewer'
      };
    }

    if (resort) {
      tripQuery.resort = {
        $regex: escapeRegExp(resort),
        $options: 'i'
      };
    }
  }

  return {
    tripQuery
  };
}

// Retrieve public trips using validated
// search criteria.
const tripsList = async (
  req,
  res
) => {

  const {
    tripQuery,
    error
  } = buildTripQuery(req.query);

  if (error) {
    return res.status(400).json({
      message: error
    });
  }

  try {

    const trips =
      await Trip
        .find(tripQuery)
        .sort({
          start: 1,
          name: 1
        })
        .exec();

    return res
      .status(200)
      .json(trips);

  } catch (databaseError) {

    return sendDatabaseError(
      res,
      databaseError
    );
  }
};

// Retrieve one trip using its unique
// trip code.
const tripsFindByCode = async (
  req,
  res
) => {

  try {

    const trip =
      await Trip
        .findOne({
          code:
            req.params
              .tripCode
              .toUpperCase()
        })
        .exec();

    if (!trip) {
      return res.status(404).json({
        message:
          'trip not found'
      });
    }

    return res
      .status(200)
      .json(trip);

  } catch (error) {

    return sendDatabaseError(
      res,
      error
    );
  }
};

// Add a new trip after authentication
// and validation.
const tripsAddTrip = async (
  req,
  res
) => {

  const tripData =
    buildTripData(req.body);

  const validationError =
    validateTripData(
      tripData,
      true
    );

  if (validationError) {
    return res.status(400).json({
      message:
        validationError
    });
  }

  try {

    const trip =
      await Trip.create(
        tripData
      );

    return res
      .status(201)
      .json(trip);

  } catch (error) {

    return sendDatabaseError(
      res,
      error
    );
  }
};

// Update only fields sent by the admin
// and keep the original trip code.
const tripsUpdateTrip = async (
  req,
  res
) => {

  const tripData =
    buildTripData(
      req.body,
      false
    );

  const validationError =
    validateTripData(
      tripData,
      false
    );

  if (validationError) {
    return res.status(400).json({
      message:
        validationError
    });
  }

  if (
    Object.keys(tripData).length === 0
  ) {
    return res.status(400).json({
      message:
        'provide at least one trip field to update'
    });
  }

  try {

    const trip =
      await Trip
        .findOneAndUpdate(
          {
            code:
              req.params
                .tripCode
                .toUpperCase()
          },
          tripData,
          {
            // Return the updated document.
            new: true,

            // Apply Mongoose validation
            // during updates.
            runValidators: true
          }
        )
        .exec();

    if (!trip) {
      return res.status(404).json({
        message:
          'trip not found'
      });
    }

    return res
      .status(200)
      .json(trip);

  } catch (error) {

    return sendDatabaseError(
      res,
      error
    );
  }
};

// Delete a trip after the route confirms
// the administrator has a valid JWT.
const tripsDeleteTrip = async (
  req,
  res
) => {

  try {

    const trip =
      await Trip
        .findOneAndDelete({
          code:
            req.params
              .tripCode
              .toUpperCase()
        })
        .exec();

    if (!trip) {
      return res.status(404).json({
        message:
          'trip not found'
      });
    }

    return res.status(200).json({
      message:
        'trip deleted successfully',
      trip
    });

  } catch (error) {

    return sendDatabaseError(
      res,
      error
    );
  }
};

module.exports = {
  tripsList,
  tripsFindByCode,
  tripsAddTrip,
  tripsUpdateTrip,
  tripsDeleteTrip
};