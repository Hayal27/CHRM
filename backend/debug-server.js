// Debug version of server.js with explicit error handling
console.log('🔧 Starting debug server...');

try {
  console.log('1. Loading dotenv...');
  require('dotenv').config();
  console.log('   PORT:', process.env.PORT);
  console.log('   SESSION_SECRET:', process.env.SESSION_SECRET ? 'SET' : 'NOT SET');

  console.log('2. Loading express...');
  const express = require("express");
  const app = express();

  console.log('3. Loading other modules...');
  const cors = require("cors");
  const session = require("express-session");
  const helmet = require("helmet");
  const rateLimit = require("express-rate-limit");
  const path = require("path");
  const bodyParser = require('body-parser');

  console.log('4. Setting up middleware...');
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  console.log('5. Checking environment variables...');
  if (!process.env.PORT || !process.env.SESSION_SECRET) {
    throw new Error("Missing required environment variables: PORT or SESSION_SECRET");
  }

  console.log('6. Loading routes...');
  const authMiddleware = require("./middleware/authMiddleware.js");

  console.log('7. Setting up CORS...');
  const allowedOrigin = 'http://localhost:3000';
  const corsOptions = {
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  };
  app.use(cors(corsOptions));

  console.log('8. Setting up basic middleware...');
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  console.log('9. Setting up auth routes...');
  app.post("/login", authMiddleware.login);

  console.log('10. Starting server...');
  const port = process.env.PORT;
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Debug server running on port ${port}`);
  });

} catch (error) {
  console.error('❌ Server startup error:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
