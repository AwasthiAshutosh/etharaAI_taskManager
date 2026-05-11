const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        config.frontendUrl,
        'https://etharaai-projectmanager.up.railway.app'
      ];

      if (allowedOrigins.includes(origin) || origin.endsWith('.railway.app')) {
        callback(null, true);
      } else {
        console.error(`CORS Blocked: ${origin} not in allowed origins`);
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  // CORS errors get a clear status code
  const status = err.message?.startsWith('Not allowed by CORS') ? 403 : 500;
  res.status(status).json({
    message: config.nodeEnv === 'development' ? err.message : 'Internal server error.',
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`🚀 Ethara.AI API running on port ${config.port} [${config.nodeEnv}]`);
  });
};

startServer();

module.exports = app;
