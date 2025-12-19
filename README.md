# Event Management System

A full-stack web application for managing events, user registrations, and administrative tasks. Built with Express.js backend and vanilla JavaScript frontend.

---

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework for Node.js
- **SQLite** - Lightweight, file-based relational database
- **JWT (JSON Web Tokens)** - Stateless authentication mechanism
- **bcryptjs** - Password hashing library
- **CORS** - Cross-Origin Resource Sharing middleware

### Frontend
- **HTML5** - Markup language for structure
- **CSS3** - Styling (with Tailwind CSS via CDN)
- **Vanilla JavaScript (ES6+)** - Client-side logic with ES6 modules
- **Tailwind CSS** - Utility-first CSS framework (via CDN)

---

## Frontend Architecture

The frontend is built using vanilla JavaScript with ES6 modules, providing a modern development experience without build tools.

### Project Structure

```
frontend/
├── index.html          # Landing page with login/register forms
├── dashboard.html      # User dashboard for browsing and registering events
├── admin.html          # Admin dashboard for event management
├── css/
│   └── styles.css      # Custom CSS styles and animations
└── js/
    ├── api.js          # Centralized API client with authentication
    ├── auth.js         # Authentication logic and form handling
    ├── userDashboard.js # User dashboard functionality
    └── adminDashboard.js # Admin dashboard functionality
```

### File-by-File Breakdown

#### `index.html`
The entry point of the application. Contains:
- **Login Form**: Username and password fields for existing users
- **Register Form**: Username, email, password, and confirm password fields
- **Form Toggle**: Switch between login and registration views
- **Admin Credentials Hint**: Displays default admin login info
- **Module Scripts**: Imports `auth.js` to handle form submissions

**Key Features:**
- Client-side form validation
- Error message display
- Responsive design with Tailwind CSS
- Automatic redirect after successful authentication

#### `dashboard.html`
The main user interface after login. Contains:
- **Header**: User welcome message and logout button
- **My Registered Events Section**: Shows events the user has registered for
- **All Events Section**: Grid layout of all available events
- **Category Filter**: Dropdown to filter events by category (conference, seminar, social)
- **Event Cards**: Display event details with register/cancel buttons

**Key Features:**
- Real-time event listing with capacity tracking
- Category-based filtering
- Registration and cancellation functionality
- Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)

#### `admin.html`
Administrative interface for managing events. Contains:
- **Event Creation/Edit Form**: Form to create or update events
- **Events Table**: All events with registration counts
- **Registration Modal**: View all users registered for a specific event
- **Action Buttons**: Edit, delete, and view registrations for each event

**Key Features:**
- Full CRUD operations for events
- Registration management per event
- Modal popup for viewing registrations
- Form pre-population for editing

#### `css/styles.css`
Custom styles that complement Tailwind CSS:
- Custom scrollbar styling
- Loading animations
- Fade-in animations
- Button hover effects
- Responsive table styles

#### `js/api.js`
Centralized API client module. Provides:

**Token Management:**
- `getToken()` - Retrieves JWT from localStorage
- `setToken(token)` - Stores JWT in localStorage
- `removeToken()` - Clears JWT from localStorage

**User Management:**
- `getCurrentUser()` - Gets current user from localStorage
- `setCurrentUser(user)` - Stores user info in localStorage
- `removeCurrentUser()` - Clears user info

**API Request Function:**
- `apiRequest(endpoint, options)` - Generic fetch wrapper that:
  - Automatically adds JWT token to Authorization header
  - Handles JSON serialization
  - Provides consistent error handling

**API Modules:**
- `authAPI` - Authentication endpoints (register, login, logout, getMe)
- `eventsAPI` - Event CRUD operations (getAll, getById, create, update, delete)
- `registrationsAPI` - Registration management (getMyEvents, register, cancel, getEventRegistrations)

**Why This Approach:**
- Single source of truth for API calls
- Automatic token injection
- Consistent error handling
- Easy to maintain and update

#### `js/auth.js`
Authentication logic module. Provides:

**Functions:**
- `isAuthenticated()` - Checks if user is logged in
- `isAdmin()` - Checks if current user is an admin
- `redirectByRole()` - Redirects users to appropriate dashboard based on role
- `handleLogin(event)` - Processes login form submission
- `handleRegister(event)` - Processes registration form submission
- `handleLogout()` - Clears authentication and redirects to login
- `toggleAuthForm()` - Switches between login and register forms

