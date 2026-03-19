import amqplib from "amqplib";

let channel, connection;

export async function connectQueue() {
  try {
    connection = await amqplib.connect("amqp://localhost");
    channel = await connection.createChannel();

    await channel.assertQueue("noti-queue");
  } catch (error) {
    console.log(error);
  }
}

export async function sendData(data) {
  try {
    await channel.sendToQueue(
      "noti-queue",
      Buffer.from(JSON.stringify(data))
    );
  } catch (error) {
    console.log("queue error", error);
  }
}

export default {connectQueue, sendData};
