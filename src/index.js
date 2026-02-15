import express from "express";
import { ServerConfig, Queue } from "./config/index.js";
import apiRoutes from "./routes/index.js";
import CRON from "./utils/common/cron-jobs.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRoutes);
app.use("/bookingService/api", apiRoutes);

app.listen(ServerConfig.PORT, async () => {
  console.log(`Server is listening on port ${ServerConfig.PORT}`);
  await Queue.connectQueue();
  CRON();                     
});