**How It Works:**
1. Form submission triggers handler function
2. Validates input fields
3. Calls appropriate API endpoint via `api.js`
4. On success, stores token and user info in localStorage
5. Redirects to appropriate dashboard (user or admin)

#### `js/userDashboard.js`
User dashboard functionality. Provides:

**Main Functions:**
- `initDashboard()` - Initializes dashboard on page load
- `loadEvents()` - Fetches all events from API
- `loadMyEvents()` - Fetches user's registered events
- `renderEvents()` - Renders event cards in the grid
- `renderMyEvents()` - Renders user's registered events
- `handleRegister(eventId)` - Registers user for an event
- `handleCancel(eventId)` - Cancels user's event registration

**Event Card Features:**
- Displays title, description, category, date, time, location
- Shows registration count and remaining spots
- Dynamic button states (Register/Registered/Full)
- Category badges with color coding

**State Management:**
- Maintains `allEvents` and `myEvents` arrays
- Updates UI reactively when registrations change
- Handles loading and error states

#### `js/adminDashboard.js`
Admin dashboard functionality. Provides:

**Main Functions:**
- `initAdminDashboard()` - Initializes admin dashboard
- `loadEvents()` - Fetches all events for the table
- `renderEvents()` - Renders events in table format
- `handleCreateEvent(event)` - Creates or updates an event
- `editEvent(event)` - Populates form with event data for editing
- `deleteEvent(eventId)` - Deletes an event (with confirmation)
- `viewRegistrations(eventId)` - Shows all registrations for an event

**Form Handling:**
- Single form for both create and update operations
- Tracks `editingEventId` to determine operation mode
- Validates all required fields
- Updates form title and button text based on mode

**Registration Modal:**
- Displays event title and registration count
- Lists all registered users with their details
- Shows registration timestamp

---

## Backend Architecture

The backend follows a clean MVC-like architecture with separation of concerns.

### Project Structure

```
backend/
├── src/
│   ├── controllers/        # Business logic handlers
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   └── registrationController.js
│   ├── routes/             # API route definitions
│   │   ├── auth.js
│   │   ├── events.js
│   │   └── registrations.js
│   ├── utils/              # Utility functions and middleware
│   │   ├── database.js     # Database connection and schema
│   │   ├── auth.js         # JWT authentication middleware
│   │   ├── admin.js        # Admin authorization middleware
│   │   └── password.js     # Password hashing utilities
│   └── server.js           # Express app entry point
├── events.db               # SQLite database file
└── package.json
```

### File-by-File Breakdown

#### `server.js`
The main entry point of the Express application.

**What It Does:**
1. **Imports Dependencies**: Express, CORS, dotenv, database initialization, and route modules
2. **Loads Environment Variables**: Reads `.env` file for configuration
3. **Creates Express App**: Initializes Express application instance
4. **Configures Middleware**:
   - CORS: Allows frontend to make requests from different origin
   - JSON Parser: Parses JSON request bodies
   - URL Encoded Parser: Parses form data
5. **Registers Routes**: Mounts API route handlers
6. **Error Handling**: Global error handler middleware
7. **Starts Server**: Initializes database and starts listening on port 3000

**Key Code Flow:**
```javascript
dotenv.config() → Express app → Middleware → Routes → Error Handler → Database Init → Server Start
```

#### `utils/database.js`
Database connection and schema management.

**What It Does:**
1. **Creates Database Connection**: Connects to SQLite database file
2. **Promisifies Database Methods**: Converts callback-based SQLite methods to Promises
   - `dbRun()` - Execute INSERT, UPDATE, DELETE queries
   - `dbGet()` - Execute SELECT query returning single row
   - `dbAll()` - Execute SELECT query returning multiple rows
3. **Initializes Schema**: Creates tables if they don't exist
4. **Creates Admin User**: Automatically creates admin account on first run

**Database Schema:**

**users table:**
- `id` - Primary key (auto-increment)
- `username` - Unique username
- `email` - Unique email address
- `password_hash` - Hashed password (bcrypt)
- `role` - User role ('user' or 'admin')
- `created_at` - Timestamp

**events table:**
- `id` - Primary key (auto-increment)
- `title` - Event title
- `description` - Event description
- `category` - Event category (conference, seminar, social)
- `date` - Event date
- `time` - Event time
- `location` - Event location
- `capacity` - Maximum participants
- `created_by` - Foreign key to users table (admin who created it)
- `created_at` - Timestamp

