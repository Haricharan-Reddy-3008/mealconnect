<div align="center">
  <img src="./Screenshots/Hero.png" alt="MealConnect" width="100%" />
  <br/><br/>
  <p><strong>A platform where leftover food finds a purpose — not a landfill.</strong></p>
  <p>
    <img src="https://img.shields.io/badge/react-19-blue?logo=react" />
    <img src="https://img.shields.io/badge/node.js-express-green?logo=nodedotjs" />
    <img src="https://img.shields.io/badge/mongodb-mongoose-brightgreen?logo=mongodb" />
    <img src="https://img.shields.io/badge/socket.io-realtime-black?logo=socketdotio" />
    <img src="https://img.shields.io/badge/leaflet-maps-199900?logo=leaflet" />
  </p>
</div>

---

## What is this?

MealConnect lets **restaurants** list surplus food before it expires, **NGOs** discover and collect it nearby, and **admins** oversee every handoff to keep things accountable. The entire donation lifecycle — from posting to delivery to proof of distribution — happens in real time.

---

## How the delivery works

This isn't a simple listing board. There's a **5-step admin-mediated pipeline** behind every donation:

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

## The three roles

### Restaurant
| What they do | How it works |
|---|---|
| Post surplus food | Upload photo via Cloudinary, set quantity, expiry, pickup address |
| Track claims | See who claimed, approve/reject, mark as "in transit" |
| Get rated | NGOs leave 5-star ratings after collection |

### NGO
| What they do | How it works |
|---|---|
| Browse nearby food | City-filtered list + interactive Leaflet map with 1–50 km radius slider |
| Claim food | One-click claim → goes to admin for approval |
| Prove distribution | Upload photos of food being handed out before marking "collected" |

### Admin
| What they do | How it works |
|---|---|
| Verify organizations | Review registration docs, approve/reject restaurants & NGOs |
| Manage deliveries | Approve or reject every claim request — full middleman control |
| Monitor everything | See all food posts, statuses, quantities, timestamps in one table |

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

## Things I'd add next

- Push notifications (service workers) so NGOs get alerted even when the tab is closed
- Route optimization — suggest the fastest pickup path when multiple claims exist
- Analytics dashboard showing waste reduction metrics over time
- Mobile app (React Native) for on-the-go restaurant managers

---

<div align="center">
  <sub>If you think food shouldn't go to waste — ⭐ this repo.</sub>
</div>
