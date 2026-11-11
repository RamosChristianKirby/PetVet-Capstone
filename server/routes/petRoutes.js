import express from "express";
import { lookupRfid } from "../controllers/controller.js";
import { asyncRoute } from "../lib/http.js";
import auth from "./middleware.js";
const router = express.Router();
router.get("/rfid/:rfid", auth, asyncRoute(lookupRfid));
export default router;
