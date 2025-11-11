import { connectToDatabase } from '../config/db.js'; // Update path to your db file


const createBooking = async (req, res) => {

  try {
    const { name, date, hours } = req.body;
    const db = await connectToDatabase();

    // Insert booking into database
    const [result] = await db.query(
      'INSERT INTO bookings (name, date, hours) VALUES (?, ?, ?)',
      [name, date, parseInt(hours)]
    );

    res.status(201).json({
      message: 'Booking request submitted successfully! We will contact you soon.',
      bookingId: result.insertId
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ 
      message: 'Failed to submit booking. Please try again.' 
    });
  }
};

// Optional: Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [bookings] = await db.query(
      'SELECT * FROM bookings ORDER BY created_at DESC'
    );
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

export { createBooking, getAllBookings };

