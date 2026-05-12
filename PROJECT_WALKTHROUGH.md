# PROJECT WALKTHROUGH & CODE EXPLANATION

## 📁 PROJECT STRUCTURE EXPLAINED

```
final project/
├── server.js              ← Main Express.js backend server
├── package.json           ← Dependencies and npm scripts
├── index.html            ← Home page landing
├── about.html            ← About us page
├── doctors.html          ← Display all doctors
├── appointments.html     ← Booking appointment form
├── contact.html          ← Contact page
├── admin.html            ← Admin dashboard
├── login.html            ← Admin login page
├── script.js             ← Frontend logic (doctors, appointments)
├── login.js              ← Login logic for admin
├── admin.js              ← Admin panel logic
├── style.css             ← All CSS styling
├── pictures/             ← Image files for doctors
├── README.md             ← Setup instructions
└── VIVA_PREPARATION.md  ← (New) Your viva notes
```

---

## 🎯 HOW EACH FILE WORKS

### 1. **server.js** - The Backend Engine

This is where Express.js runs and handles all requests.

**Key sections:**

#### Import modules:
```javascript
const express = require('express');          // Web framework
const mysql = require('mysql2/promise');     // MySQL driver
const cors = require('cors');                // Cross-origin requests
const bodyParser = require('body-parser');   // Parse request bodies

const app = express();
const PORT = 3001;
```

#### Middleware (processes every request):
```javascript
app.use(cors());                              // Allow requests from browser
app.use(bodyParser.json({ limit: '50mb' })); // Parse JSON (up to 50MB)
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data
app.use(express.static(__dirname));          // Serve static files
```

#### Database initialization:
```javascript
async function initializeDatabase() {
    // Creates database 'medicare_db' if doesn't exist
    // Creates 'doctors' table with columns:
    //   - id, name, specialty, email, phone, rating, image_url
    // Creates 'appointments' table with columns:
    //   - id, patient_name, email, phone, doctor_id, date, time, status
    // Inserts sample doctors
}
```

#### Authentication middleware:
```javascript
function verifyToken(req, res, next) {
    const token = req.headers['authorization'].split(' ')[1];
    
    // Only admin operations require this token
    // Non-admin routes don't use this
    
    if (token === SECRET_KEY) {
        next();  // Allow to continue
    } else {
        res.status(401).json({ message: 'Invalid token' });
    }
}
```

#### API Routes:

**PUBLIC (No token needed):**
- `POST /api/login` - Admin login
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get single doctor
- `POST /api/appointments` - Book appointment

**PROTECTED (Token required):**
- `POST /api/doctors` - Add doctor (admin only)
- `PUT /api/doctors/:id` - Update doctor (admin only)
- `DELETE /api/doctors/:id` - Delete doctor (admin only)
- `GET /api/appointments` - View appointments (admin only)
- `PUT /api/appointments/:id` - Change status (admin only)
- `DELETE /api/appointments/:id` - Delete appointment (admin only)

### 2. **package.json** - Project Configuration

```json
{
  "name": "wellconnect-appointment-system",
  "version": "1.0.0",
  "description": "Doctor Appointment Booking Website",
  "main": "server.js",
  
  "scripts": {
    "start": "node server.js",    // Production: No auto-restart
    "dev": "nodemon server.js"    // Development: Auto-restart
  },
  
  "dependencies": {
    "express": "^4.18.2",         // Web framework
    "mysql2": "^3.6.0",           // MySQL driver with promises
    "cors": "^2.8.5",             // Cross-origin requests
    "body-parser": "^1.20.2"      // Parse request bodies
  },
  
  "devDependencies": {
    "nodemon": "^3.0.1"           // Auto-restart on changes
  }
}
```

**What each dependency does in YOUR project:**
- **express:** Routes requests to different handlers
- **mysql2:** Connects to MySQL and runs queries
- **cors:** Lets browser on port 3000 communicate with server on 3001
- **body-parser:** Converts request body to JavaScript object
- **nodemon:** Watches files and restarts server on changes

