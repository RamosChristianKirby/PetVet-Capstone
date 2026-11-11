import express from "express";
import auth, { doctorOnly } from "./middleware.js";
import { asyncRoute as route } from "../lib/http.js";
import * as c from "../controllers/controller.js";

const router = express.Router();
router.post("/users/signup", route(c.createUser));
router.post("/users/login", route(c.login));
router.use(auth);
router.get("/users/me", c.getMe);
router.get("/users", doctorOnly, route(c.getUsers));
router.get("/users/:id", doctorOnly, route(c.getUser));
router.put("/users/:id", route(c.updateUser));
router.get("/pets", route(c.getPets));
router.get("/pets/owner", route(c.getPetsByOwner));
router.get("/pet/:id", route(c.fetchPet));
router.post("/pets", route(c.createPet));
router.put("/pets/:id", doctorOnly, route(c.updatePet));
router.put("/pets/details/:id", route(c.updatePetDetails));
router.delete("/pets/:id", doctorOnly, route(c.deletePet));
router.get("/pets/:petId/comments", route(c.getPetComments));
router.post("/pets/comment", doctorOnly, route(c.addPetComment));
router.delete(
  "/pets/comments/:commentId/:petId",
  doctorOnly,
  route(c.removePetComment),
);
router.get("/visits", route(c.getVisits));
router.post("/visits", route(c.createVisit));
router.put("/visits/:id", route(c.updateVisit));
export default router;
