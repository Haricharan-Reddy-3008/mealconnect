# 🍽️ MealConnect — Real-Time Food Donation Platform



**Connecting restaurants with surplus food to NGOs — in real time.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[▶️ Watch Demo Video](#-demo-video) · [✨ Features](#-features) · [🏗️ Architecture](#%EF%B8%8F-architecture) · [🚀 Getting Started](#-getting-started)

</div>

---

## What is this?

MealConnect lets **restaurants** list surplus food before it expires, **NGOs** discover and collect it nearby, and **admins** oversee every handoff to keep things accountable. The entire donation lifecycle — from posting to delivery to proof of distribution — happens in real time.

---


---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with HTTP-only cookie sessions
- Role-based access control (Restaurant / NGO / Admin)
- Strong password enforcement with `validator.js`
- Account lockout after 5 failed login attempts (30-minute cooldown)
- Brute-force protection built into the login flow

### 🍽️ Restaurant Features
- Post surplus food with photo, quantity, description, pickup address & expiry time
- Image uploads via **Cloudinary** CDN
- Edit or delete food posts anytime
- Real-time notifications when NGOs claim your food
- View claim status updates (Pending → Claimed → In Transit → Collected)

### 🤝 NGO Features
- Browse available food donations in your city
- **Interactive Map View** (Leaflet + OpenStreetMap) with adjustable radius (1–50 km)
- Claim food with one click — request goes to admin for approval
- Upload **distribution proof photos** after receiving food
- Rate restaurants after successful collection (5-star system)

### 🛡️ Admin Dashboard
- **Organization Verification** — Approve/reject restaurant & NGO registrations
- **Collection Request Management** — Mediate every delivery between restaurant and NGO
- **All Food Listings** — Bird's-eye view of every donation with live status tracking
- Full audit trail logging for compliance and accountability

### ⚡ Real-Time Engine (Socket.io)
- New food posts appear instantly on NGO dashboards — no refresh needed
- Status changes propagate across all connected clients in real time
- Map View pins update live as restaurants post or food gets claimed
- Toast notifications for claims, approvals, and collections

### 📧 Email Notification Pipeline
- **On Claim** → Both restaurant & NGO receive each other's contact details
- **On Transit** → NGO gets notified: "Your food is on the way"
- **On Collection** → Both parties receive confirmation emails
- Powered by **Nodemailer** with SMTP integration

### 🗺️ Map View (Leaflet + OpenStreetMap)
- Free, no-API-key interactive map with CartoDB tiles
- Custom animated food markers with pulse effects
- NGO location beacon with radius circle overlay
- Click any pin to view details and claim directly
- City-based coordinate fallback for 20+ Indian cities

---

## 🏗️ Architecture

```
Restaurant posts food
        ↓
NGO finds it (dashboard / map) and clicks "Claim"
        ↓
Admin reviews the request and approves it ← prevents fraud
        ↓
Restaurant confirms pickup → NGO uploads distribution proof photos
        ↓
NGO marks as collected → both get email confirmations → NGO rates restaurant
```

Every step triggers **Socket.io events** (so dashboards update without refresh) and **email notifications** (so nobody misses anything).

---


---

## Screenshots

<table>
<tr>
<td width="50%"><strong>🔐 Login</strong><br/><img src="./Screenshots/Login.png" width="100%"/></td>
<td width="50%"><strong>📝 Sign Up</strong><br/><img src="./Screenshots/Signup.png" width="100%"/></td>
</tr>
<tr>
<td><strong>🍽️ Restaurant Dashboard</strong><br/><img src="./Screenshots/RestaurantDashboard.png" width="100%"/></td>
<td><strong>🤝 NGO Dashboard</strong><br/><img src="./Screenshots/NGODashboard.png" width="100%"/></td>
</tr>
<tr>
<td><strong>🗺️ Map View</strong><br/><img src="./Screenshots/NGOMapview.png" width="100%"/></td>
<td><strong>📍 Food Pin on Map</strong><br/><img src="./Screenshots/FoodMarker.png" width="100%"/></td>
</tr>
<tr>
<td><strong>🍲 Claim Modal</strong><br/><img src="./Screenshots/FoodClaimModal.png" width="100%"/></td>
<td><strong>⚡ Real-Time Updates</strong><br/><img src="./Screenshots/Socket.png" width="100%"/></td>
</tr>
<tr>
<td><strong>✏️ Edit Profile</strong><br/><img src="./Screenshots/EditProfile.png" width="100%"/></td>
<td><strong>✨ Features</strong><br/><img src="./Screenshots/Features.png" width="100%"/></td>
</tr>
</table>

---

## Technical decisions I made

**Why Leaflet instead of Mapbox?**
Mapbox requires an API key and has usage limits. Leaflet with OpenStreetMap/CartoDB tiles is completely free, renders a clean dark-themed map, and supports custom animated markers — no token management needed.

**Why admin-mediated claims instead of direct claiming?**
Direct claiming has no accountability. With admin approval in the middle, every handoff is verified. This prevents fake claims and ensures donated food actually reaches people. It also creates a full audit trail.

**Why distribution proof photos?**
Anyone can click "collected." Requiring photo evidence before marking a donation complete adds a layer of trust that's missing from most food donation platforms.

**Why HTTP-only cookies over localStorage for JWT?**
localStorage is vulnerable to XSS attacks. HTTP-only cookies can't be accessed by JavaScript, making the auth layer significantly more secure.

**Why Socket.io for everything?**
Food has a short shelf life. If an NGO has to manually refresh to see new posts, they might miss time-sensitive donations. WebSockets ensure every status change — new post, claim, transit, collection — propagates instantly to all connected users.

---

## Running locally

```bash
# Clone
git clone https://github.com/Haricharan-Reddy-3008/mealconnect.git
cd mealconnect

# Backend
cd backend
npm install
# Create .env (see below)
npm start          # runs on :5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev        # runs on :5173
```

**Backend `.env`:**
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/food_donation
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## Built with

| | |
|---|---|
| **Frontend** | React 19 · Vite · Tailwind CSS 4 · Leaflet · Socket.io Client · Lucide Icons · Framer Motion |
| **Backend** | Node.js · Express · Socket.io · Inngest (scheduled jobs) · Nodemailer · Multer |
| **Database** | MongoDB · Mongoose |
| **Cloud** | Cloudinary (image storage) |
| **Auth** | JWT · bcrypt · HTTP-only cookies |
| **Maps** | Leaflet · OpenStreetMap · CartoDB tiles |

---

## Project layout

```
backend/
├── server.js                    # Express + MongoDB + Socket.io setup
├── src/
│   ├── controllers/             # Auth, Food CRUD, User, Verification
│   ├── middlewares/              # JWT guard, role check, banned check, file upload
│   ├── models/                   # User, FoodPost, Rating, AuditLog, Admin
│   ├── routes/                   # /auth, /food, /users, /verification
│   ├── socket/                   # Real-time event handlers
│   ├── inngest/                  # Auto-expiry cron (marks expired food)
│   └── utils/                    # Email templates, Cloudinary upload helper

frontend/
├── src/
│   ├── pages/                    # Home, Login, Signup, Dashboards, MapView, Admin
│   ├── components/               # Navbar, FoodCard, Modals, CreateFood, Rating
│   ├── context/                  # AuthContext (session management)
│   ├── api/                      # Axios instance + food API helpers
│   └── socket/                   # Socket.io client connection
```

---



