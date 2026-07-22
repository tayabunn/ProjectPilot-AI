import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';

// Import Routes
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import sprintRoutes from './routes/sprintRoutes';
import aiRoutes from './routes/aiRoutes';
import decisionLogRoutes from './routes/decisionLogRoutes';
import githubRoutes from './routes/githubRoutes';
import engineeringRoutes from './routes/engineeringRoutes';
import aiEnhancementsRoutes from './routes/aiEnhancementsRoutes';

import { seedDatabase } from './config/seed';


// Import custom middleware
import { errorHandler } from './middlewares/errorHandler';
import { Logger } from './services/logger';

// Load Env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(() => {
  seedDatabase();
}).catch((err) => {
  console.error("Database connection failed during startup:", err);
});

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use((req, res, next) => {
  Logger.info(`Incoming Request: ${req.method} ${req.url}`);
  next();
});
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/decision-logs', decisionLogRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/engineering', engineeringRoutes);
app.use('/api/ai-enhancements', aiEnhancementsRoutes);


// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the ProjectPilot AI Backend API!',
    status: 'healthy',
    documentation: 'https://github.com/tayabunn/projectpilot-ai-backend'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ProjectPilot AI Backend' });
});

// Centralized error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
