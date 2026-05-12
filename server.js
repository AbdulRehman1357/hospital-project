const express = require('express');
const mysql = require('mysql2/promise');

const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// const PORT = 3001;
const PORT = process.env.PORT || 3001;


// Admin credentials (in production, use a database)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const SECRET_KEY = 'your-secret-key-change-this-in-production';


// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });
const path = require('path');
// Use createPool instead of createConnection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise(); // Using .promise() makes the code cleaner

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection Pool
let pool;

// Simple JWT-like token verification
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Simple token verification (in production, use a proper JWT library)
    if (token === SECRET_KEY) {
        next();
    } else {
        res.status(401).json({ message: 'Invalid token' });
    }
}

// Initialize Database
async function initializeDatabase() {
    try {
        // Create a temporary connection to create the database
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '1122'
        });

        // Create database if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS medicare_db');
        console.log('Database medicare_db created/verified');
        await connection.end();

        // Now create the pool connected to the database
        pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '1122',
            database: 'medicare_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        const poolConnection = await pool.getConnection();

        // Create Doctors table
        await poolConnection.query(`
            CREATE TABLE IF NOT EXISTS doctors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                specialty VARCHAR(50) NOT NULL,
                email VARCHAR(100),
                phone VARCHAR(20),
                rating DECIMAL(3,1),
                image_url LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Add image_url column if it doesn't exist
        try {
            await poolConnection.query(`ALTER TABLE doctors ADD COLUMN image_url LONGTEXT`);
        } catch (error) {
            // Column might already exist, ignore error
        }

        // Create Appointments table
        await poolConnection.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                patient_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                doctor_id INT NOT NULL,
                appointment_date DATE NOT NULL,
                appointment_time TIME NOT NULL,
                message LONGTEXT,
                status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (doctor_id) REFERENCES doctors(id)
            )
        `);

        // Insert sample doctors if they don't exist
        await poolConnection.query(`
            INSERT IGNORE INTO doctors (id, name, specialty, rating) VALUES
            (1, 'John Smith', 'General Practitioner', 4.9),
            (2, 'Sarah Johnson', 'Cardiologist', 4.8),
            (3, 'Michael Brown', 'Pediatrician', 4.7),
            (4, 'Emily Davis', 'Dermatologist', 4.6),
            (5, 'Robert Wilson', 'Orthopedic Surgeon', 4.9),
            (6, 'Lisa Anderson', 'Dentist', 4.5)
        `);

        poolConnection.release();
        console.log('Database initialized successfully!');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// API Routes

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        res.json({
            success: true,
            message: 'Login successful',
            token: SECRET_KEY,
            username: username
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Get all doctors
app.get('/api/doctors', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [doctors] = await connection.query('SELECT * FROM doctors');
        connection.release();
        res.json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ error: 'Error fetching doctors' });
    }
});

// Get single doctor
app.get('/api/doctors/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [doctors] = await connection.query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
        connection.release();

        if (doctors.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        res.json(doctors[0]);
    } catch (error) {
        console.error('Error fetching doctor:', error);
        res.status(500).json({ error: 'Error fetching doctor' });
    }
});

// Create doctor
app.post('/api/doctors', verifyToken, async (req, res) => {
    const { name, specialty, email, phone, rating, image_url } = req.body;

    // Validation
    if (!name || !specialty) {
        return res.status(400).json({ error: 'Name and specialty are required' });
    }

    try {
        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'INSERT INTO doctors (name, specialty, email, phone, rating, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [name, specialty, email || null, phone || null, rating || null, image_url || null]
        );

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Doctor added successfully!',
            doctorId: result.insertId
        });
    } catch (error) {
        console.error('Error creating doctor:', error);
        res.status(500).json({ error: 'Error creating doctor' });
    }
});

// Update doctor
app.put('/api/doctors/:id', verifyToken, async (req, res) => {
    const { name, specialty, email, phone, rating, image_url } = req.body;

    // Validation
    if (!name || !specialty) {
        return res.status(400).json({ error: 'Name and specialty are required' });
    }

    try {
        const connection = await pool.getConnection();

        // Check if doctor exists
        const [doctorCheck] = await connection.query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
        if (doctorCheck.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Update doctor
        await connection.query(
            'UPDATE doctors SET name = ?, specialty = ?, email = ?, phone = ?, rating = ?, image_url = ? WHERE id = ?',
            [name, specialty, email || null, phone || null, rating || null, image_url || null, req.params.id]
        );

        connection.release();

        res.json({ success: true, message: 'Doctor updated successfully!' });
    } catch (error) {
        console.error('Error updating doctor:', error);
        res.status(500).json({ error: 'Error updating doctor' });
    }
});

// Delete doctor
app.delete('/api/doctors/:id', verifyToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        // Check if doctor exists
        const [doctorCheck] = await connection.query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
        if (doctorCheck.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Delete doctor
        await connection.query('DELETE FROM doctors WHERE id = ?', [req.params.id]);
        connection.release();

        res.json({ success: true, message: 'Doctor deleted successfully!' });
    } catch (error) {
        console.error('Error deleting doctor:', error);
        res.status(500).json({ error: 'Error deleting doctor' });
    }
});

// Create appointment
app.post('/api/appointments', async (req, res) => {
    const { patient_name, email, phone, doctor_id, appointment_date, appointment_time, message } = req.body;

    // Validation
    if (!patient_name || !email || !phone || !doctor_id || !appointment_date || !appointment_time) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const connection = await pool.getConnection();

        // Check if doctor exists
        const [doctorCheck] = await connection.query('SELECT * FROM doctors WHERE id = ?', [doctor_id]);
        if (doctorCheck.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Doctor not found' });
        }

        // Insert appointment
        const [result] = await connection.query(
            'INSERT INTO appointments (patient_name, email, phone, doctor_id, appointment_date, appointment_time, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [patient_name, email, phone, doctor_id, appointment_date, appointment_time, message || '']
        );

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully!',
            appointmentId: result.insertId
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Error creating appointment' });
    }
});
// app.get('/', (req, res) => {
//     res.send('Hospital System API is Live and Running!');
// });

// Get all appointments
app.get('/api/appointments', verifyToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [appointments] = await connection.query(`
            SELECT a.*, d.name as doctor_name, d.specialty 
            FROM appointments a 
            JOIN doctors d ON a.doctor_id = d.id 
            ORDER BY a.appointment_date DESC
        `);
        connection.release();
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Error fetching appointments' });
    }
});

// Update appointment status
app.put('/api/appointments/:id', verifyToken, async (req, res) => {
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const connection = await pool.getConnection();
        await connection.query('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]);
        connection.release();

        res.json({ success: true, message: 'Appointment updated successfully!' });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Error updating appointment' });
    }
});

// Delete appointment
app.delete('/api/appointments/:id', verifyToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
        connection.release();

        res.json({ success: true, message: 'Appointment deleted successfully!' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ error: 'Error deleting appointment' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Start server
// app.listen(PORT, async () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
//     await initializeDatabase();
// });
