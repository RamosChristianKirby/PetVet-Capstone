import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { createApp } from "../app.js";
import User from "../models/users.js";
import Pet from "../models/pets.js";
import Visit from "../models/visits.js";

// Disposable local data only. This script deliberately does not load .env.
const mongo = await MongoMemoryServer.create();
await mongoose.connect(mongo.getUri());
const password = await bcrypt.hash("PetVetDemo123!", 12);
const staff = await User.create({
  name: "Dr. Alex Rivera",
  email: "doctor@petvet.demo",
  password,
  role: "doctor",
  address: "Demo Veterinary Clinic, Cagayan de Oro",
  contact: "09123456789",
});
const owner = await User.create({
  name: "Jamie Santos",
  email: "owner@petvet.demo",
  password,
  address: "Demo address, Cagayan de Oro",
  contact: "09123456780",
});
const pets = await Pet.create([
  {
    name: "Mochi",
    ownerId: owner.id,
    petType: "dog",
    breed1: "Golden Retriever",
    dob: "2021-05-12",
    rfidNumber: "00123",
    contact: owner.contact,
    address: owner.address,
    vaccinationHistory: [{ date: "2025-01-18", vaccinationType: "Rabies" }],
    publicComments: [
      {
        content: "Bring the vaccination card to the next visit.",
        author: staff.id,
        visibleToOwner: true,
      },
    ],
  },
  {
    name: "Luna",
    ownerId: owner.id,
    petType: "cat",
    breed1: "Puspin",
    dob: "2023-03-08",
    rfidNumber: "A00024567",
    contact: owner.contact,
    address: owner.address,
  },
  {
    name: "Biscuit",
    ownerId: owner.id,
    petType: "dog",
    breed1: "Aspin",
    dob: "2020-08-21",
    rfidNumber: "00125",
    contact: owner.contact,
    address: owner.address,
  },
]);
await Visit.create(
  pets.slice(0, 2).map((pet, index) => ({
    petId: pet.id,
    ownerId: owner.id,
    date: new Date(Date.now() + (index + 1) * 86400000),
    comment: index ? "Routine checkup" : "Vaccination review",
  })),
);
const port = Number(process.env.DEMO_PORT || 5000);
const server = createApp({
  jwtSecret: randomBytes(48).toString("hex"),
  clientOrigins: [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
  ],
}).listen(port, "127.0.0.1", () => {
  console.log("PetVet disposable demo API ready on http://127.0.0.1:" + port);
  console.log(
    "Demo accounts: doctor@petvet.demo / owner@petvet.demo. Password: PetVetDemo123!",
  );
});
async function stop() {
  server.close();
  await mongoose.disconnect();
  await mongo.stop();
  process.exit(0);
}
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