### 3. **index.html** - Home Page

Frontend HTML structure. Contains:
- Header with navigation
- Hero section
- Information sections
- Buttons to book appointments or login as admin

**Links to:**
- style.css (styling)
- script.js (functionality)

### 4. **doctors.html** - Doctors Listing

Displays all doctors in a grid format.

**Uses:**
- script.js for fetching doctors from `/api/doctors`
- Displays doctor name, specialty, rating
- Clicking doctor shows more details

### 5. **appointments.html** - Booking Form

Form where patients book appointments.

**Form fields:**
```
- Patient Name
- Email
- Phone
- Select Doctor (populated from /api/doctors)
- Date (date picker)
- Time (time picker)
- Message (optional)
```

**On submit:**
- Sends POST request to `/api/appointments`
- Database stores appointment
- Shows success message

### 6. **login.html** - Admin Login

Simple login form for admin.

**Fields:**
- Username (should be: admin)
- Password (should be: admin123)
- Remember Me checkbox

**Process:**
1. User enters credentials
2. POST to `/api/login`
3. If valid: returns token, redirects to admin.html
4. If invalid: shows error

### 7. **admin.html** - Admin Dashboard

Full admin panel after login. Contains:
- Sidebar with navigation
- Appointments section (view/update/delete)
- Doctors management section (add/edit/delete)
- Statistics section
- Logout button

**Security:**
- Checks if token exists in localStorage
- If no token: redirects to login.html
- All admin operations send token

### 8. **script.js** - Main Frontend Logic

Runs on home, doctors, and appointments pages.

**Key functions:**

```javascript
const API_URL = 'http://localhost:3001/api';

// Load all doctors
async function loadDoctors() {
    try {
        const response = await fetch(`${API_URL}/doctors`);
        const doctors = await response.json();
        
        // Display doctors in grid
        displayDoctorsGrid(doctors);
        
        // Populate doctor dropdown
        populateDoctorSelect(doctors);
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

// Book appointment
async function bookAppointment(formData) {
    try {
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('Appointment booked successfully!');
            // Reset form
        } else {
            alert('Error booking appointment');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
```

### 9. **login.js** - Login Page Logic

Handles admin login authentication.

```javascript
// When admin submits login form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        // Send credentials to server
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save token
            localStorage.setItem('adminToken', data.token);
            
            // Redirect to admin panel
            window.location.href = 'admin.html';
        } else {
            alert('Invalid credentials');
        }
    } catch (error) {
        alert('Error connecting to server');
    }
});
```

### 10. **admin.js** - Admin Panel Logic

Manages all admin functionality.

**Key sections:**

```javascript
// Check if logged in
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
        // Not logged in, redirect to login
        window.location.href = 'login.html';
        return;
    }
    
    // Load admin data
    loadAppointments();
    loadDoctors();
});

// Send token with admin requests
async function loadAppointments() {
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/appointments`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (response.status === 401) {
        // Token invalid, logout
        logout();
        return;
    }
    
    const appointments = await response.json();
    displayAppointments(appointments);
}

// Update appointment status
async function updateAppointmentStatus(id, newStatus) {
    const token = localStorage.getItem('adminToken');
    
    await fetch(`${API_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
    });
}

// Add new doctor
async function addDoctor(doctorData) {
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/doctors`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(doctorData)
    });
    
    if (response.ok) {
        alert('Doctor added successfully!');
        loadDoctors();  // Refresh list
    }
}

// Logout
function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
}
```

### 11. **style.css** - All Styling

Contains all CSS for:
- Responsive layout
- Navigation styling
- Form styling
- Doctor cards
- Admin dashboard styling
- Colors, fonts, spacing

### 12. **pictures/** - Images Folder

Stores doctor profile images (currently not used but ready)

---

## 🔄 COMPLETE REQUEST FLOW - EXAMPLE

### Example 1: Patient Books Appointment

```
1. Patient visits http://localhost:3001/appointments.html
   └─ Browser loads appointments.html

