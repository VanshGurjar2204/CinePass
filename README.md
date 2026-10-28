# CinePass — Full-Stack Movie Ticket Booking Platform

A modern, production-grade **MERN Stack Movie Ticket Booking Platform** built with modular clean architecture, real-time seat reservation with temporary locks, Stripe payment verification, in-app notification center, and an administrative management workspace.

---

## 1. Key Features & Mandatory Requirements

### 1. User Registration & Secure Authentication
- **User Registration**: Validates full name, email, phone number, and password strength using **Zod** on both client and server.
- **Password Security**: Passwords hashed with `bcryptjs`.
- **JWT Architecture**: Access tokens with secure refresh token strategy, protected routes, and role-based access control (`user` vs `admin`).
- **Demo Quick-Fill Buttons**: One-click login on `/login` for both Admin and Customer accounts for rapid testing.

### 2. Movie Listings & Search
- **Home Page**: Hero carousel showcase, "Now Showing" carousel, "Upcoming Releases" lineup, popular genre pills, and instant search.
- **Movie Catalog (`/movies`)**: Full search by title, cast, director, or genre; multi-filter dropdowns by genre, language, status, and sorting.
- **Movie Details (`/movies/:slugOrId`)**: High-res backdrop, poster, rating badge, trailer modal, cast & crew details, theater & showtimes selector by date, and community reviews.

### 3. Theater & Show Management
- **Theaters & Venues**: Multi-location support with address, city, and cinema amenities (IMAX, Dolby Atmos, 4DX, VIP Recliners).
- **Screens & Auditoriums**: Multiple screens per theater with distinct screen types (IMAX, Standard, 3D, 4DX, Premium).
- **Seat Layout Generator**: Tiered seat layouts (Regular, Premium, Recliner) with custom row counts, seat labels, and price multipliers.
- **Show Schedules**: Conflict-free scheduling with **server-side overlap detection** preventing double-booking of auditoriums.

### 4. Interactive Seat Selection & Real-Time Availability
- **Interactive Seat Map**: Screen visual indicator, rows A–D, color-coded seat types, and live states (`available`, `selected`, `booked`, `locked`, `disabled`).
- **Temporary Seat Locking (8 Minutes)**: When seats are selected, they are temporarily locked on the server to prevent concurrent double-booking. Expired locks automatically release.
- **Atomic Re-Check**: Availability is re-verified before payment session creation and confirmation.

### 5. Ticket Booking Management
- **Booking State Lifecycle**: `pending` &rarr; `confirmed` / `cancelled` / `expired`.
- **My Bookings (`/bookings`)**: Filter by All, Confirmed, Pending, and Cancelled.
- **Digital Ticket Pass (`/bookings/:id`)**: High-fidelity printable ticket pass featuring movie details, seat numbers, total paid, and QR barcode reference.
- **Customer Cancellation**: Safe cancellation of bookings with seat release.

### 6. Stripe Payment Gateway Integration
- **Stripe Checkout & PaymentIntent**: Supports both direct Stripe Checkout redirection and instant tokenized card payments.
- **Webhook Processing**: Cryptographically verified webhook signatures (`stripe-signature`) with idempotent order confirmation.
- **Single Source of Truth**: Seats are only permanently booked once payment verification is confirmed by the backend.

### 7. Watchlist & Favorites
- **Instant Watchlist**: Dedicated `/watchlist` page.
- **One-Click Toggle**: Optimistic heart toggle on movie cards and details pages.
- **Duplicate Prevention**: MongoDB compound unique index `{ user: 1, movie: 1 }`.

### 8. Reviews & Ratings
- **Star Ratings (1–5)**: Audience review submission with written feedback.
- **Real-Time Recalculation**: Automatically updates movie average rating and total rating counts.
- **Admin Moderation**: Administrator review oversight and deletion.

### 9. Dedicated Admin Management Dashboard
- **Dashboard Overview (`/admin`)**: Real-time KPI metrics (Revenue, Total Bookings, Movies, Theaters, Users, Shows) and recent transactions.
- **CRUD Modules**: Movies, Theaters, Screens, Seat Layout Generator, Show Schedules, Users (with account activation toggle), Bookings inspector, and Review moderation.
- **Financial & Theater Reports (`/admin/reports`)**: Top grossing movies and theater performance metrics.

### 10. Notifications & Alert Center
- **In-App Notification Center**: Notification dropdown in header with unread badge and dedicated `/notifications` management page.
- **Multi-Channel Dispatch**:
  - **Email Notification Service (`Nodemailer`)**: Detailed HTML ticket confirmation with booking summary and barcode reference.
  - **SMS Notification Service**: Provider abstraction with mock fallback for seamless testing without third-party fees.
  - Upcoming show reminders and payment receipts.

---

## 2. Technology Stack

### Frontend
- **Framework**: React.js (v19) + Vite (v8)
- **Styling**: Tailwind CSS (v4) — *Light theme only*
- **Icons**: Lucide React
- **Routing**: React Router DOM (v7)
- **HTTP Client**: Axios with request/response interceptors
- **Validation**: Zod client-side form validation

