import mongoose from "mongoose";
import { config } from "./config.js";

export const connectToDatabase = async (): Promise<void> => {
  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  await mongoose.connect(config.mongoUri);
  console.log("\x1b[32m%s\x1b[0m", "MongoDB connected successfully");

  // Text/unique indexes are declared on the schemas; make sure they exist.
  await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).createIndexes()));
};

export const disconnectFromDatabase = async (): Promise<void> => {
  await mongoose.connection.close();
};
