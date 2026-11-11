import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Pets from "../models/pets.js";
import User from "../models/users.js";
import Visit from "../models/visits.js";
import { fail } from "../lib/http.js";
import * as schema from "../lib/validation.js";

const ownerFields = "name email address contact role";
const petScope = (req) => ({
  deletedAt: null,
  ...(req.userRole === "doctor" ? {} : { ownerId: req.userId }),
});
const serializePet = (pet, req) => {
  const result = pet.toObject();
  if (req.userRole !== "doctor") result.doctorComments = [];
  return result;
};
const populatedPet = (query) =>
  query
    .populate("ownerId", ownerFields)
    .populate("publicComments.author", "name role")
    .populate("doctorComments.author", "name role");
export async function accessiblePet(req, id) {
  schema.objectId.parse(id);
  const pet = await populatedPet(Pets.findOne({ _id: id, ...petScope(req) }));
  if (!pet) fail(404, "Pet not found.");
  return pet;
}
function session(user, req) {
  return {
    result: { ...user.toJSON(), id: user.id },
    token: jwt.sign({ id: user.id }, req.app.locals.jwtSecret, {
      algorithm: "HS256",
      expiresIn: "4h",
    }),
  };
}
export const getMe = (req, res) =>
  res.json({ ...req.user.toJSON(), id: req.user.id });
export const getPets = async (req, res) => {
  const pets = await populatedPet(
    Pets.find(petScope(req)).sort({ createdAt: -1, _id: -1 }),
  );
  res.json(pets.map((pet) => serializePet(pet, req)));
};
export const fetchPet = async (req, res) =>
  res.json(serializePet(await accessiblePet(req, req.params.id), req));
export const getPetsByOwner = async (req, res) => {
  const ownerId = schema.objectId.parse(req.query.ownerId || req.userId);
  if (req.userRole !== "doctor" && ownerId !== req.userId)
    fail(403, "You can only view your own pets.");
  const pets = await populatedPet(
    Pets.find({ ...petScope(req), ownerId }).sort({ name: 1 }),
  );
  res.json(pets.map((pet) => serializePet(pet, req)));
};
export const createPet = async (req, res) => {
  const data = schema.petInput.parse(req.body);
  if (req.userRole !== "doctor" && data.vaccinationHistory.length)
    fail(403, "Only veterinary staff can record vaccinations.");
  if (req.userRole !== "doctor" && data.ownerId && data.ownerId !== req.userId)
    fail(403, "You can only register your own pets.");
  data.ownerId =
    req.userRole === "doctor" ? data.ownerId || req.userId : req.userId;
  if (!(await User.exists({ _id: data.ownerId })))
    fail(404, "Owner not found.");
  const pet = await Pets.create(data);
  res.status(201).json(serializePet(await accessiblePet(req, pet.id), req));
};
export const updatePetDetails = async (req, res) => {
  const data = schema.petUpdate.parse(req.body);
  const pet = await accessiblePet(req, req.params.id);
  if (data.version !== undefined && data.version !== pet.__v)
    fail(409, "This record changed. Refresh before saving.");
  if (req.userRole !== "doctor" && data.vaccinationHistory !== undefined)
    fail(403, "Only veterinary staff can update vaccinations.");
  delete data.version;
  Object.assign(pet, data);
  await pet.save();
  res.json(serializePet(pet, req));
};
export const deletePet = async (req, res) => {
  const pet = await accessiblePet(req, req.params.id);
  pet.deletedAt = new Date();
  await pet.save();
  res.json({ message: "Pet archived. Its medical history has been retained." });
};
export const getUsers = async (_req, res) =>
  res.json(await User.find({ role: "pet_owner" }).sort({ name: 1 }));
