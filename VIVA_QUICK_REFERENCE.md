# QUICK REFERENCE - VIVA CHEAT SHEET

## 🎯 1-LINE DEFINITIONS

**Node.js:** JavaScript runtime that lets you run JavaScript on servers (not just browsers)

**Express.js:** Lightweight framework built on Node.js for creating web servers and APIs

**NPM:** Node Package Manager - tool to install and manage project dependencies

**package.json:** Configuration file listing your project name, dependencies, and npm scripts

**Dependencies:** Packages needed for your app to work (express, mysql2, cors, body-parser)

**DevDependencies:** Packages only needed during development (nodemon)

**Nodemon:** Tool that automatically restarts your server when you save changes

**Middleware:** Functions that process requests before they reach route handlers

**REST API:** Architecture using HTTP methods (GET/POST/PUT/DELETE) to interact with server

**Routes:** URL paths that trigger specific functions (e.g., /api/doctors)

**Async/Await:** Modern way to handle operations that take time (like database queries)

---

## 🔧 NPM COMMANDS YOU USED

```bash
npm install              # Install all dependencies from package.json
npm start               # Run: node server.js (production)
npm run dev             # Run: nodemon server.js (development, auto-restart)
```

---

## 📦 YOUR DEPENDENCIES EXPLAINED

| Package | Purpose | Type |
|---------|---------|------|
| express | Web framework and routing | Dependency |
| mysql2 | Connect to MySQL database | Dependency |
| cors | Allow browser requests to server | Dependency |
| body-parser | Parse JSON request bodies | Dependency |
| nodemon | Auto-restart server on changes | DevDependency |

---

## 🚀 EXPRESS.JS BASICS

**Creating app:**
```javascript
const express = require('express');
const app = express();
const PORT = 3001;
```

**Middleware:**
```javascript
app.use(cors());                    // Allow cross-origin requests
app.use(bodyParser.json());         // Parse JSON
app.use(express.static(__dirname)); // Serve static files
```

**Routes:**
```javascript
app.get('/api/doctors', (req, res) => {
    // GET - retrieve data
    res.json(doctors);
});

app.post('/api/appointments', (req, res) => {
    // POST - create data
    res.json({ success: true });
});

app.put('/api/doctors/:id', (req, res) => {
    // PUT - update data
    res.json({ success: true });
});

app.delete('/api/doctors/:id', (req, res) => {
    // DELETE - remove data
    res.json({ success: true });
});
```

**Start server:**
```javascript
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## 💾 DATABASE (MySQL Connection Pool)

```javascript
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1122',
    database: 'medicare_db',
    connectionLimit: 10  // Max 10 simultaneous connections
});

