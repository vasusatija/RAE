import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import 'dotenv/config';
import { initDB, setDB, initializeDatabase } from './db/database.js';
import { seedDatabase } from './db/seed.js';
import verifyToken from './middleware/auth.js';

// Import routes
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import accessRequestsRoutes from './routes/accessRequests.js';
import formsRoutes from './routes/forms.js';
import formApprovalsRoutes from './routes/formApprovals.js';
import requestsRoutes from './routes/requests.js';
import auditRoutes from './routes/audit.js';
import settingsRoutes from './routes/settings.js';
import slackRoutes from './routes/slack.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
        process.env.FRONTEND_URL,           // e.g. https://rae-app.vercel.app
        process.env.RAILWAY_STATIC_URL,     // auto-set by Railway
        /\.up\.railway\.app$/,              // any Railway subdomain
        /\.vercel\.app$/                    // any Vercel subdomain
      ].filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/access-requests', accessRequestsRoutes);
app.use('/api/forms', formsRoutes);
app.use('/api/form-approvals', formApprovalsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/slack', slackRoutes);

// Protected test endpoint
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected endpoint', user: req.user });
});

// Serve built React frontend (production)
const distPath = path.join(__dirname, '../dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback — send index.html for any non-API route
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Dev fallback — no dist folder yet
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Initialize database and start server
async function startServer() {
  try {
    const db = await initDB();
    setDB(db);
    initializeDatabase(db);
    console.log('Database initialized');

    // Seed if empty
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM users');
    const result = countStmt.get();
    if (!result || result.count === 0) {
      console.log('Seeding database with initial data...');
      seedDatabase();
    } else {
      console.log('Database already contains data, skipping seed');
    }

    app.listen(PORT, () => {
      console.log(`RAE server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      if (existsSync(distPath)) {
        console.log('Serving built React frontend from /dist');
      } else {
        console.log('No /dist found — run "npm run build" for production');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
