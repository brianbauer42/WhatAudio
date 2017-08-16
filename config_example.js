// Setup Instructions:
// Rename this file (or a copy of it) to config.js
// Fill in the sessionSecret and mongoUri valuues before starting your server.

module.exports = {
    sessionSecret: "WlriySbi1bbRLOpCAxSCCcomZbo7YODbVPME5jU362c0TZ7TC62u7C33M7cnmL7y",
    mongoUri: "mongodb://localhost:27017/InfiniteTesting",
    productionPort: 80,
    devPort: 8080,
    contactPageEmail: "bbauer@student.42.us.org",
    uploadDir: "/InfAudio",
    allowRegistrations: false,
    email: {
        smtpServer: "",
        login: "",
        password: ""
    }
}