import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { clerkMiddleware } from "@clerk/express";

// Prisma client
import { prisma } from "./lib/prisma";

// Routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import vehicleRoutes from "./routes/vehicles.routes";

// Middlewares
import { globalLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./middlewares/notFoundHandler";

// Logger
import logger from "./utils/logger";

// Re-export Prisma client for backward compatibility
export { prisma };

// Initialize Express app
const app: Express = express();

app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

const API_PREFIX = "/api/v1";

// ==================== MIDDLEWARE ====================

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "development"
      ? "*"
      : process.env.CORS_ORIGIN?.split(",") || "*",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Clerk middleware - must come before body parsing
const clerkPubKey = process.env.CLERK_PUBLISHABLE_KEY?.trim();
const clerkSecretKey = process.env.CLERK_SECRET_KEY?.trim();

if (clerkPubKey && clerkSecretKey) {
  app.use(
    clerkMiddleware({
      publishableKey: clerkPubKey,
      secretKey: clerkSecretKey,
    }),
  );
} else {
  app.use(clerkMiddleware());
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    }),
  );
}

// Rate limiting
app.use(globalLimiter);

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    body: req.body,
    params: req.params,
    query: req.query,
  });
  next();
});

// ==================== ROUTES ====================

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Nomad Drive API",
    version: "1.0.0",
    documentation: `${process.env.API_BASE_URL}/docs`,
  });
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes with prefix
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/user`, userRoutes);
app.use(`${API_PREFIX}/vehicle`, vehicleRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ==================== SERVER START ====================

// Handle graceful shutdown
const gracefulShutdown = async () => {
  logger.info("Received shutdown signal, closing server gracefully...");

  try {
    await prisma.$disconnect();
    logger.info("Database connection closed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info("Database connected successfully");

    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
      logger.info(
        `📡 API Base URL: ${process.env.API_BASE_URL || `http://localhost:${PORT}`}`,
      );
      logger.info(
        `🔗 Health check: ${
          process.env.API_BASE_URL || `http://localhost:${PORT}`
        }/health`,
      );
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
