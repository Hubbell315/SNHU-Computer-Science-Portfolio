// bring in the database connection and trip schema
const Mongoose = require('./db');
const Trip = require('./travlr');
const { normalizeTripValues } = require('./trip-values');

const fs = require('fs');

// read the original trip data
const trips = JSON.parse(
  fs.readFileSync('./data/trips.json', 'utf8')
);

// add the numeric and normalized database fields
const normalizedTrips = trips.map((trip) => ({
  ...trip,
  ...normalizeTripValues(trip)
}));

// delete existing records and insert the seed data
const seedDB = async () => {
  await Trip.deleteMany({});
  await Trip.insertMany(normalizedTrips);
};

// close the database connection when seeding finishes
seedDB()
  .then(async () => {
    await Mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('database seed failed', error.message);
    await Mongoose.connection.close();
    process.exit(1);
  });