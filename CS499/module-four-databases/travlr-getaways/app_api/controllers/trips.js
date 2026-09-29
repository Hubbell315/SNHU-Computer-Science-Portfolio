const Trip = require('../models/travlr');

const {
  priceToCents,
  lengthToDays,
  resortToSearch
} = require('../models/trip-values');

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

// build clean trip data instead of passing the entire request body to mongodb
function buildTripData(body, includeCode = true) {
  const tripData = {};

  tripFields.forEach((field) => {
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

  if (tripData.code) {
    tripData.code = tripData.code.toUpperCase();
  }

  return tripData;
}

// validate the request and derive the database fields
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
      return (
        'missing required fields ' +
        missingFields.join(', ')
      );
    }
  }

  if (
    tripData.start &&
    Number.isNaN(Date.parse(tripData.start))
  ) {
    return 'start date must be a valid date';
  }

  try {
    if (tripData.perPerson !== undefined) {
      tripData.priceCents = priceToCents(
        tripData.perPerson
      );
    }

    if (tripData.length !== undefined) {
      tripData.durationDays = lengthToDays(
        tripData.length
      );
    }

    if (tripData.resort !== undefined) {
      tripData.resortSearch = resortToSearch(
        tripData.resort
      );
    }
  } catch (error) {
    return error.message;
  }

  return null;
}

// return consistent database errors without exposing internal details
function sendDatabaseError(res, error) {
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

  return res.status(500).json({
    message: 'an unexpected database error occurred'
  });
}

// treat special characters in search text as ordinary text
function escapeRegExp(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}

// build the database query from validated search parameters
function buildTripQuery(query) {
  const tripQuery = {};

  if (query.resort !== undefined) {
    if (typeof query.resort !== 'string') {
      return {
        error: 'resort search must be text'
      };
    }

    const resort = query.resort.trim();

    if (resort.length > 100) {
      return {
        error: 'resort search must be 100 characters or fewer'
      };
    }

    if (resort) {
      // keep the existing resort filter for api requests
      tripQuery.resortSearch = {
        $regex: '^' + escapeRegExp(
          resort.toLowerCase()
        )
      };
    }
  }

  if (query.search !== undefined) {
    if (typeof query.search !== 'string') {
      return {
        error: 'search must be text'
      };
    }

    const search = query.search.trim();

    if (search.length > 100) {
      return {
        error: 'search must be 100 characters or fewer'
      };
    }

    if (search) {
      const escapedSearch = escapeRegExp(search);

      // match the beginning of a trip name or resort
      // the resort value is stored in lowercase for searching
      tripQuery.$or = [
        {
          name: {
            $regex: '^' + escapedSearch,
            $options: 'i'
          }
        },
        {
          resortSearch: {
            $regex: '^' + escapeRegExp(
              search.toLowerCase()
            )
          }
        }
      ];
    }
  }

  if (query.maxPrice !== undefined) {
    try {
      tripQuery.priceCents = {
        $lte: priceToCents(query.maxPrice)
      };
    } catch (error) {
      return {
        error: 'maxPrice must be a nonnegative price with at most two decimals'
      };
    }
  }

  if (query.maxDays !== undefined) {
    const maxDays = Number(query.maxDays);

    if (
      !/^\d+$/.test(String(query.maxDays)) ||
      !Number.isSafeInteger(maxDays) ||
      maxDays < 1
    ) {
      return {
        error: 'maxDays must be a positive integer'
      };
    }

    tripQuery.durationDays = {
      $lte: maxDays
    };
  }

  return { tripQuery };
}

// retrieve trips using database side filtering
const tripsList = async (req, res) => {
  const { tripQuery, error } = buildTripQuery(
    req.query
  );

  if (error) {
    return res.status(400).json({
      message: error
    });
  }

  try {
    const trips = await Trip
      .find(tripQuery)
      .sort({
        start: 1,
        name: 1
      })
      .exec();

    return res.status(200).json(trips);
  } catch (databaseError) {
    return sendDatabaseError(
      res,
      databaseError
    );
  }
};

// retrieve one trip using its code
const tripsFindByCode = async (req, res) => {
  try {
    const trip = await Trip
      .findOne({
        code: req.params.tripCode.toUpperCase()
      })
      .exec();

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

// add a trip after authentication and validation
const tripsAddTrip = async (req, res) => {
  const tripData = buildTripData(req.body);

  const validationError = validateTripData(
    tripData,
    true
  );

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

// update only fields sent by the admin
const tripsUpdateTrip = async (req, res) => {
  const tripData = buildTripData(
    req.body,
    false
  );

  const validationError = validateTripData(
    tripData,
    false
  );

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
    const trip = await Trip
      .findOneAndUpdate(
        {
          code: req.params.tripCode.toUpperCase()
        },
        tripData,
        {
          new: true,
          runValidators: true
        }
      )
      .exec();

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

// delete a trip after the route checks the admin jwt
const tripsDeleteTrip = async (req, res) => {
  try {
    const trip = await Trip
      .findOneAndDelete({
        code: req.params.tripCode.toUpperCase()
      })
      .exec();

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