2. HTML loads script.js
   └─ loadDoctors() function runs

3. Frontend sends: GET /api/doctors
   └─ Fetch API sends HTTP GET request to http://localhost:3001/api/doctors

4. Backend receives request in Express
   └─ Matches to: app.get('/api/doctors', async (req, res) => {})

5. Backend executes SQL query
   └─ pool.query('SELECT * FROM doctors')
   └─ Returns: [{id:1, name:'Dr. John', ...}, {id:2, name:'Dr. Sarah', ...}]

6. Backend responds with JSON
   └─ res.json(doctors)

7. Frontend receives response
   └─ response.json() parses JSON data

8. Frontend displays doctors
   └─ Populates dropdown: "Dr. John - General Practitioner"
   └─ Shows doctor grid

9. Patient fills form
   ├─ Name: John Smith
   ├─ Email: john@email.com
   ├─ Phone: 1234567890
   ├─ Doctor: Dr. John (id: 1)
   ├─ Date: 2024-05-20
   ├─ Time: 10:00

10. Patient clicks "Book Appointment"
    └─ Form submit handler runs

11. Frontend sends: POST /api/appointments
    └─ Body: {patient_name, email, phone, doctor_id, appointment_date, appointment_time}

12. Backend receives POST request
    └─ Matches to: app.post('/api/appointments', async (req, res) => {})

13. Backend validates data
    └─ Checks: patient_name, email, phone, doctor_id, date, time all present

14. Backend checks if doctor exists
    └─ Query: SELECT * FROM doctors WHERE id = 1

15. Backend inserts into database
    └─ INSERT INTO appointments (patient_name, email, phone, doctor_id, ...)
    └─ Database returns: insertId = 42

16. Backend responds
    └─ res.status(201).json({success: true, appointmentId: 42})

17. Frontend receives response
    └─ Shows: "Appointment booked successfully!"
    └─ Clears form

18. Database stores:
    ├─ Appointment ID: 42
    ├─ Patient: John Smith
    ├─ Email: john@email.com
    ├─ Doctor: 1 (Dr. John)
    ├─ Date: 2024-05-20
    ├─ Time: 10:00
    └─ Status: pending
```

### Example 2: Admin Approves Appointment

```
1. Admin visits http://localhost:3001/login.html

2. Admin enters:
   ├─ Username: admin
   └─ Password: admin123

3. Frontend sends: POST /api/login
   └─ Body: {username: "admin", password: "admin123"}

4. Backend receives and validates
   └─ if (username === "admin" && password === "admin123")

5. Backend responds
   └─ res.json({success: true, token: "your-secret-key-..."})

6. Frontend receives token
   └─ localStorage.setItem('adminToken', token)

7. Frontend redirects
   └─ window.location.href = 'admin.html'

8. admin.html loads admin.js

9. admin.js checks localStorage
   └─ const token = localStorage.getItem('adminToken')
   └─ Token exists, continue

10. admin.js sends: GET /api/appointments
    └─ Header: Authorization: Bearer your-secret-key-...

11. Backend receives request
    └─ verifyToken middleware runs
    └─ Extracts token from Authorization header
    └─ Compares: token === SECRET_KEY
    └─ If match: next() → execute route

12. Backend executes route handler
    └─ SELECT a.*, d.name FROM appointments a JOIN doctors d...
    └─ Returns all appointments with doctor names

13. Frontend receives appointments
    └─ Displays list of appointments
    └─ Shows buttons: Confirm, Cancel, Delete

14. Admin clicks "Confirm" for appointment 42

15. Frontend sends: PUT /api/appointments/42
    └─ Body: {status: "confirmed"}
    └─ Header: Authorization: Bearer token

16. Backend verifies token
    └─ Valid, continue

17. Backend updates database
    └─ UPDATE appointments SET status = "confirmed" WHERE id = 42

18. Database updated
    └─ Appointment 42 now has status = "confirmed"

