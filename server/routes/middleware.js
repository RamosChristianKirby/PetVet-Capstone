import jwt from "jsonwebtoken";
import User from "../models/users.js";
import { asyncRoute, fail } from "../lib/http.js";

export default asyncRoute(async (req, _res, next) => {
  const match = req.headers.authorization?.match(/^Bearer (\S+)$/i);
  if (!match) fail(401, "Please sign in to continue.");
  let decoded;
  try {
    decoded = jwt.verify(match[1], req.app.locals.jwtSecret, {
      algorithms: ["HS256"],
    });
  } catch {
    fail(401, "Your session expired. Please sign in again.");
  }
  if (
    !decoded ||
    typeof decoded !== "object" ||
    !/^[a-f\d]{24}$/i.test(decoded.id || "")
  )
    fail(401, "Invalid session.");
  const user = await User.findById(decoded.id);
  if (!user) fail(401, "Account not found. Please sign in again.");
  req.user = user;
  req.userId = user.id;
  req.userRole = user.role;
  next();
});
export const doctorOnly = (req, _res, next) => {
  if (req.userRole !== "doctor")
    return next(
      Object.assign(
        new Error("This action is available to veterinary staff only."),
        { status: 403 },
      ),
    );
  next();
};
