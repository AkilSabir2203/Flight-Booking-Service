import cron from "node-cron";
import { CRON_JOBS_EXECUTION_TIME } from "./enums.js";
import { BookingService } from "../../services/index.js";

function scheduleCrons() {
  cron.schedule(`*/${CRON_JOBS_EXECUTION_TIME} * * * *`, async () => {
    try {
      console.log("CRON JOB running...");
      await BookingService.cancelOldBookings();
    } catch (error) {
      console.error("Error in cancelOldBookings:", error);
    }
  });
}

export default scheduleCrons;