// Using pool
const connection = await pool.getConnection();
const [result] = await connection.query('SELECT * FROM doctors');
connection.release();  // Return connection to pool
```

---

## 🔐 AUTHENTICATION FLOW

```
1. User logs in → POST /api/login
2. Server validates credentials
3. Returns token
4. Frontend stores in localStorage: adminToken
5. For admin operations, send token in Authorization header
6. Backend verifyToken middleware checks token
7. If valid → execute operation
8. If invalid → return 401 Unauthorized
```

**Sending token from frontend:**
```javascript
fetch(`${API_URL}/doctors`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
});
```

**Verifying token in backend:**
```javascript
function verifyToken(req, res, next) {
    const token = req.headers['authorization'].split(' ')[1];
    if (token === SECRET_KEY) {
        next();  // Continue
    } else {
        res.status(401).json({ message: 'Invalid token' });
    }
}
```

---

## 🔄 ASYNC/AWAIT PATTERN IN YOUR PROJECT

```javascript
app.get('/api/doctors/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();          // Wait for connection
        const [doctors] = await connection.query(               // Wait for query
            'SELECT * FROM doctors WHERE id = ?', 
            [req.params.id]
        );
        connection.release();
        res.json(doctors[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching doctor' });
    }
});
```

**Why async/await?**
- Database queries are slow (take time)
- Async prevents blocking other requests
- Code reads like synchronous code
- Easier error handling with try/catch

---

## 🌐 API ENDPOINTS (What you built)

| Method | URL | Purpose | Auth |
|--------|-----|---------|------|
| POST | /api/login | Admin login | ❌ |
| GET | /api/doctors | Get all doctors | ❌ |
| GET | /api/doctors/:id | Get one doctor | ❌ |
| POST | /api/doctors | Add doctor | ✅ |
| PUT | /api/doctors/:id | Update doctor | ✅ |
| DELETE | /api/doctors/:id | Delete doctor | ✅ |
| POST | /api/appointments | Book appointment | ❌ |
| GET | /api/appointments | Get appointments | ✅ |
| PUT | /api/appointments/:id | Update status | ✅ |
| DELETE | /api/appointments/:id | Delete appt | ✅ |

---

## 📊 HTTP STATUS CODES YOU USE

- **200** ✅ OK - Request successful
- **201** ✅ Created - Resource created
- **400** ❌ Bad Request - Invalid data
- **401** ❌ Unauthorized - No/invalid token
- **404** ❌ Not Found - Resource doesn't exist
- **500** ❌ Server Error - Internal error

---

## 🎯 NODEMON IN ACTION

**Without Nodemon (production mode):**
```
Edit file → Stop server (Ctrl+C) → Run node server.js → Continue testing
```

**With Nodemon (development mode):**
```
Edit file → Auto-detects change → Auto-restarts → Continue testing immediately
```

**In package.json:**
```json
{
  "scripts": {
    "start": "node server.js",      // No auto-restart
    "dev": "nodemon server.js"      // Auto-restart
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 🖥️ FRONTEND-BACKEND COMMUNICATION

**Frontend sends request (Fetch API):**
```javascript
const API_URL = 'http://localhost:3001/api';

fetch(`${API_URL}/doctors`, {
    method: 'GET'  // or POST, PUT, DELETE
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

**Backend receives and responds (Express):**
```javascript
app.get('/api/doctors', async (req, res) => {
    // Access data from frontend
    const data = req.body;
    const id = req.params.id;
    
    // Query database
    const doctors = await getFromDatabase();
    
    // Send response back to frontend
    res.json(doctors);
});
```

---

## 📋 PROJECT DATA FLOW

```
User Browser              HTTP                Express Server            MySQL Database
━━━━━━━━━━━━━━━━━        ━━━━━━━━━━━        ━━━━━━━━━━━━━━━━━        ━━━━━━━━━━━━━━━━
                      ← Request →
                   POST /api/login
(admin credentials)  ← Response ←       Validate credentials
                                        Return token

Frontend stores token in localStorage
                      ← Request →
                   GET /api/doctors
           (with Authorization header)  ← Response ←       Query database
                                         Return doctors
                                         JSON array
```

---

## ⚡ MIDDLEWARE EXPLAINED

**What is middleware?**
Functions that process requests before routes handle them

```javascript
app.use(cors());                              // Middleware 1
app.use(bodyParser.json());                   // Middleware 2
app.use(express.static(__dirname));           // Middleware 3

// These all run BEFORE route handlers
app.get('/api/doctors', (req, res) => {       // Route handler
    res.json(doctors);
});
```

**Order matters:**
```
Incoming Request
     ↓
CORS middleware ← checks if allowed
     ↓
Body Parser middleware ← converts JSON
     ↓
Static files middleware ← serves HTML/CSS/JS
     ↓
Route handler (e.g., GET /api/doctors)
     ↓
Response sent back
```

---

## 🔐 SECURITY FEATURES IN YOUR PROJECT

✅ **CORS:** Only certain origins can access API  
✅ **Token verification:** Admin operations require valid token  
✅ **Input validation:** Check required fields before database operation  
✅ **Error handling:** Don't expose database errors to users  
✅ **Try/catch:** Prevent app crash on errors  

---

## 🚀 HOW TO RUN PROJECT

```bash
# Step 1: Install dependencies
npm install

# Step 2: Make sure MySQL is running (localhost:3306)

# Step 3: Start server (development with auto-restart)
npm run dev

# Server runs on: http://localhost:3001
# Open in browser: http://localhost:3001/index.html
```

---

## 🎤 TOP 10 VIVA QUESTIONS & ANSWERS

**Q1: What is Express.js?**
A: Lightweight Node.js framework for building web applications and REST APIs

**Q2: Why use Nodemon?**
A: Automatically restarts server on file changes, speeds up development

**Q3: Difference between dependencies and devDependencies?**
A: Dependencies needed for app to run; devDependencies only for development

**Q4: How does authentication work?**
A: User logs in → gets token → sends token with admin requests → backend verifies

**Q5: What is middleware?**
A: Functions that process requests before route handlers (CORS, body-parser)

**Q6: Why async/await?**
A: Handles time-consuming operations (database queries) without blocking other requests

**Q7: What is connection pooling?**
A: Reuses database connections efficiently, handles multiple simultaneous requests

**Q8: How do GET and POST differ?**
A: GET retrieves data (no changes); POST creates new data (modifies state)

**Q9: What is CORS?**
A: Allows browser to send requests to backend server on different port

**Q10: How do you protect admin routes?**
A: Check token in verifyToken middleware before allowing operation

---

## 💡 REMEMBER THESE POINTS

✅ Express runs server on port 3001  
✅ MySQL database runs on port 3306  
✅ Frontend (browser) runs on http://localhost:3001  
✅ Nodemon auto-restarts server on changes  
✅ Token stored in localStorage, sent in Authorization header  
✅ Connection pool prevents "too many connections" error  
✅ Async/await used for database queries  
✅ Middleware processes requests before routes  
✅ API uses REST architecture (GET/POST/PUT/DELETE)  
✅ Always release connections back to pool  

**Good luck on your viva! 🎓**