**registrations table:**
- `id` - Primary key (auto-increment)
- `user_id` - Foreign key to users table
- `event_id` - Foreign key to events table
- `registered_at` - Timestamp
- Unique constraint on (user_id, event_id) - prevents duplicate registrations

**Why Promisify?**
SQLite3 uses callbacks, but modern JavaScript uses Promises/async-await. Promisifying makes the code cleaner and easier to work with.

#### `utils/password.js`
Password hashing utilities using bcrypt.

**Functions:**
- `hashPassword(password)` - Hashes a plain text password
- `comparePassword(password, hash)` - Compares plain text password with hash

**How Password Hashing Works:**

1. **Hashing Process:**
   ```javascript
   const hash = await bcrypt.hash('plainPassword', 10);
   // Result: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
   ```

2. **What Happens:**
   - bcrypt generates a random salt (unique per password)
   - Combines salt with password
   - Runs through bcrypt algorithm multiple times (10 rounds = 2^10 iterations)
   - Produces a fixed-length hash string

3. **Why Hash Passwords?**
   - **Security**: Even if database is compromised, passwords can't be reversed
   - **Salt**: Each password gets unique salt, so same password produces different hashes
   - **Slow Algorithm**: bcrypt is intentionally slow to prevent brute force attacks

4. **Verification Process:**
   ```javascript
   const isValid = await bcrypt.compare('plainPassword', hash);
   // bcrypt extracts salt from hash and compares
   ```

5. **Salt Rounds (10):**
   - Higher rounds = more secure but slower
   - 10 rounds = good balance (takes ~100ms to hash)
   - Each round doubles the computation time

#### `utils/auth.js`
JWT authentication middleware.

**Functions:**
- `authenticateToken(req, res, next)` - Verifies JWT token and attaches user to request

**How JWT Authentication Works:**

1. **Token Structure:**
   ```
   Header.Payload.Signature
   ```
   - Header: Algorithm and token type
   - Payload: User data (id, username, email, role)
   - Signature: Encrypted hash of header + payload + secret

2. **Token Generation (in authController):**
   ```javascript
   const token = jwt.sign(
     { id: user.id, username: user.username, role: user.role },
     process.env.JWT_SECRET,
     { expiresIn: '24h' }
   );
   ```

3. **Token Verification (in middleware):**
   - Extracts token from `Authorization: Bearer <token>` header
   - Verifies signature using JWT_SECRET
   - Checks expiration
   - If valid, attaches user data to `req.user`
   - If invalid, returns 403 error

4. **Why JWT?**
   - **Stateless**: No need to store sessions on server
   - **Scalable**: Works across multiple servers
   - **Self-contained**: User info embedded in token
   - **Secure**: Tampering is detectable via signature

#### `utils/admin.js`
Admin authorization middleware.

**Functions:**
- `requireAdmin(req, res, next)` - Ensures user is an admin

**How It Works:**
1. First calls `authenticateToken` to verify user is logged in
2. Checks if `req.user.role === 'admin'`
3. If not admin, returns 403 Forbidden
4. If admin, proceeds to next middleware/controller

**Why Separate Middleware?**
- Separation of concerns: authentication vs authorization
- Reusable: Can be applied to any admin route
- Clear intent: Makes code more readable

#### `routes/auth.js`
Authentication route definitions.

**Routes:**
- `POST /api/auth/register` - User registration (public)
- `POST /api/auth/login` - User/admin login (public)
- `GET /api/auth/me` - Get current user info (protected)

**What Routes Do:**
Routes define the URL endpoints and map them to controller functions. They're like a table of contents for your API.

**Route Structure:**
```javascript
router.post('/register', register);  // POST /api/auth/register → register function
router.post('/login', login);        // POST /api/auth/login → login function
router.get('/me', authenticateToken, getMe);  // GET /api/auth/me → getMe (with auth)
```

**Middleware in Routes:**
- `authenticateToken` - Applied before `getMe` to ensure user is logged in
- Middleware runs in order: request → middleware → controller → response

#### `routes/events.js`
Event management routes.

**Routes:**
- `GET /api/events` - Get all events (public, with optional category filter)
- `GET /api/events/:id` - Get single event (public)
- `GET /api/events/category/:category` - Get events by category (public)
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

**Route Parameters:**
- `:id` and `:category` are dynamic parameters
- Accessed via `req.params.id` and `req.params.category` in controllers

