import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { config } from 'dotenv';
import { AzureAIService } from './services/azure-ai.service';
import { SessionService } from './services/session.service';
import { RateLimiter } from './middleware/rate-limiter';
import { chatRoute } from './routes/chat.route';

// Load environment variables
config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Register plugins
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  await fastify.register(websocket, {
    options: {
      maxPayload: 1048576, // 1MB
    },
  });

  // Initialize services
  const azureAI = new AzureAIService({
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
  });

  const sessionService = new SessionService();
  sessionService.startCleanupInterval();

  const rateLimiter = new RateLimiter(60000, 10); // 10 requests per minute default

  // Register routes
  await fastify.register(chatRoute, {
    azureAI,
    sessionService,
    rateLimiter,
  });

  // Health check endpoint
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Start server
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`
╔═══════════════════════════════════════════════╗
║   🚀 Assist Widget Backend Server Running    ║
╠═══════════════════════════════════════════════╣
║   Port: ${PORT.toString().padEnd(38)} ║
║   Host: ${HOST.padEnd(38)} ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(30)} ║
╚═══════════════════════════════════════════════╝

WebSocket endpoint: ws://${HOST}:${PORT}/chat
Health check: http://${HOST}:${PORT}/health
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

start();
