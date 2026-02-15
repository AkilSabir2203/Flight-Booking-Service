import express from "express";
import { info } from "../../controllers/index.js";
import bookingRoutes from "./booking.js";

const router = express.Router();

router.get("/info", info);
router.use("/bookings", bookingRoutes);

export default router;
