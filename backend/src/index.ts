import express from 'express';
import './config/env.js';
import cors from 'cors';
import healthcheckRouter from './routes/health.routes.js'
import { globalErrorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import { Orchestrator } from './utils/orchestrator.util.js';

const app = express();
const PORT = process.env.PORT || '3006';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

console.log(process.cwd())

app.use(express.json());
app.use('/api/v1/healthcheck', healthcheckRouter);
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

app.use(globalErrorHandler);

Orchestrator();

app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
});