**Admin Protection:**
- Admin routes use `requireAdmin` middleware
- This middleware internally calls `authenticateToken`, so no need to add it separately

#### `routes/registrations.js`
Registration management routes.

**Routes:**
- `GET /api/registrations/my-events` - Get user's registered events (protected)
- `POST /api/registrations/:eventId` - Register for event (protected)
- `DELETE /api/registrations/:eventId` - Cancel registration (protected)
- `GET /api/registrations/event/:eventId` - Get all registrations for event (admin only)

#### `controllers/authController.js`
Authentication business logic.

**Functions:**

1. **register(req, res)**
   - Validates input (username, email, password required)
   - Checks if user already exists
   - Hashes password using bcrypt
   - Creates user in database
   - Generates JWT token
   - Returns token and user info

2. **login(req, res)**
   - Validates input (username, password required)
   - Finds user in database
   - Compares password with hash
   - Generates JWT token
   - Returns token and user info

3. **getMe(req, res)**
   - Uses `req.user` from authentication middleware
   - Fetches full user details from database
   - Returns user info

**Error Handling:**
- 400 Bad Request: Missing/invalid input
- 401 Unauthorized: Invalid credentials
- 500 Internal Server Error: Database/server errors

#### `controllers/eventController.js`
Event management business logic.

**Functions:**

1. **getAllEvents(req, res)**
   - Fetches all events from database
   - Joins with registrations to count participants
   - Calculates remaining spots (capacity - registered)
   - Optional category filtering via query parameter
   - Returns events array

2. **getEventById(req, res)**
   - Fetches single event by ID
   - Gets registration count
   - Calculates remaining spots
   - Returns event object

3. **createEvent(req, res)**
   - Validates all required fields
   - Creates event in database
   - Sets `created_by` to admin's user ID
   - Returns created event

4. **updateEvent(req, res)**
   - Validates event exists
   - Updates only provided fields (partial update)
   - Returns updated event

5. **deleteEvent(req, res)**
   - Validates event exists
   - Deletes all registrations first (cascade)
   - Deletes event
   - Returns success message

**SQL Joins:**
```sql
SELECT e.*, COUNT(r.id) as registered_count
FROM events e
LEFT JOIN registrations r ON e.id = r.event_id
GROUP BY e.id
```
- LEFT JOIN ensures events with no registrations are included
- COUNT counts registrations per event
- GROUP BY groups results by event

#### `controllers/registrationController.js`
Registration business logic.

**Functions:**

1. **getMyEvents(req, res)**
   - Uses `req.user.id` from authentication
   - Joins registrations with events
   - Returns events user has registered for