### Backend
- **Runtime**: Node.js (ES Modules, `"type": "module"`)
- **Server**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`
- **Validation**: Zod schema middleware
- **Payment Gateway**: Stripe SDK
- **Email Service**: Nodemailer (HTML templates)
- **SMS Service**: Pluggable provider architecture with mock console fallback
- **Security**: Helmet, CORS, Cookie-Parser

---

## 3. Project Directory Structure

```
Ticket booking/
├── BACKEND/
│   ├── src/
│   │   ├── config/          # Database connection & ENV configuration
│   │   ├── controllers/     # Modular business logic controllers
│   │   ├── jobs/            # Periodic seat lock cleanup jobs
│   │   ├── middleware/      # Auth, Admin role, Zod validator, Error handlers
│   │   ├── models/          # Mongoose models (User, Movie, Theater, Screen, Seat, Show, SeatLock, Booking, Review, Watchlist, Notification)
│   │   ├── routes/          # Express API route declarations
│   │   ├── seed/            # Comprehensive seed script (movies, theaters, screens, seats, shows, users)
│   │   ├── services/        # Email, SMS, Notification, Payment, Booking services
│   │   ├── utils/           # JWT helpers, API response formatting
│   │   ├── validators/      # Zod validation schemas
│   │   ├── app.js           # Express application setup
│   │   └── server.js        # Server listener and startup
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API client functions
│   │   ├── components/
│   │   │   ├── admin/       # Admin sidebar, header, and layout
│   │   │   ├── booking/     # Interactive SeatMap, BookingSummary, DigitalTicket
│   │   │   ├── common/      # Button, Input, Select, Modal, Badge, Toast, Loader
│   │   │   └── movie/       # MovieCard, MovieGrid, TrailerModal
│   │   ├── context/         # AuthContext, ToastContext
│   │   ├── layouts/         # Main customer layout with Navbar & Footer
│   │   ├── pages/
│   │   │   ├── admin/       # Admin Dashboard, Movies, Theaters, Screens, Seats, Shows, Bookings, Users, Reviews, Reports
│   │   │   ├── public/      # HomePage, MoviesPage, MovieDetailsPage, LoginPage, RegisterPage
│   │   │   └── user/        # SeatSelectionPage, CheckoutPage, PaymentSuccessPage, MyBookingsPage, BookingDetailPage, WatchlistPage, NotificationsPage, ProfilePage
│   │   ├── routes/          # ProtectedRoute, AdminRoute, AppRoutes
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css        # Tailwind v4 theme styling
│   ├── .env.example
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 4. Environment Variables

### Backend (`BACKEND/.env`)
```ini
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/movie_booking_db
JWT_ACCESS_SECRET=cinepass_jwt_access_super_secret_key_2026
JWT_REFRESH_SECRET=cinepass_jwt_refresh_super_secret_key_2026

STRIPE_SECRET_KEY=sk_test_placeholder_or_real_key
STRIPE_PUBLISHABLE_KEY=pk_test_placeholder_or_real_key
STRIPE_WEBHOOK_SECRET=whsec_placeholder_or_real_key

EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=dummy_user
EMAIL_PASSWORD=dummy_password
EMAIL_FROM="CinePass Bookings <tickets@cinepass.com>"

SMS_PROVIDER=mock
SMS_API_KEY=dummy_sms_api_key
SMS_SENDER_ID=CINEPASS

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

---

## 5. Setup & Running the Application

### Step 1: Install Dependencies

```bash
# Backend
cd BACKEND
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Seed the Database

Run the database seed script to populate realistic movies, theaters, screens, seat layouts, scheduled shows, sample reviews, and test accounts:

```bash
cd BACKEND
npm run seed
```

### Step 3: Start the Backend Server

```bash
cd BACKEND
npm run dev
# Running on http://localhost:5000
```

### Step 4: Start the Frontend Application

```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

---

## 6. Seeded Test Credentials

Use these pre-configured accounts for testing:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@cinepass.com` | `Password@123` | Full access to `/admin` dashboard, inventory, and management APIs |
| **Customer User 1** | `john@example.com` | `Password@123` | Booking tickets, watchlist, reviews, order history |
| **Customer User 2** | `sarah@example.com` | `Password@123` | Multi-user seat reservation conflict testing |

*(Note: The `/login` page features quick one-click buttons to auto-fill these credentials).*

---

## 7. Automated & End-to-End Testing Status

An automated end-to-end backend test suite is included in `BACKEND/src/verify-backend.js`. Run it anytime via:

```bash
node BACKEND/src/verify-backend.js
```

### Tested Capabilities (19/19 Tests Passed):
1. ✅ Health check endpoint (`GET /api/health`)
2. ✅ Administrator authentication & JWT issuance
3. ✅ Customer authentication & JWT issuance
4. ✅ Duplicate registration prevention (409 Conflict)
5. ✅ Auth profile retrieval (`GET /api/auth/me`)
6. ✅ Movie multi-query text search & category filtering
7. ✅ Movie show schedule lookup grouped by theater
8. ✅ Interactive seat map generation with live status
9. ✅ Temporary 8-minute seat locking
10. ✅ Concurrent lock conflict prevention (Double-booking defense)
11. ✅ Pending booking creation with pricing calculation
12. ✅ Payment verification & confirmed booking transition
13. ✅ Permanent seat reservation persistence
14. ✅ Watchlist add, duplicate prevention, and check status
15. ✅ Community review submission & rating calculation
16. ✅ In-app notification creation & mark as read
17. ✅ Admin KPI statistics calculation
18. ✅ Role security (regular customer blocked from `/api/admin` with 403 Forbidden)
19. ✅ Show schedule auditorium collision & overlap detection

