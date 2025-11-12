import express, { Application } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { connectDatabase } from './database';
import { connectRedis } from './utils/redis';
import { socketService } from './sockets';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import chatRoutes from './modules/chat/chat.routes';
import messageRoutes from './modules/message/message.routes';

class Server {
  private app: Application;
  private httpServer: http.Server;

  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandlers();
  }

  private setupMiddlewares(): void {
    // Security
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: config.frontendUrl,
      credentials: true,
    }));
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());
    
    // Compression
    this.app.use(compression());
    
    // Logging
    if (config.env === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: 'Too many requests from this IP, please try again later.',
    });
    this.app.use('/api/', limiter);
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/conversations', chatRoutes);
    this.app.use('/api/messages', messageRoutes);
  }

  private setupErrorHandlers(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  async start(): Promise<void> {
    try {
      // Connect to databases
      await connectDatabase();
      await connectRedis();
      
      // Initialize Socket.io
      socketService.initialize(this.httpServer);
      
      // Start server
      this.httpServer.listen(config.port, () => {
        console.log(`
🚀 Server is running!
📡 Port: ${config.port}
🌍 Environment: ${config.env}
🔗 API: http://localhost:${config.port}/api
🏥 Health: http://localhost:${config.port}/health
        `);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Create and start server
const server = new Server();
server.start();

export default server;
