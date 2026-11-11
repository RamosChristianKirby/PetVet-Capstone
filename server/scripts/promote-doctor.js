import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/users.js";
import { readConfig } from "../config.js";
import { email } from "../lib/validation.js";
try {
  const address = email.parse(process.argv[2]);
  const { mongoUri } = readConfig();
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  const user = await User.findOneAndUpdate(
    { email: address },
    { role: "doctor" },
    { new: true, runValidators: true },
  );
  if (!user)
    throw new Error(
      "Account not found. Register the account before promoting it.",
    );
  console.log("Account promoted to veterinary staff.");
} catch {
  console.error(
    "Could not promote account. Check the email, database configuration, and that the account exists.",
  );
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
