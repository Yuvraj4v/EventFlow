# ⚡ EventFlow — Full-Stack Event Organizer Platform

A production-ready, full-stack event management platform built with React + Node.js + MongoDB.
Perfect for GitHub portfolios, internship applications, and resume projects.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| State | Zustand (persist) |
| Charts | Recharts |
| Animations | Framer Motion |
| Forms | React Hook Form |
| Payments | Stripe (test mode) |
| Email | Nodemailer |
| QR Codes | qrcode + qrcode.react |
| Icons | Lucide React |

---

## ✨ Features

### User Features
- 🔐 JWT Auth (login, register, forgot/reset password)
- 🎉 Browse & search events with filters (category, city, date, price, type)
- 🎟️ Book tickets with quantity selection per tier
- 📱 QR code tickets generated on booking confirmation
- 📧 Booking confirmation email (with Nodemailer)
- ❤️ Save/favourite events
- 📋 Booking history with status tracking
- ✏️ Profile management with notification preferences
- 🌙 Dark / Light mode (persisted)
- ⏱️ Live countdown timer on event detail page

### Admin Features
- 📊 Dashboard with analytics charts (Recharts)
- ➕ Create / edit / delete events with ticket tiers
- ⭐ Toggle featured events
- 📅 Change event status (draft → published → cancelled)
- 👥 User management (role promotion, activate/deactivate)
- 🗂️ View all bookings with filters

### Technical
- Role-based access (user / admin / organizer)
- Rate limiting & Helmet security headers
- Pagination on all list endpoints
- Text-search index on events
- Virtual fields (totalSold, isSoldOut, minPrice)
- MongoDB seeder with 8 realistic events
- Stripe payment intent flow (test mode)

---

## 📁 Project Structure

```
eventflow/
├── backend/
│   ├── controllers/        # Business logic
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── bookingController.js
│   │   ├── userController.js
│   │   ├── adminController.js
│   │   ├── categoryController.js
│   │   └── paymentController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT protect / authorize
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Booking.js
│   │   └── Category.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── bookings.js
│   │   ├── users.js
│   │   ├── categories.js
│   │   ├── payments.js
│   │   └── admin.js
│   ├── utils/
│   │   ├── email.js         # Nodemailer
│   │   └── seeder.js        # Sample data
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/      # UI, LoadingSkeleton
    │   │   ├── events/      # EventCard, EventFilter, CountdownTimer
    │   │   └── layout/      # Navbar, Footer
    │   ├── context/
    │   │   └── authStore.js # Zustand global auth state
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── EventsPage.jsx
    │   │   ├── EventDetailPage.jsx
    │   │   ├── AuthPages.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── UserPages.jsx  # Bookings, Profile, Saved
    │   │   └── admin/
    │   │       ├── AdminDashboardPage.jsx
    │   │       ├── AdminEventsPage.jsx
    │   │       ├── AdminUsersPage.jsx
    │   │       ├── AdminBookingsPage.jsx
    │   │       ├── EventFormPage.jsx
    │   │       └── AdminLayout.jsx
    │   ├── services/
    │   │   └── api.js        # Axios + API helpers
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

---

## ⚙️ SETUP GUIDE

### Prerequisites

Make sure you have these installed:
- **Node.js** v18+ → https://nodejs.org
- **MongoDB** (local or Atlas) → https://mongodb.com
- **Git** → https://git-scm.com

---

### Step 1 — Clone / Extract the project

```bash
# If cloned from GitHub:
git clone https://github.com/yourusername/eventflow.git
cd eventflow

# Or if you extracted the ZIP:
cd eventflow
```

---

### Step 2 — Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create your .env file from the example
cp .env.example .env
```

Now **edit `backend/.env`** with your values:

```env
PORT=5000
NODE_ENV=development

# ── MongoDB ──────────────────────────────────
# Option A: Local MongoDB (if installed on your machine)
MONGO_URI=mongodb://localhost:27017/eventflow

# Option B: MongoDB Atlas (free cloud DB — recommended)
# 1. Go to https://cloud.mongodb.com
# 2. Create a free cluster
# 3. Click "Connect" → "Drivers" → copy the connection string
# 4. Replace <username>, <password>, and add /eventflow at the end
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eventflow

# ── JWT ──────────────────────────────────────
JWT_SECRET=replace_this_with_a_long_random_string_abc123xyz789
JWT_EXPIRE=30d

# ── Email (optional — for booking confirmation emails) ──
# Use Gmail App Password: https://myaccount.google.com/apppasswords
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=EventFlow <noreply@eventflow.com>

# ── Stripe (optional — for paid ticket checkout) ──
# Get test keys at https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_...

# ── Frontend URL (for CORS) ──────────────────
FRONTEND_URL=http://localhost:5173
```

---

### Step 3 — Seed the Database (recommended)

This creates 8 sample events, categories, and 3 demo accounts:

