import express from 'express';

//import routes
import userRoutes from './routes/userRoutes.js';

const app = express();

// API routes
app.use('/users', userRoutes);

const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});

// http://localhost:3000/
