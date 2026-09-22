const mongoose = require('mongoose');
const readLine = require('readline');

// use a full connection string if one exists otherwise use local mongodb
const dbURI = process.env.MONGODB_URI ||
  `mongodb://${process.env.DB_HOST || '127.0.0.1'}/travlr`;

// require mongoose queries to match schema fields
mongoose.set('strictQuery', true);

// connect to mongodb and show a useful error if it is not available
const connect = async () => {
  try {
    await mongoose.connect(dbURI, {
      serverSelectionTimeoutMS: 5000
    });
  } catch (error) {
    console.error('mongoose connection error', error.message);
  }
};

// connection event logging
mongoose.connection.on('connected', () => {
  console.log('mongoose connected successfully');
});

mongoose.connection.on('error', (error) => {
  console.error('mongoose connection error', error.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('mongoose disconnected');
});

// allow ctrl c to work correctly on windows
if (process.platform === 'win32') {
  const readlineInterface = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readlineInterface.on('SIGINT', () => {
    process.emit('SIGINT');
  });
}

// close mongodb before the node process exits
const gracefulShutdown = async (message) => {
  try {
    await mongoose.connection.close();
    console.log(`mongoose disconnected through ${message}`);
  } catch (error) {
    console.error('error while disconnecting mongoose', error.message);
  }
};

// handle nodemon restarts app exits and container shutdowns
process.once('SIGUSR2', async () => {
  await gracefulShutdown('nodemon restart');
  process.kill(process.pid, 'SIGUSR2');
});

process.once('SIGINT', async () => {
  await gracefulShutdown('application termination');
  process.exit(0);
});

process.once('SIGTERM', async () => {
  await gracefulShutdown('container termination');
  process.exit(0);
});

// start the database connection and load the trip schema
connect();

require('./travlr');

module.exports = mongoose;