import express from 'express';
import { createBooking, getAllBookings } from '../controllers/bookingController.js';
import { validateBooking } from '../middleware/bookingvalidation.js';

const router = express.Router();

// POST /api/bookings - Create new booking
router.post('/bookings', validateBooking, createBooking);

// GET /api/bookings - Get all bookings (optional)
router.get('/bookings', getAllBookings);

export default router;