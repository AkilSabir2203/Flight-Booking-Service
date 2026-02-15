import axios from "axios";
import { StatusCodes } from "http-status-codes";

import { BookingRepository } from "../repositories/index.js";
import { ServerConfig, Queue } from "../config/index.js";
import db from "../models/index.js";
import AppError from "../utils/errors/app-error.js";
import { Enums } from "../utils/common/index.js";
import { RECEPIENT_EMAIL } from "../config/server-config.js";

const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;
const { FLIGHT_BOOKING_EXPIRATION_TIME } = Enums;

const bookingRepository = new BookingRepository();

export async function createBooking(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const flight = await axios.get(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`
    );

    const flightData = flight.data.data;

    if (data.noofSeats > flightData.totalSeats) {
      throw new AppError(
        "Not enough seats available",
        StatusCodes.BAD_REQUEST
      );
    }

    const totalBillingAmount = data.noofSeats * flightData.price;
    const bookingPayload = { ...data, totalCost: totalBillingAmount };

    const booking = await bookingRepository.createBooking(
      bookingPayload,
      transaction
    );

    await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,
      { seats: data.noofSeats }
    );

    await transaction.commit();
    return booking;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function makePayment(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(
      data.bookingId,
      transaction
    );

    if (bookingDetails.status === CANCELLED) {
      throw new AppError("The booking has expired", StatusCodes.BAD_REQUEST);
    }

    if (bookingDetails.status === BOOKED) {
      throw new AppError("The booking has already been done", StatusCodes.BAD_REQUEST);
    }

    const bookingTime = new Date(bookingDetails.createdAt);
    const currentTime = new Date();

    if (currentTime - bookingTime > FLIGHT_BOOKING_EXPIRATION_TIME * 60000) {
      await cancelBooking(data.bookingId);
      throw new AppError("The booking has expired", StatusCodes.BAD_REQUEST);
    }

    if (bookingDetails.totalCost !== data.totalCost) {
      throw new AppError("Payment amount mismatch", StatusCodes.BAD_REQUEST);
    }

    if (bookingDetails.userId !== data.userId) {
      throw new AppError("User mismatch for booking", StatusCodes.BAD_REQUEST);
    }

    await bookingRepository.update(
      data.bookingId,
      { status: BOOKED },
      transaction
    );

    await Queue.sendData({
      recepientEmail: RECEPIENT_EMAIL,
      subject: "Flight booked Successfully",
      text: `Booking successfully done for booking id: ${data.bookingId}`,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function cancelBooking(bookingId) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRepository.get(bookingId, transaction);

    if (bookingDetails.status === CANCELLED) {
      await transaction.commit();
      return true;
    }

    await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,
      {
        seats: bookingDetails.noofSeats,
        dec: 0,
      }
    );

    await bookingRepository.update(
      bookingId,
      { status: CANCELLED },
      transaction
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function cancelOldBookings() {
  try {
    const time = new Date(
      Date.now() - FLIGHT_BOOKING_EXPIRATION_TIME * 60000
    );

    return await bookingRepository.cancelOldBookings(time);
  } catch (error) {
    console.log(error);
  }
}
