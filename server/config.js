export function readConfig(env = process.env) {
  const mongoUri = env.MONGODB_URI;
  const jwtSecret = env.JWT_SECRET;
  if (!mongoUri)
    throw new Error("MONGODB_URI is required. See server/.env.example.");
  if (
    !jwtSecret ||
    jwtSecret.length < 32 ||
    jwtSecret.startsWith("replace-with-")
  )
    throw new Error("JWT_SECRET must contain at least 32 characters.");
  const port = Number(env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("PORT must be a valid port number.");
  const clientOrigins = (
    env.CLIENT_ORIGINS || "http://localhost:5173,http://localhost:4173"
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return { mongoUri, jwtSecret, port, clientOrigins };
}
