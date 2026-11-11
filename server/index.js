import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import { readConfig } from "./config.js";

let config;
try {
  config = readConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
try {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  const server = createApp(config).listen(config.port, () => {
    console.log("PetVet API listening on port " + config.port);
  });
  const shutdown = () => {
    const timeout = setTimeout(() => process.exit(1), 10000).unref();
    server.close(async () => {
      await mongoose.disconnect();
      clearTimeout(timeout);
      process.exit(0);
    });
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
} catch {
  console.error(
    "Database connection failed. Check MONGODB_URI and network access.",
  );
  process.exitCode = 1;
}
