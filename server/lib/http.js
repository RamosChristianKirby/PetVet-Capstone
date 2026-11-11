import { ZodError } from "zod";

export const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
export function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}
export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res
      .status(400)
      .json({
        message: error.issues
          .map(
            (issue) =>
              (issue.path.join(".") || "Request") + ": " + issue.message,
          )
          .join("; "),
      });
  }
  if (error.code === 11000)
    return res
      .status(409)
      .json({ message: "That email or RFID number is already registered." });
  if (["ValidationError", "CastError"].includes(error.name))
    return res
      .status(400)
      .json({ message: "Some fields are invalid. Check your entries." });
  if (error.name === "VersionError")
    return res
      .status(409)
      .json({ message: "This record changed. Refresh and try again." });
  if (error.type === "entity.parse.failed")
    return res
      .status(400)
      .json({ message: "Request body must be valid JSON." });
  if (error.status === 413)
    return res.status(413).json({ message: "Request is too large." });
  const status = error.status >= 400 && error.status < 500 ? error.status : 500;
  if (status === 500) console.error("Request failed:", error.name || "Error");
  res
    .status(status)
    .json({
      message:
        status === 500
          ? "Something went wrong. Please try again."
          : error.message,
    });
}
