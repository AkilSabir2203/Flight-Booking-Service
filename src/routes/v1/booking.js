import express from "express";
import { BookingController } from "../../controllers/index.js";

const router = express.Router();

router.post("/", BookingController.createBooking);
router.post("/payments", BookingController.makePayment);

export default router;