19. Frontend updates display
    └─ Shows: "Status: Confirmed" ✓
```

---

## 💡 IMPORTANT CODE PATTERNS

### Pattern 1: Async Database Query

```javascript
app.get('/api/doctors', async (req, res) => {
    try {
        const connection = await pool.getConnection();     // Get connection from pool
        const [doctors] = await connection.query(          // Execute query (wait)
            'SELECT * FROM doctors'
        );
        connection.release();                              // Return connection to pool
        res.json(doctors);                                 // Send response
    } catch (error) {
        res.status(500).json({ error: 'Server error' });  // Handle error
    }
});
```

### Pattern 2: Protected Route with Token

```javascript
app.post('/api/doctors', verifyToken, async (req, res) => {
    // verifyToken middleware runs first
    // If token invalid: stops here, returns 401
    // If token valid: next() called, continues to this handler
    
    const { name, specialty } = req.body;
    
    // Insert into database
    const connection = await pool.getConnection();
    const [result] = await connection.query(
        'INSERT INTO doctors (name, specialty) VALUES (?, ?)',
        [name, specialty]
    );
    connection.release();
    
    res.status(201).json({ success: true });
});
```

### Pattern 3: Frontend Request with Error Handling

```javascript
async function fetchDoctors() {
    try {
        const response = await fetch(`${API_URL}/doctors`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const doctors = await response.json();
        displayDoctors(doctors);
        
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage('Failed to load doctors');
    }
}
```

### Pattern 4: Frontend Request with Token (Admin)

```javascript
async function fetchAppointments() {
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/appointments`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (response.status === 401) {
        // Token invalid or expired
        logout();
        return;
    }
    
    const appointments = await response.json();
    displayAppointments(appointments);
}
```

---

## 📊 DATABASE SCHEMA

### doctors table
```
┌─────────┬────────────┬──────────────────┐
│ Column  │ Type       │ Notes            │
├─────────┼────────────┼──────────────────┤
│ id      │ INT PRIMARY│ Auto increment   │
│ name    │ VARCHAR100 │ Doctor name      │
│ specialty│VARCHAR50  │ Medical specialty│
│ email   │ VARCHAR100 │ Contact email    │
│ phone   │ VARCHAR20  │ Phone number     │
│ rating  │ DECIMAL3.1 │ 1-5 stars        │
│ image   │ LONGTEXT   │ Base64 image     │
│ created │ TIMESTAMP  │ Auto timestamp   │
└─────────┴────────────┴──────────────────┘
```

### appointments table
```
┌──────────────┬────────────┬─────────────────────┐
│ Column       │ Type       │ Notes               │
├──────────────┼────────────┼─────────────────────┤
│ id           │ INT PRIMARY│ Auto increment      │
│ patient_name │ VARCHAR100 │ Patient's name      │
│ email        │ VARCHAR100 │ Patient's email     │
│ phone        │ VARCHAR20  │ Patient's phone     │
│ doctor_id    │ INT FK     │ Reference doctors   │
│ date         │ DATE       │ Appointment date    │
│ time         │ TIME       │ Appointment time    │
│ message      │ LONGTEXT   │ Additional notes    │
│ status       │ ENUM       │ pending/confirmed   │
│ created      │ TIMESTAMP  │ Auto timestamp      │
└──────────────┴────────────┴─────────────────────┘
```

---

## ✅ KEY TAKEAWAYS FOR VIVA

1. **Express.js** routes HTTP requests to handlers
2. **Nodemon** watches files and auto-restarts server during development
3. **NPM** installs and manages project dependencies
4. **package.json** lists what dependencies you need and what npm scripts do
5. **Middleware** processes requests before routes
6. **Async/await** handles time-consuming operations (database)
7. **Connection pool** reuses database connections efficiently
8. **Token authentication** secures admin-only operations
9. **Frontend sends requests** via Fetch API to Express backend
10. **Backend responds** with JSON data that frontend displays

You're ready to explain this project! 💪
