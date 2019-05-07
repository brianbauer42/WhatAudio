// Setup Instructions:
// Rename this file (or a copy of it) to config.ts
// Fill in the sessionSecret and mongoUri valuues before starting your server.

export const config = {
  sessionSecret: "",
  mongoUri: "mongodb://localhost:27017/Infinite",
  port: 8080,
  contactPageEmail: "",
  uploadDir: "./uploads",
  allowRegistrations: true,
  openRegistrations: false
};
