import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";

import db from "../models/index.js";
import CrudRepository from "./crud-repository.js";
import { Enums } from "../utils/common/index.js";
import AppError from "../utils/errors/app-error.js"; // make sure this path matches

const { Booking } = db;
const { CANCELLED, BOOKED } = Enums.BOOKING_STATUS;

class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }

  async createBooking(data, transaction) {
    const response = await Booking.create(data, { transaction });
    return response;
  }

  async get(data, transaction) {
    const response = await Booking.findByPk(data, { transaction });

    if (!response) {
      throw new AppError(
        "Not able to find the resource",
        StatusCodes.NOT_FOUND
      );
    }
    return response;
  }

  async update(id, data, transaction) {
    const response = await Booking.update(
      data,
      {
        where: { id },
        transaction,
      }
    );
    return response;
  }

  async cancelOldBookings(timestamp) {
    const response = await Booking.update(
      { status: CANCELLED },
      {
        where: {
          [Op.and]: [
            { createdAt: { [Op.lt]: timestamp } },
            { status: { [Op.ne]: BOOKED } },
            { status: { [Op.ne]: CANCELLED } },
          ],
        },
      }
    );
    return response;
  }
}

export default BookingRepository;
