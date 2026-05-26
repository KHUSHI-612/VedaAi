import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { connectDB } from './config/database';
import { redisClient } from './config/redis';
import { initWebSocket } from './config/websocket';

// Import Route Handlers
import assessmentRoutes from './routes/assessments';
import uploadRoutes from './routes/upload';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json());

// Serve uploads folder as a static files folder publicly
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Register REST API Route Handlers
app.use('/api/assessments', assessmentRoutes);
app.use('/api/upload', uploadRoutes);

// Create the Node HTTP server wrapping the Express application instance
const server = createServer(app);

// Initialize and bind the WebSocket server to the HTTP server
initWebSocket(server);

/**
 * Initializes all dependent connections (MongoDB, Redis) and starts the HTTP server.
 */
async function bootstrap() {
  try {
    // 1. Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB();

    // 2. Verify Redis Connectivity
    console.log('Connecting to Redis...');
    const redisPong = await redisClient.ping();
    console.log(`Redis connected successfully. Ping response: ${redisPong}`);

    // 3. Start the HTTP and WebSocket Server
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server during bootstrapping:', error);
    process.exit(1);
  }
}

// Execute startup routine
bootstrap();
