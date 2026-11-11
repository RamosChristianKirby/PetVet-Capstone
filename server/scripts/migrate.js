import "dotenv/config";
import mongoose from "mongoose";
import { readConfig } from "../config.js";

function conflicts(records, field, normalize) {
  const seen = new Map();
  const duplicates = [];
  for (const record of records) {
    const value = normalize(record[field] || "");
    if (!value || seen.has(value)) duplicates.push(String(record._id));
    seen.set(value, record._id);
  }
  return duplicates;
}
try {
  const { mongoUri } = readConfig();
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  const users = mongoose.connection.collection("users");
  const pets = mongoose.connection.collection("pets");
  const visits = mongoose.connection.collection("visits");
  const userRows = await users.find({}, { projection: { email: 1 } }).toArray();
  const petRows = await pets
    .find({}, { projection: { rfidNumber: 1, status: 1 } })
    .toArray();
  const collisions = {
    email: conflicts(userRows, "email", (value) =>
      String(value).trim().toLowerCase(),
    ),
    rfid: conflicts(petRows, "rfidNumber", (value) =>
      String(value).trim().toUpperCase(),
    ),
    status: petRows
      .filter(
        (pet) =>
          pet.status &&
          !["active", "inactive"].includes(String(pet.status).toLowerCase()),
      )
      .map((pet) => String(pet._id)),
  };
  console.log(
    "Checked " + userRows.length + " users and " + petRows.length + " pets.",
  );
  if (Object.values(collisions).some((values) => values.length)) {
    console.error(
      "Resolve these record IDs before migration:",
      JSON.stringify(collisions, null, 2),
    );
    process.exitCode = 1;
  } else if (!process.argv.includes("--apply")) {
    console.log(
      "No normalization conflicts found. Back up the database, then rerun with --apply to migrate.",
    );
  } else {
    if (userRows.length)
      await users.bulkWrite(
        userRows.map((user) => ({
          updateOne: {
            filter: { _id: user._id },
            update: { $set: { email: user.email.trim().toLowerCase() } },
          },
        })),
      );
    if (petRows.length)
      await pets.bulkWrite(
        petRows.map((pet) => ({
          updateOne: {
            filter: { _id: pet._id },
            update: {
              $set: {
                rfidNumber: pet.rfidNumber.trim().toUpperCase(),
                status: (pet.status || "active").toLowerCase(),
              },
            },
          },
        })),
      );
    await pets.updateMany(
      { deletedAt: { $exists: false } },
      { $set: { deletedAt: null } },
    );
    await visits.updateMany(
      { status: { $exists: false } },
      { $set: { status: "scheduled" } },
    );
    const indexes = userRows.length ? await users.indexes() : [];
    for (const index of indexes) {
      if (
        index.unique &&
        Object.keys(index.key).length === 1 &&
        index.key.name === 1
      )
        await users.dropIndex(index.name);
    }
    console.log("Migration complete. No records were deleted.");
  }
} catch {
  console.error(
    "Migration failed. Check configuration, database access, and your backup before retrying.",
  );
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
