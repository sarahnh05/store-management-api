import express from 'express';
import { config } from 'dotenv';
import { connectDB, disconnectDB } from './config/db.js';

//import routes
import userRoutes from './routes/userRoutes.js';

config();
connectDB();

const app = express();

// API routes
app.use('/users', userRoutes);

const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});

// error handling db

// handle unhandled promise rejections (ex: db connection error)
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// handle uncaught exceptions
process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err);
  await disconnectDB();
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});

// http://localhost:3000/
