// run from the project root
// node app_api/models/migrate-trip-values.js
// add --apply only after reviewing the dry run

require('dotenv').config();

const mongoose = require('mongoose');
const Trip = require('./travlr');

const {
  normalizeTripValues
} = require('./trip-values');

async function migrate() {
  const uri =
    process.env.MONGODB_URI ||
    `mongodb://${process.env.DB_HOST || '127.0.0.1'}/travlr`;

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });

  try {
    // read the original fields and any existing derived values
    const records = await Trip.collection
      .find(
        {},
        {
          projection: {
            code: 1,
            perPerson: 1,
            length: 1,
            resort: 1,
            priceCents: 1,
            durationDays: 1,
            resortSearch: 1
          }
        }
      )
      .toArray();

    // validate every trip before changing any records
    const changes = records
      .map((record) => {
        try {
          return {
            record,
            values: normalizeTripValues(record)
          };
        } catch (error) {
          throw new Error(
            `trip ${record.code || record._id}: ${error.message}`
          );
        }
      })
      .filter(({ record, values }) =>
        Object.keys(values).some(
          (key) => record[key] !== values[key]
        )
      );

    console.log(
      `${records.length} trips checked, ${changes.length} need updates`
    );

    if (!process.argv.includes('--apply')) {
      console.log(
        'dry run only, use --apply to update existing trips'
      );
      return;
    }

    if (changes.length > 0) {
      await Trip.collection.bulkWrite(
        changes.map(({ record, values }) => ({
          updateOne: {
            filter: { _id: record._id },
            update: { $set: values }
          }
        }))
      );
    }

    await Trip.createIndexes();

    console.log('trip values and indexes updated');
  } finally {
    await mongoose.disconnect();
  }
}

migrate().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});