2. **registerForEvent(req, res)**
   - Validates event exists
   - Checks if already registered (prevents duplicates)
   - Checks capacity (can't register if full)
   - Creates registration record
   - Returns success message

3. **cancelRegistration(req, res)**
   - Validates registration exists
   - Checks event date (can't cancel past events)
   - Deletes registration record
   - Returns success message

4. **getEventRegistrations(req, res)**
   - Admin only function
   - Joins registrations with users
   - Returns all users registered for an event
   - Includes registration timestamp

**Business Logic:**
- Capacity enforcement: Prevents overbooking
- Duplicate prevention: Unique constraint on (user_id, event_id)
- Date validation: Can't cancel past events

### Understanding Routes vs Controllers

**Routes (routes/):**
- **Purpose**: Define URL endpoints and HTTP methods
- **Responsibility**: Route matching and middleware application
- **Location**: `routes/` directory
- **Example**: "When someone POSTs to /api/auth/register, call the register function"

**Controllers (controllers/):**
- **Purpose**: Handle business logic and database operations
- **Responsibility**: Process requests, interact with database, send responses
- **Location**: `controllers/` directory
- **Example**: "Take registration data, validate it, hash password, save to database, return response"

**Why Separate?**
- **Separation of Concerns**: Routes handle routing, controllers handle logic
- **Reusability**: Same controller function can be used by multiple routes
- **Testability**: Can test controllers independently
- **Maintainability**: Easier to find and modify code

**Flow:**
```
Client Request → Express → Route (matches URL) → Middleware (auth/admin) → Controller (business logic) → Database → Response
```

---

## How to Run the Project

### Prerequisites
- **Node** installed
- A web browser
- A code editor (optional)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This installs all packages listed in `package.json`:
   - express
   - sqlite3
   - jsonwebtoken
   - bcryptjs
   - cors
   - dotenv

3. **Create `.env` file (optional):**
   ```bash
   # Create .env file in backend directory
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   FRONTEND_URL=http://localhost:5500
   ```
   **Note:** If `.env` is not created, the app uses default values. However, JWT_SECRET must be set for authentication to work.

4. **Start the server:**
   ```bash
   npm start
   ```
   
   You should see:
   ```
   Connected to SQLite database
   Admin user created: username=admin, password=admin123
   Database initialized successfully
   Server running on http://localhost:3000
   Admin credentials: username=admin, password=admin123
   ```

5. **Verify server is running:**
   - Open browser and visit: `http://localhost:3000/api/health`
   - You should see: `{"status":"ok","message":"Event Management API is running"}`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Start a local web server:**

   **Option A: Using Python (if installed):**
   ```bash
   python -m http.server 5500
   ```

   **Option B: Using Node.js http-server:**
   ```bash
   npx http-server -p 5500
   ```

   **Option C: Using VS Code Live Server:**
   - Install "Live Server" extension
   - Right-click on `index.html`
   - Select "Open with Live Server"

3. **Open in browser:**
   - Navigate to: `http://localhost:5500`
   - You should see the login page

### Testing the Application

1. **Test User Registration:**
   - Click "Register" link
   - Fill in username, email, password
   - Submit form
   - Should redirect to user dashboard

2. **Test Admin Login:**
   - Use credentials: `admin` / `admin123`
   - Should redirect to admin dashboard

3. **Test Event Creation (Admin):**
   - Login as admin
   - Fill in event creation form
   - Submit
   - Event should appear in the table

4. **Test Event Registration (User):**
   - Login as regular user
   - Browse events
   - Click "Register" on an event
   - Event should appear in "My Registered Events"

### Troubleshooting

**Backend won't start:**
- Check if port 3000 is already in use
- Verify all dependencies are installed (`npm install`)
- Check `.env` file has JWT_SECRET set

**Frontend can't connect to backend:**
- Verify backend is running on port 3000
- Check CORS settings in `server.js`
- Verify `FRONTEND_URL` in `.env` matches frontend URL

**Database errors:**
- Delete `events.db` file and restart server (will recreate)
- Check file permissions in backend directory

---

## Interview Questions & Answers

### Frontend Questions

**Q1: Why did you use vanilla JavaScript instead of a framework like React or Vue?**
**A:** For this project, vanilla JavaScript was chosen to:
- Keep the project lightweight without build tools
- Demonstrate core JavaScript skills
- Avoid framework overhead for a relatively simple application
- Make it easier for interviewers to understand the code without framework knowledge
- Use ES6 modules for modern JavaScript features

**Q2: How does the authentication flow work in the frontend?**
**A:** 
1. User submits login/register form
2. `auth.js` validates input and calls API via `api.js`
3. Backend returns JWT token and user info
4. Token and user stored in `localStorage`
5. Token automatically included in all subsequent API requests via `Authorization: Bearer <token>` header
6. On page load, checks `localStorage` for token to determine if user is logged in
7. Redirects based on user role (admin → admin.html, user → dashboard.html)

**Q3: How do you handle API errors in the frontend?**
**A:**
- `api.js` uses try-catch blocks around fetch calls
- Errors are caught and thrown as Error objects with messages
- Each component (auth.js, userDashboard.js, adminDashboard.js) has error handling
- Errors displayed in UI via error message divs
- User-friendly error messages shown to users
- Console logging for debugging

**Q4: Explain the module system you're using.**
**A:**
- Using ES6 modules (`import`/`export`)
- Each JavaScript file is a module with specific responsibilities
- `api.js` exports API functions and utilities
- `auth.js` exports authentication functions
- HTML files use `<script type="module">` to load modules
- Modules allow code organization and reusability
- Prevents global namespace pollution

**Q5: How does the event registration system work?**
**A:**
1. User clicks "Register" button on event card
2. `handleRegister(eventId)` called in `userDashboard.js`
3. Makes POST request to `/api/registrations/:eventId`
4. Backend validates: event exists, not already registered, has capacity
5. Creates registration record in database
6. Frontend refreshes event list and "My Events" section
7. Button changes to "Registered" state
8. Remaining spots count updates

**Q6: How do you prevent duplicate registrations?**
**A:**
- Frontend: Disables "Register" button if already registered (checks `myEvents` array)
- Backend: Database has UNIQUE constraint on (user_id, event_id)
- Backend controller checks for existing registration before creating
- Returns error if duplicate registration attempted

**Q7: Explain the category filtering feature.**
**A:**
- Dropdown filter in user dashboard
- On change, calls `eventsAPI.getAll(category)`
- Backend filters events by category using SQL WHERE clause
- Frontend re-renders event cards with filtered results
- Uses query parameter: `GET /api/events?category=conference`

**Q8: How is responsive design implemented?**
**A:**
- Tailwind CSS utility classes for responsive breakpoints
- Grid layout: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Mobile-first approach (base styles for mobile, then larger screens)
- Custom CSS in `styles.css` for additional responsive tweaks
- Table becomes scrollable on mobile devices

### Backend Questions

**Q9: Explain the MVC-like architecture you used.**
**A:**
- **Models**: Database schema and operations (in `utils/database.js`)
- **Views**: JSON responses sent to frontend
- **Controllers**: Business logic in `controllers/` directory
- **Routes**: URL routing in `routes/` directory
- Separation allows: easier testing, code reusability, maintainability

**Q10: How does password hashing work? Why use bcrypt?**
**A:**
- **Hashing**: One-way encryption that converts password to fixed-length string
- **bcrypt**: Industry-standard hashing algorithm
- **Salt**: Random data added to password before hashing (unique per password)
- **Rounds**: Number of iterations (10 rounds = 2^10 = 1024 iterations)
- **Why bcrypt**: 
  - Intentionally slow to prevent brute force attacks
  - Automatically handles salt generation and storage
  - Proven secure algorithm
  - Adjustable cost factor (rounds)

**Q11: Explain JWT authentication in detail.**
**A:**
- **JWT Structure**: Header.Payload.Signature (three base64-encoded parts)
- **Header**: Contains algorithm (HS256) and token type
- **Payload**: Contains user data (id, username, role) and expiration
- **Signature**: HMAC hash of header + payload + secret key
- **Flow**:
  1. User logs in → backend generates JWT
  2. Token sent to frontend → stored in localStorage
  3. Frontend includes token in Authorization header for all requests
  4. Middleware verifies signature and expiration
  5. If valid, attaches user data to `req.user`
- **Advantages**: Stateless, scalable, self-contained
- **Security**: Signature prevents tampering, expiration limits exposure

**Q12: What is middleware and how does it work?**
**A:**
- **Middleware**: Functions that execute between request and response
- **Execution Order**: Request → Middleware 1 → Middleware 2 → Controller → Response
- **Types in this project**:
  - CORS middleware: Allows cross-origin requests
  - JSON parser: Parses request body
  - `authenticateToken`: Verifies JWT and attaches user
  - `requireAdmin`: Ensures user is admin
- **How it works**: Middleware can modify request, end response, or call `next()` to continue

**Q13: Explain the difference between routes and controllers.**
**A:**
- **Routes**: Define URL patterns and map them to controller functions
  - Example: `router.post('/register', register)` means "POST to /register calls register function"
- **Controllers**: Contain business logic and database operations
  - Example: `register` function validates input, hashes password, saves to database
- **Separation Benefits**: 
  - Routes focus on routing, controllers focus on logic
  - Same controller can be used by multiple routes
  - Easier to test and maintain

**Q14: How do you prevent SQL injection attacks?**
**A:**
- **Parameterized Queries**: Never concatenate user input into SQL strings
- **Example (Safe)**:
  ```javascript
  db.run('SELECT * FROM users WHERE username = ?', [username])
  ```
- **Example (Vulnerable - DON'T DO THIS)**:
  ```javascript
  db.run(`SELECT * FROM users WHERE username = '${username}'`)
  ```
- **How it works**: Database treats `?` as placeholder, user input is escaped automatically
- **All queries in this project use parameterized queries**

**Q15: Explain the database schema and relationships.**
**A:**
- **users table**: Stores user accounts (id, username, email, password_hash, role)
- **events table**: Stores events (id, title, description, category, date, time, location, capacity, created_by)
- **registrations table**: Junction table linking users to events (user_id, event_id)
- **Relationships**:
  - One-to-Many: User can create many events (created_by → users.id)
  - Many-to-Many: Users can register for many events, events can have many users (via registrations table)
- **Foreign Keys**: Ensure data integrity (can't delete user if they created events)
- **Unique Constraint**: Prevents duplicate registrations (user_id, event_id)

**Q16: How does capacity tracking work?**
**A:**
1. Each event has a `capacity` field (maximum participants)
2. Count registrations: `SELECT COUNT(*) FROM registrations WHERE event_id = ?`
3. Calculate remaining: `capacity - registration_count`
4. Display in frontend: "5 / 20 registered (15 spots left)"
5. Prevent registration if `registration_count >= capacity`
6. Real-time updates when users register/cancel

**Q17: How do you handle errors in the backend?**
**A:**
- **Try-Catch Blocks**: Wrap database operations in try-catch
- **HTTP Status Codes**: 
  - 400: Bad Request (validation errors)
  - 401: Unauthorized (authentication failed)
  - 403: Forbidden (authorization failed)
  - 404: Not Found (resource doesn't exist)
  - 500: Internal Server Error (server/database errors)
- **Error Messages**: Return user-friendly error messages in JSON
- **Global Error Handler**: Catches any unhandled errors
- **Logging**: Console.error for debugging

**Q18: Why use SQLite instead of PostgreSQL or MySQL?**
**A:**
- **Simplicity**: No separate server needed, just a file
- **Perfect for this project**: Small to medium scale application
- **Zero configuration**: Works out of the box
- **File-based**: Easy to backup (just copy the .db file)
- **ACID compliant**: Ensures data integrity
- **Limitations**: Not ideal for high concurrency or very large datasets, but sufficient for this use case

**Q19: Explain CORS and why it's needed.**
**A:**
- **CORS**: Cross-Origin Resource Sharing
- **Problem**: Browsers block requests from different origins (different protocol, domain, or port)
- **Solution**: Backend sends CORS headers allowing specific origins
- **In this project**: Frontend (localhost:5500) → Backend (localhost:3000) = different origins
- **Configuration**: 
  ```javascript
  cors({ origin: 'http://localhost:5500' })
  ```
- **Security**: Only allows requests from specified frontend URL

**Q20: How does the admin authorization work?**
**A:**
1. User logs in → JWT contains role field
2. `authenticateToken` middleware verifies token and attaches user to `req.user`
3. `requireAdmin` middleware checks `req.user.role === 'admin'`
4. If not admin → returns 403 Forbidden
5. If admin → calls `next()` to proceed to controller
6. Admin routes protected: `/api/events` (POST, PUT, DELETE), `/api/registrations/event/:eventId`

**Q21: What happens when a user registers for an event?**
**A:**
1. Frontend: User clicks "Register" → POST to `/api/registrations/:eventId`
2. Backend: `registerForEvent` controller:
   - Verifies JWT token (user is logged in)
   - Checks event exists in database
   - Checks user hasn't already registered (UNIQUE constraint)
   - Counts current registrations
   - Checks if capacity is available
   - Creates registration record: `INSERT INTO registrations (user_id, event_id) VALUES (?, ?)`
   - Returns success response
3. Frontend: Refreshes event list and "My Events" section

**Q22: How do you ensure data consistency?**
**A:**
- **Foreign Keys**: Ensure referential integrity (can't register for non-existent event)
- **Unique Constraints**: Prevent duplicate registrations
- **Transactions**: Could be used for complex operations (not needed in current implementation)
- **Validation**: Both frontend and backend validate input
- **Error Handling**: Proper error responses prevent partial updates

**Q23: Explain the registration cancellation logic.**
**A:**
1. User clicks "Cancel" on registered event
2. Frontend: DELETE to `/api/registrations/:eventId`
3. Backend: `cancelRegistration` controller:
   - Verifies registration exists
   - Checks event date hasn't passed (can't cancel past events)
   - Deletes registration: `DELETE FROM registrations WHERE user_id = ? AND event_id = ?`
   - Returns success
4. Frontend: Updates UI to show event as available again

**Q24: How would you scale this application?**
**A:**
- **Database**: Migrate to PostgreSQL for better concurrency
- **Caching**: Add Redis for frequently accessed data
- **Load Balancing**: Multiple server instances behind load balancer
- **Database Indexing**: Add indexes on frequently queried columns
- **API Rate Limiting**: Prevent abuse
- **File Storage**: Use cloud storage (S3) for event images
- **Monitoring**: Add logging and monitoring tools
- **CDN**: Serve static frontend files via CDN

---

## Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

**Note**: The admin account is automatically created when the database is initialized for the first time. Regular users cannot create admin accounts through registration.

---

## License

ISC
