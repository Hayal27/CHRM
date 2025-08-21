// Minimal server for testing login and new features
const express = require('express');
const cors = require('cors');
const { getLogin } = require('./models/LoginModel');

// Import route modules
const educationOfficeRoutes = require('./routes/educationOfficeRoutes');
const enhancedEmployeeRoutes = require('./routes/enhancedEmployeeRoutes');
const enhancedAdminRoutes = require('./routes/enhancedAdminRoutes');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Login route
app.post('/login', (req, res) => {
  console.log('📥 Login request received:', { user_name: req.body.user_name, pass: '[HIDDEN]' });
  getLogin(req, res);
});

// API Routes
app.use('/api/education-office', educationOfficeRoutes);
app.use('/api/employees', enhancedEmployeeRoutes);
app.use('/api/admin', enhancedAdminRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Minimal server is running', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/login`);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
