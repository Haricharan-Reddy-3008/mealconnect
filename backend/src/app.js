import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import { inngestHandler } from "./inngest/handler.js";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

// Allow any local network origin on port 5173 (192.168.x.x, 10.x.x.x, etc.)
const isLocalOrigin = (origin) => {
  try {
    const url = new URL(origin);
    const host = url.hostname;
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      /^192\.168\./.test(host) ||
      /^10\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    );
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      isLocalOrigin(origin)
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/inngest", inngestHandler);

app.get("/", (req, res) => {
  res.send("MealConnect backend is live");
});

export default app;
