const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Setup Env variables
dotenv.config({ path: './config.env' });

/**
 *  HANDLE uncaught Exceptions
 */
process.on('uncaughtException', err => {
  console.log('uncaught Exception. The app is shutting down!');
  console.log(err, err.message);
  process.exit(1);
});

// Import the application
const app = require('./app');

// Connect to DataBase via Mongoose
const DBlocal = process.env.DATABASE_LOCAL;

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(con => {
    console.log('DB connection successful!');
  });

// Server Connection //////////////
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App runing on port ${port}...`);
});

/**
 *  HANDLE promise rejection
 */
process.on('unhandledRejection', err => {
  console.log('Unhandled Rejection. The App is shutting down!');
  console.log(err, err.message);
  process.close(server, () => {
    process.exit(1);
  });
});

/**
 *  HANDLE SIGTERM
 */
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM Received. App is shutting down');
  server.close(() => {
    console.log('💥 process terminated');
  });
});