```bash
# Still inside the backend/ folder
npm run seed
```

You'll see:
```
✅ MongoDB Connected for seeding
🌱 Seeding categories...
👤 Seeding users...
🎉 Seeding events...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 Admin Login:     admin@eventflow.com  /  Admin@123456
🎪 Organizer Login: organizer@eventflow.com  /  Password123
👤 User Login:      user@eventflow.com  /  Password123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Step 4 — Start the Backend

```bash
# Development mode (auto-restarts on file changes)
npm run dev

# Production mode
npm start
```

✅ You should see:
```
✅ MongoDB Connected: localhost
🚀 EventFlow API running on port 5000
```

Test it: open http://localhost:5000/api/health in your browser.

---

### Step 5 — Frontend Setup

Open a **new terminal tab/window**:

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api

# Optional: Stripe publishable key (for payment UI)
# Get from https://dashboard.stripe.com/test/apikeys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

### Step 6 — Start the Frontend

```bash
npm run dev
```

✅ Open http://localhost:5173 in your browser.

---

## 🧪 Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@eventflow.com | Admin@123456 |
| **Organizer** | organizer@eventflow.com | Password123 |
| **User** | user@eventflow.com | Password123 |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| POST | /api/auth/forgot-password | Send reset email |
| PUT | /api/auth/reset-password/:token | Reset password |
| PUT | /api/auth/update-password | Change password |

### Events
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/events | List events (filterable) |
| GET | /api/events/featured | Featured events |
| GET | /api/events/:id | Single event |
| GET | /api/events/slug/:slug | Event by slug |
| POST | /api/events | Create event (admin/organizer) |
| PUT | /api/events/:id | Update event |
| DELETE | /api/events/:id | Delete event |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/bookings | Create booking |
| GET | /api/bookings/my | My bookings |
| GET | /api/bookings/:id | Single booking |
| PUT | /api/bookings/:id/cancel | Cancel booking |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/admin/stats | Dashboard stats + charts |
| GET | /api/admin/users | All users |
| PATCH | /api/admin/users/:id/role | Update role |
| PATCH | /api/admin/users/:id/status | Toggle active |
| GET | /api/admin/bookings | All bookings |
| PATCH | /api/admin/events/:id/featured | Toggle featured |
| PATCH | /api/admin/events/:id/status | Update status |

---

## 🚀 Deployment Guide

### Backend → Railway (free tier)

1. Push your project to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Select your repo, choose the `backend/` folder
4. Add environment variables from `.env` in Railway dashboard
5. Railway auto-detects Node.js and runs `npm start`
6. Copy the generated URL (e.g. `https://eventflow-api.railway.app`)

### Frontend → Vercel (free tier)

1. Go to https://vercel.com → New Project → Import from GitHub
2. Set **Root Directory** to `frontend`
3. Add environment variables:
   - `VITE_API_URL` = your Railway backend URL + `/api`
4. Click Deploy

### Database → MongoDB Atlas (free tier)

1. https://cloud.mongodb.com → Create free M0 cluster
2. Database Access → Add user with password
3. Network Access → Allow 0.0.0.0/0 (all IPs)
4. Connect → Drivers → copy connection string
5. Use as `MONGO_URI` in your deployment environment

---

## 🐛 Troubleshooting

**"MongoDB connection refused"**
- Make sure MongoDB is running: `mongod` (local) or check Atlas network access
- Verify your MONGO_URI in `.env`

**"CORS error" in browser**
- Check `FRONTEND_URL` in backend `.env` matches your frontend URL exactly
- Restart the backend after changing `.env`

**"Cannot find module" errors**
- Run `npm install` again in the relevant folder
- Delete `node_modules/` and `package-lock.json`, then `npm install`

**Emails not sending**
- Gmail requires an App Password (not your regular password)
- Enable 2FA first, then create App Password at https://myaccount.google.com/apppasswords

**QR codes not showing**
- The `qrcode.react` package exports `QRCodeSVG` — ensure you import it correctly:
  `import { QRCodeSVG } from 'qrcode.react'`

---

## 📝 Environment Variables Summary

### Backend (`backend/.env`)
| Variable | Required | Description |
|---|---|---|
| PORT | No (def: 5000) | Server port |
| MONGO_URI | ✅ Yes | MongoDB connection string |
| JWT_SECRET | ✅ Yes | Secret key for JWT signing |
| JWT_EXPIRE | No (def: 30d) | Token expiry |
| FRONTEND_URL | ✅ Yes | Frontend URL for CORS |
| EMAIL_* | No | SMTP config for emails |
| STRIPE_SECRET_KEY | No | Stripe secret for payments |

### Frontend (`frontend/.env`)
| Variable | Required | Description |
|---|---|---|
| VITE_API_URL | ✅ Yes | Backend API base URL |
| VITE_STRIPE_PUBLISHABLE_KEY | No | Stripe public key |

---

Built with ❤️ using the MERN stack.
