import express from "express";
import redisClient from "./config/redis.js";
import dotenv from "dotenv";
dotenv.config();

import multer from "multer";
import http from "http";
import { WebSocketServer } from "ws";

import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import "./workers/aiAnalysisWorker.js";
import "./workers/resumeTailoringWorker.js";
import "./workers/coverLetterWorker.js";
import "./workers/interviewQuestionWorker.js";

import healthRoutes from "./routes/healthRoutes.js";
import authRoute from "./routes/authRoute.js";
import resumeRoute from "./routes/resumeRoute.js";
import resumeVersionRoute from "./routes/resumeVersionRoute.js";
import jobRoute from "./routes/jobRoute.js";
import applicationRoute from "./routes/applicationRoute.js";
import aiAnalysisRoute from "./routes/aiAnalysisRoute.js";
import resumeUploadRoute from "./routes/resumeUploadRoute.js";
import resumeStructuringRoute from "./routes/resumeStructuringRoute.js";
import resumeTailoringRoute from "./routes/resumeTailoringRoute.js";
import coverLetterRoute from "./routes/coverLetterRoute.js";
import interviewQuestionRoute from "./routes/interviewQuestionRoute.js";

import { createSupabaseAuthClient } from "./config/supabaseAuth.js";

import { authenticateWebSocket } from "./websocket/websocketAuth.js";

import {
  addUserSocket,
  removeUserSocket,
} from "./websocket/websocketManager.js";

import requestIdMiddleware from "./middleware/requestIdMiddleware.js";
import { logger } from "./utils/logger.js";

const app = express();

app.use(requestIdMiddleware);

app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:3000";


// -------------------------
// Security
// -------------------------

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === FRONTEND_URL) {
        return callback(null, true);
      }

      const error = new Error("Origin not allowed by CORS");
      error.status = 403;
      return callback(error);
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  const isSafeMethod = ["GET", "HEAD", "OPTIONS"].includes(req.method);
  const origin = req.get("Origin");

  if (isSafeMethod || !origin || origin === FRONTEND_URL) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Origin not allowed",
  });
});


// -------------------------
// Body parsing
// -------------------------

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: false,
    limit: "100kb",
  })
);

app.use(cookieParser());


// -------------------------
// HTTP request logging
// -------------------------

if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan((tokens, req, res) => {
      logger.info("HTTP request", {
        requestId: req.requestId,
        method: tokens.method(req, res),
        path: req.path,
        statusCode: Number(tokens.status(req, res)),
        responseTimeMs: Number(
          tokens["response-time"](req, res)
        ),
        ip: req.ip,
      });

      return null;
    })
  );
}


// -------------------------
// Routes
// -------------------------

app.use("/api/health", healthRoutes);

app.use("/api/auth", authRoute);

app.use("/api/resume/upload", resumeUploadRoute);

app.use("/api/resume", resumeRoute);

app.use(
  "/api/resume/:resumeId/versions",
  resumeVersionRoute
);

app.use("/api/jobs", jobRoute);

app.use("/api/applications", applicationRoute);

app.use("/api/ai-analyses", aiAnalysisRoute);

app.use(
  "/api/resume/:resumeId/versions/:versionId/structure",
  resumeStructuringRoute
);

app.use(
  "/api/resume/tailor",
  resumeTailoringRoute
);

app.use(
  "/api/cover-letters",
  coverLetterRoute
);

app.use(
  "/api/interview-questions",
  interviewQuestionRoute
);


// -------------------------
// 404 handler
// -------------------------

app.use((req, res) => {
  logger.warn("Route not found", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
  });

  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


// -------------------------
// Global error handler
// -------------------------

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  logger.error("Request failed", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    error: err.message,
  });

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (
    err.message ===
    "Only PDF and DOCX files are allowed"
  ) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  const message =
    process.env.NODE_ENV === "production" &&
    statusCode >= 500
      ? "Internal server error"
      : err.message || "Internal server error";

  return res.status(statusCode).json({
    success: false,
    message,
  });
});


// -------------------------
// HTTP + WebSocket server
// -------------------------

const server = http.createServer(app);

const wss = new WebSocketServer({
  server,
  path: "/ws",
});


// -------------------------
// WebSocket handling
// -------------------------

wss.on("connection", async (socket, request) => {
  try {
    const authResult =
      await authenticateWebSocket(request);

    if (!authResult) {
      logger.warn("WebSocket authentication failed");

      socket.close(
        1008,
        "Authentication required"
      );

      return;
    }

    const { user, accessToken } = authResult;

    const userId = user.id;

    addUserSocket(userId, socket);

    logger.info("WebSocket authenticated", {
      userId,
    });

    socket.send(
      JSON.stringify({
        type: "connection",
        message:
          "WebSocket connection established",
      })
    );


    // -------------------------
    // WebSocket auth expiration check
    // -------------------------

    const authCheckInterval = setInterval(
      async () => {
        try {
          const supabaseAuth =
            createSupabaseAuthClient(
              accessToken
            );

          const {
            data: { user: currentUser },
            error,
          } =
            await supabaseAuth.auth.getUser(
              accessToken
            );

          if (error || !currentUser) {
            logger.warn(
              "WebSocket authentication expired",
              {
                userId,
              }
            );

            clearInterval(
              authCheckInterval
            );

            removeUserSocket(
              userId,
              socket
            );

            socket.close(
              1008,
              "Authentication expired"
            );
          }
        } catch (error) {
          logger.error(
            "WebSocket authentication check failed",
            {
              userId,
              errorName: error?.name,
              errorCode: error?.code,
            }
          );

          clearInterval(
            authCheckInterval
          );

          removeUserSocket(
            userId,
            socket
          );

          socket.close(
            1011,
            "Authentication check failed"
          );
        }
      },
      60 * 1000
    );


    // -------------------------
    // WebSocket close
    // -------------------------

    socket.on("close", () => {
      clearInterval(
        authCheckInterval
      );

      removeUserSocket(
        userId,
        socket
      );

      logger.info(
        "WebSocket disconnected",
        {
          userId,
        }
      );
    });


    // -------------------------
    // WebSocket error
    // -------------------------

    socket.on("error", (error) => {
      logger.error(
        "WebSocket error",
        {
          userId,
          errorName: error?.name,
          errorCode: error?.code,
        }
      );
    });
  } catch (error) {
    logger.error(
      "WebSocket connection error",
      {
        errorName: error?.name,
        errorCode: error?.code,
      }
    );

    socket.close(
      1011,
      "Internal server error"
    );
  }
});


// -------------------------
// Start server
// -------------------------

if (process.env.NODE_ENV !== "test") {
  const startServer = async () => {
    try {
      await redisClient.connect();

      logger.info(
        "Redis connected successfully"
      );

      server.listen(PORT, () => {
        logger.info(
          "SaaS API started",
          {
            port: PORT,
          }
        );

        logger.info(
          "WebSocket server started",
          {
            path: "/ws",
          }
        );
      });
    } catch (error) {
      logger.error(
        "Redis connection failed",
        {
          errorName: error?.name,
          errorCode: error?.code,
        }
      );

      process.exit(1);
    }
  };

  startServer();
}

export default app;

export {
  app,
  server,
  wss,
};