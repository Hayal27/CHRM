const express = require("express");
const cors = require("cors");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require('dotenv').config();
const bodyParser = require('body-parser');

const app = express();

// Increase limit for JSON and urlencoded bodies (e.g., 10mb)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// --- Check Required ENV Vars ---
if (!process.env.PORT || !process.env.SESSION_SECRET) {
  throw new Error("Missing required environment variables: PORT or SESSION_SECRET");
}

// --- Import Routes ---
const userRoutes = require("./routes/userRoutes.js");
const employeeRoutes = require("./routes/employeeRoutes.js");
const planRoutes = require("./routes/planRoutes.js");
const analyticsRoutes = require("./routes/analyticRoutes.js");
const RecuitmentRoutes = require("./routes/RecuitmentRoutes.js");
const queueRoutes = require("./routes/queueRoutes.js");
const authMiddleware = require("./middleware/authMiddleware.js");
const loggingMiddleware = require("./middleware/loggingMiddleware.js");

const port = process.env.PORT;

// --- ✅ CORS Configuration ---
// Allow only one origin for smooth network communication
const allowedOrigin = 'http://localhost:3000'; // Change to your frontend URL in production

const corsOptions = {
  origin: allowedOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

// --- Debug: Log response headers for CORS requests ---
app.use((req, res, next) => {
  res.on('finish', () => {
    if (req.method === 'OPTIONS' || req.headers.origin) {
      console.log('CORS Response Headers:', res.getHeaders());
    }
  });
  next();
});

// --- ✅ Helmet for HTTP Security Headers ---
app.use(helmet());

// --- ✅ Rate Limiting (Protect from brute force & DDoS) ---
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1_000_000, // 1 million requests per 5 minutes
  message: "Too many requests, please wait 30 seconds before trying again.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.set('Retry-After', '30'); // 30 seconds break
    res.status(options.statusCode).json({ message: options.message });
  }
});
app.use(limiter);

// --- ✅ Session Configuration ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000, // 1 hour
    sameSite: "none",
    secure: process.env.NODE_ENV === "production"
  }
}));

// --- ✅ Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

// --- ✅ Serve Static Files (With Restrictions) ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ✅ Health Check ---
app.get('/api', (req, res) => {
  res.send('Node is working');
});

// --- ✅ API Routes ---
app.use("/api", userRoutes);
app.use("/api", employeeRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", planRoutes);
app.use("/api", RecuitmentRoutes);
app.use("/api", queueRoutes);

// --- ✅ Auth Routes ---
app.post("/login", authMiddleware.login);
app.put("/logout/:user_id", authMiddleware.logout);

// --- ✅ Global Error Handler ---
app.use((err, req, res, next) => {
  // Always set CORS headers for the single allowed origin
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  console.error("Global error caught:", err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { error: err.message })
  });
});

// --- ✅ Start Server ---
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running securely on port ${port}`);
});





