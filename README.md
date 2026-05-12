# WellConnect Doctor Appointment System - Setup Guide

## Prerequisites
Make sure you have the following installed:
- Node.js (v14 or higher) - https://nodejs.org/
- MySQL Server - https://www.mysql.com/downloads/
- A code editor (VS Code)

## Setup Instructions

### 1. Database Setup
- Install and start MySQL Server
- Open MySQL Command Line or MySQL Workbench
- Create a user and database:
  ```sql
  CREATE USER 'root'@'localhost' IDENTIFIED BY '';
  GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost';
  FLUSH PRIVILEGES;
  ```
  OR if you already have MySQL running with root user, just skip this step.

### 2. Install Node Dependencies
Open terminal in the project folder and run:
```bash
npm install
```

This will install:
- **express** - Web framework for Node.js
- **mysql2** - MySQL client for Node.js
- **cors** - Allow cross-origin requests
- **body-parser** - Parse request bodies
- **nodemon** - Auto-reload during development

### 3. Configure Database Connection
Open `server.js` and check the MySQL connection settings:
```javascript
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Change this if your MySQL has a password
    database: 'wellconnect_db',
    ...
});
```

If your MySQL password is different, change the `password` field.

### 4. Start the Server
Run one of these commands:

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
Server is running on http://localhost:3000
Database initialized successfully!
```

### 5. Access the Website
Open your browser and go to:
```
http://localhost:3000
```

## API Endpoints

The server provides the following REST API endpoints:

### Doctors
- **GET** `/api/doctors` - Get all doctors
- **GET** `/api/doctors/:id` - Get a specific doctor

### Appointments
- **GET** `/api/appointments` - Get all appointments
- **POST** `/api/appointments` - Create a new appointment
- **PUT** `/api/appointments/:id` - Update appointment status
- **DELETE** `/api/appointments/:id` - Delete an appointment

## Database Schema

### Doctors Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary Key |
| name | VARCHAR | Doctor's name |
| specialty | VARCHAR | Medical specialty |
| email | VARCHAR | Contact email |
| phone | VARCHAR | Contact phone |
| rating | DECIMAL | Rating (0-5) |
| created_at | TIMESTAMP | Record creation date |

### Appointments Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary Key |
| patient_name | VARCHAR | Patient's name |
| email | VARCHAR | Patient's email |
| phone | VARCHAR | Patient's phone |
| doctor_id | INT | Foreign Key to doctors |
| appointment_date | DATE | Appointment date |
| appointment_time | TIME | Appointment time |
| message | LONGTEXT | Patient message/symptoms |
| status | ENUM | pending/confirmed/cancelled |
| created_at | TIMESTAMP | Record creation date |

## Troubleshooting

### "connection refused" error
- Make sure MySQL Server is running
- Check if you're using the correct host, user, and password

### Port 3000 already in use
- Change the PORT in server.js to another port (e.g., 3001)

### CORS errors
- The server is already configured to allow CORS
- If issues persist, check that the API_URL in script.js matches your server URL

## Project Structure
```
final project/
├── index.html          # Main HTML file
├── style.css           # Styling
├── script.js           # Frontend JavaScript
├── server.js           # Express server
├── package.json        # Node dependencies
└── README.md          # This file
```

## Features
✓ View all available doctors with specialties and ratings
✓ Book appointments with doctors
✓ Automatic database creation
✓ Persistent data storage in MySQL
✓ RESTful API endpoints
✓ Form validation
✓ Responsive design

Enjoy using WellConnect!