export const getUser = async (req, res) => {
  const id = schema.objectId.parse(req.params.id);
  const user = await User.findById(id);
  if (!user) fail(404, "Owner not found.");
  res.json(user);
};
export const createUser = async (req, res) => {
  const data = schema.signup.parse(req.body);
  const password = await bcrypt.hash(data.password, 12);
  const user = await User.create({ ...data, password, role: "pet_owner" });
  res.status(201).json(session(user, req));
};
// Missing-account logins still perform a password hash comparison.
const dummyHash = bcrypt.hashSync("not-a-user-password", 12);
export const login = async (req, res) => {
  const data = schema.credentials.parse(req.body);
  const user = await User.findOne({ email: data.email }).select("+password");
  const valid = await bcrypt.compare(
    data.password,
    user?.password || dummyHash,
  );
  if (!user || !valid) fail(401, "Email or password is incorrect.");
  res.json(session(user, req));
};
export const updateUser = async (req, res) => {
  const id = schema.objectId.parse(req.params.id);
  if (id !== req.userId) fail(403, "You can only update your own profile.");
  const data = schema.profile.partial().parse(req.body);
  Object.assign(req.user, data);
  await req.user.save();
  res.json({ ...req.user.toJSON(), id: req.userId });
};
export const getVisits = async (req, res) => {
  const filter = req.userRole === "doctor" ? {} : { ownerId: req.userId };
  if (req.query.petId) {
    await accessiblePet(req, req.query.petId);
    filter.petId = req.query.petId;
  }
  const visits = await Visit.find(filter)
    .sort({ date: 1 })
    .populate({
      path: "petId",
      select: "name petType status rfidNumber",
      match: { deletedAt: null },
    })
    .populate("ownerId", "name");
  res.json(visits.filter((visit) => visit.petId));
};
export const createVisit = async (req, res) => {
  const data = schema.visitInput.parse(req.body);
  const pet = await accessiblePet(req, data.petId);
  if (pet.status !== "active")
    fail(400, "Visits can only be booked for active pets.");
  if (!pet.ownerId)
    fail(
      409,
      "This pet has no available owner account. Contact veterinary staff.",
    );
  if (Date.parse(data.date) < Date.now() - 60000)
    fail(400, "Choose a future appointment time.");
  const visit = await Visit.create({
    ...data,
    ownerId: pet.ownerId?._id || pet.ownerId,
  });
  res.status(201).json(visit);
};
export const updateVisit = async (req, res) => {
  const id = schema.objectId.parse(req.params.id);
  const data = schema.visitUpdate.parse(req.body);
  const visit = await Visit.findOne({
    _id: id,
    ...(req.userRole === "doctor" ? {} : { ownerId: req.userId }),
  });
  if (!visit) fail(404, "Visit not found.");
  await accessiblePet(req, visit.petId.toString());
  if (req.userRole !== "doctor" && data.status && data.status !== "cancelled")
    fail(403, "Only veterinary staff can complete a visit.");
  if (visit.status !== "scheduled")
    fail(409, "This visit is already completed or cancelled.");
  if (data.date && Date.parse(data.date) < Date.now() - 60000)
    fail(400, "Choose a future appointment time.");
  Object.assign(visit, data);
  await visit.save();
  res.json(visit);
};
export const addPetComment = async (req, res) => {
  const data = schema.noteInput.parse(req.body);
  const pet = await accessiblePet(req, data.petId);
  const note = {
    content: data.content,
    author: req.userId,
    visibleToOwner: data.isPublic,
  };
  pet[data.isPublic ? "publicComments" : "doctorComments"].push(note);
  await pet.save();
  res.status(201).json(serializePet(await accessiblePet(req, pet.id), req));
};
export const updatePet = async (req, res) => {
  req.body = {
    petId: req.params.id,
    content: req.body.comment,
    isPublic: req.body.isPublic,
  };
  return addPetComment(req, res);
};
export const getPetComments = async (req, res) => {
  const pet = await accessiblePet(req, req.params.petId);
  res.json({
    publicComments: pet.publicComments,
    doctorComments: req.userRole === "doctor" ? pet.doctorComments : [],
  });
};
export const removePetComment = async (req, res) => {
  const commentId = schema.objectId.parse(req.params.commentId);
  const pet = await accessiblePet(req, req.params.petId);
  const note =
    pet.publicComments.id(commentId) || pet.doctorComments.id(commentId);
  if (!note) fail(404, "Remark not found.");
  note.deleteOne();
  await pet.save();
  res.json({ message: "Remark removed." });
};
export const lookupRfid = async (req, res) => {
  const tag = schema.rfid.parse(req.params.rfid);
  const pet = await populatedPet(
    Pets.findOne({ rfidNumber: tag, ...petScope(req) }),
  );
  if (!pet) fail(404, "No accessible pet is registered with this RFID tag.");
  res.json({
    _id: pet.id,
    rfid: pet.rfidNumber,
    petName: pet.name,
    petType: pet.petType,
    status: pet.status,
    breed1: pet.breed1,
    breed2: pet.breed2,
    ownerName: pet.ownerId?.name || "Owner unavailable",
    contact: pet.contact,
    address: pet.address,
    vaccinationHistory: [...pet.vaccinationHistory].sort(
      (a, b) => b.date - a.date,
    ),
  });
};
