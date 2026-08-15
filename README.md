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

## 📌 The Problem

> **40% of food produced in India is wasted** while millions go hungry every day.

Restaurants, hotels, and event organizers discard large quantities of edible food daily due to lack of coordination. Meanwhile, NGOs and shelters struggle to source food on time. Manual donation systems are slow, unreliable, and have no accountability.

## 💡 The Solution — MealConnect

MealConnect is a **full-stack real-time platform** that bridges the gap between food surplus and food scarcity. It provides:

- **Instant visibility** — Restaurants post surplus food; NGOs see it immediately
- **Admin-mediated delivery** — Every handoff is verified to prevent fraud
- **Email notifications** — Both parties stay informed at every step
- **Live map** — NGOs discover food geographically with radius search
- **Accountability** — Distribution proof uploads + star ratings build trust

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
┌─────────────────────────────────────────────────────────────┐
│                      MealConnect Flow                       │
├─────────────┬───────────────────────┬───────────────────────┤
│ Restaurant  │        Admin          │         NGO           │
├─────────────┼───────────────────────┼───────────────────────┤
│ Posts food  │                       │ Discovers on map/list │
│     │       │                       │        │              │
│     └───────┼── Visible instantly ──┼────────┘              │
│             │                       │                       │
│             │                       │ Claims food           │
│             │  ← Approval request ──┤    │                  │
│             │                       │    ▼                  │
│             │  Approves/Rejects ────┤ Status: Claimed       │
│             │                       │                       │
│ Confirms    │                       │                       │
│ pickup ─────┼───────────────────────┤ Status: In Transit    │
│             │                       │    │                  │
│             │                       │ Uploads proof photos  │
│             │                       │ Marks collected       │
│             │                       │    │                  │
│             │                       │    ▼                  │
│ Gets rated  │  Audit log updated    │ Rates restaurant ⭐   │
└─────────────┴───────────────────────┴───────────────────────┘

📧 Email notifications sent at: Claim → Transit → Collection
⚡ Socket.io real-time updates at every status change
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS 4, Leaflet, Socket.io Client, Lucide Icons, Framer Motion |
| **Backend** | Node.js, Express.js, Socket.io, Inngest (cron jobs), Nodemailer |
| **Database** | MongoDB with Mongoose ODM |
| **Storage** | Cloudinary (food images, avatars, distribution proof) |
| **Auth** | JWT + HTTP-only cookies, bcrypt password hashing |
| **Maps** | Leaflet + OpenStreetMap / CartoDB tiles (free, no API key) |
| **Validation** | express-validator, validator.js |

---


---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Git**

### 1. Clone the repository
```bash
git clone https://github.com/Haricharan-Reddy-3008/mealconnect.git
cd mealconnect
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/food_donation
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:
```bash
npm start
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

Create a `.env` file in `/frontend`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 📁 Project Structure

```
mealconnect/
├── backend/
│   ├── server.js              # Entry point + MongoDB + Socket.io
│   └── src/
│       ├── app.js             # Express app, CORS, routes
│       ├── config/            # Database configuration
│       ├── controllers/       # Auth, Food, User, Verification logic
│       ├── middlewares/       # JWT auth, role guards, file upload
│       ├── models/            # User, FoodPost, Rating, AuditLog, Admin
│       ├── routes/            # API endpoints
│       ├── socket/            # Socket.io event handlers
│       ├── inngest/           # Background cron jobs (auto-expiry)
│       └── utils/             # Email templates, Cloudinary helpers
├── frontend/
│   └── src/
│       ├── api/               # Axios instance + API helpers
│       ├── components/        # Navbar, FoodCard, Modals, Footer, etc.
│       ├── context/           # AuthContext (React Context API)
│       ├── pages/             # Home, Login, Signup, Dashboards, MapView
│       ├── route/             # Protected & Auth route wrappers
│       └── socket/            # Socket.io client connection
└── Screenshots/               # App screenshots for README
```

---

## 🔄 Complete Donation Lifecycle

```
1. 🍽️  Restaurant posts surplus food (photo + details + expiry)
2. ⚡  NGOs see it instantly on dashboard & map (via Socket.io)
3. 🤝  NGO clicks "Claim" → Request sent to Admin
4. 📧  Both restaurant & NGO receive email with contact details
5. 🛡️  Admin reviews and approves the claim
6. 🚗  Restaurant confirms pickup → Status: "In Transit"
7. 📧  NGO receives "food is on the way" email
8. 📸  NGO uploads distribution proof photos
9. ✅  NGO marks food as "Collected"
10. 📧 Both receive collection confirmation emails
11. ⭐  NGO rates the restaurant (5-star + optional review)
12. ⏰  Unclaimed food auto-expires via Inngest cron jobs
```

---

## 🌟 What Makes MealConnect Different

| Feature | MealConnect | Traditional Apps |
|---------|:-----------:|:----------------:|
| Real-time updates (WebSockets) | ✅ | ❌ |
| Admin-mediated delivery pipeline | ✅ | ❌ |
| Email notifications at every step | ✅ | ❌ |
| Interactive map with radius search | ✅ | ❌ |
| Distribution proof uploads | ✅ | ❌ |
| Automatic food expiry (cron) | ✅ | ❌ |
| Trust ratings system | ✅ | ❌ |
| Organization verification | ✅ | ❌ |

---

## 🔮 Future Scope

- 📱 Mobile application (React Native)
- 🚚 Pickup route optimization with Google Maps
- 📊 Food waste analytics dashboard
- 🧠 AI-powered demand prediction
- 🏛️ Government & municipality integration
- 🏆 Gamified reward system for frequent donors

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

```bash
# Fork the repo, create a feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m "Add amazing feature"

# Push and create a PR
git push origin feature/amazing-feature
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ to reduce food waste and feed communities**

⭐ **Star this repo if you believe in reducing food waste!** ⭐

</div>
