/** @type {import('sequelize-cli').Migration} */

import { Enums } from "../utils/common/index.js";

const { BOOKED, CANCELLED, INITIATED, PENDING } = Enums.BOOKING_STATUS;

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("Bookings", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    flightId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM,
      allowNull: false,
      values: [BOOKED, CANCELLED, INITIATED, PENDING],
      defaultValue: INITIATED,
    },
    noOfSeats: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    totalCost: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("Bookings");
}
