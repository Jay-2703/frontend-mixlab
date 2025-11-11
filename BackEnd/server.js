import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

//import files
import bookingRoutes from './routes/bookingRoutes.js'; //booking
import authRoutes from './routes/authRoutes.js'; // authentication
import adminRoutes from './routes/adminRoutes.js'; //admin
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'; //error handling 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', bookingRoutes); //booking
app.use('/api/auth', authRoutes); // Register,Login,forgotpass
app.use('/api/admin', adminRoutes); //admin


// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});