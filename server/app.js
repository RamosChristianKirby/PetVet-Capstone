import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import postRoutes from "./routes/posts.js";
import petRoutes from "./routes/petRoutes.js";
import { errorHandler } from "./lib/http.js";

export function createApp({ jwtSecret, clientOrigins = [] }) {
  if (!jwtSecret || jwtSecret.length < 32)
    throw new Error("A strong JWT secret is required.");
  const app = express();
  app.locals.jwtSecret = jwtSecret;
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || clientOrigins.includes(origin))
          return callback(null, true);
        callback(
          Object.assign(new Error("This origin is not allowed."), {
            status: 403,
          }),
        );
      },
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.get("/api/health", (_req, res) => {
    const ready = mongoose.connection.readyState === 1;
    res
      .status(ready ? 200 : 503)
      .json({ status: ready ? "ok" : "unavailable" });
  });
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many sign-in attempts. Please try again later." },
  });
  app.use(["/api/users/login", "/api/users/signup"], authLimiter);
  app.use(
    "/api/pets/rfid",
    rateLimit({
      windowMs: 60000,
      limit: 60,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: { message: "Too many lookups. Please wait a minute." },
    }),
  );
  app.use("/api/pets", petRoutes);
  app.use("/api", postRoutes);
  app.get("/", (_req, res) =>
    res.json({ name: "PetVet API", health: "/api/health" }),
  );
  app.use((_req, res) =>
    res.status(404).json({ message: "Endpoint not found." }),
  );
  app.use(errorHandler);
  return app;
}
