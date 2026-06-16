# ⚡ EventFlow — Setup Guide

## ✅ Prerequisites (install these first)

| Tool | Download | Check version |
|------|----------|---------------|
| Node.js v18+ | https://nodejs.org (LTS) | `node -v` |
| MongoDB | https://mongodb.com/try/download/community | `mongod --version` |
| Git | https://git-scm.com | `git --version` |

> **Tip:** You can also use **MongoDB Atlas** (free cloud DB) instead of installing MongoDB locally.

---

## 🚀 Quick Start (3 terminals)

### Terminal 1 — MongoDB (skip if using Atlas)
```bash
mongod
```

### Terminal 2 — Backend
```bash
cd eventflow/backend
npm install
npm run seed          # loads sample data (do this ONCE)
npm run dev           # starts API on http://localhost:5000
```

### Terminal 3 — Frontend
```bash
cd eventflow/frontend
npm install
npm run dev           # opens app on http://localhost:5173
```

Open **http://localhost:5173** in your browser 🎉

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@eventflow.com | Admin@123456 |
| **Organizer** | organizer@eventflow.com | Password123 |
| **User** | user@eventflow.com | Password123 |

---

## ⚙️ Environment Variables

### `backend/.env` (already created — edit as needed)

```
MONGO_URI=mongodb://localhost:27017/eventflow
JWT_SECRET=eventflow_super_secret_jwt_key_change_me_in_prod_2025
FRONTEND_URL=http://localhost:5173
PORT=5000
```

**For MongoDB Atlas** replace MONGO_URI with:
```
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/eventflow
```

### `frontend/.env` (already created)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 📬 Optional: Email Notifications

To enable booking confirmation emails, edit `backend/.env`:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx   ← Gmail App Password
EMAIL_FROM=EventFlow <noreply@eventflow.com>
```

Get a Gmail App Password at:
https://myaccount.google.com/apppasswords  (requires 2FA enabled)

---

## 💳 Optional: Stripe Payments

To enable paid ticket checkout, edit `backend/.env` and `frontend/.env`:

```bash
# backend/.env
STRIPE_SECRET_KEY=sk_test_...

# frontend/.env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Get test keys (free): https://dashboard.stripe.com/test/apikeys

---

## 🌐 Deployment

### Backend → Railway (free)
1. Push to GitHub
2. railway.app → New Project → From GitHub → select `backend/` folder
3. Add all backend `.env` variables in Railway dashboard
4. Copy the Railway URL (e.g. `https://my-api.railway.app`)

### Frontend → Vercel (free)
1. vercel.com → New Project → From GitHub → root dir = `frontend`
2. Add: `VITE_API_URL = https://my-api.railway.app/api`
3. Deploy

### Database → MongoDB Atlas (free)
1. cloud.mongodb.com → Create free M0 cluster
2. Database Access → Add user
3. Network Access → Allow 0.0.0.0/0
4. Connect → copy URI → use as `MONGO_URI`

---

## 🗂️ Project Structure

```
eventflow/
├── backend/
│   ├── controllers/    ← business logic
│   ├── middleware/     ← auth, error handling
│   ├── models/         ← Mongoose schemas
│   ├── routes/         ← Express API routes
│   ├── utils/          ← email, seeder
│   ├── server.js       ← entry point
│   └── .env            ← your secrets (edit this)
│
├── frontend/
│   ├── src/
│   │   ├── components/ ← reusable UI
│   │   ├── pages/      ← all page views
│   │   ├── context/    ← Zustand auth store
│   │   ├── services/   ← Axios API calls
│   │   ├── App.jsx     ← routing
│   │   └── main.jsx    ← entry point
│   └── .env            ← your config (edit this)
│
├── README.md           ← full API docs
├── SETUP.md            ← this file
└── package.json        ← run both servers together
```

---

## 🐛 Troubleshooting

**"ECONNREFUSED" / MongoDB not connecting**
- Run `mongod` in a separate terminal (local), or check Atlas Network Access

**"Cannot find module"**
- Run `npm install` in both `backend/` and `frontend/`

**CORS error in browser**
- Make sure `FRONTEND_URL=http://localhost:5173` in `backend/.env`
- Restart the backend after changing `.env`

**Port already in use**
- Change `PORT=5001` in `backend/.env`
- Change `server: { port: 5174 }` in `frontend/vite.config.js`

**Blank page on frontend**
- Check browser console (F12) for errors
- Make sure backend is running on port 5000 first

---

## 🔗 API Health Check

Once backend is running, open:
```
http://localhost:5000/api/health
```
You should see: `{ "success": true, "message": "EventFlow API is running!" }`

