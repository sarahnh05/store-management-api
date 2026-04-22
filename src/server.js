import express from 'express';
import { config } from 'dotenv';
import { connectDB, disconnectDB } from './config/db.js';

//import routes
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';

config();
connectDB();

const app = express();

// body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// API routes
app.use('/orders', orderRoutes);
app.use('/products', productRoutes);
app.use('/auth', authRoutes);

const PORT = 5000;
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
