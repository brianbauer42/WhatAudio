// Setup Instructions:
// Copy this file to the server folder and rename it to config.js
// Fill in the sessionSecret and mongoUri values.

module.exports = {
    sessionSecret: {
        secret: ""
    },
    mongoUri: "",
    contactPageEmail: "",
    productionPort: 80,
    devPort: 8080,
    requireInviteCode: false,
    disableRegistration: false,
    outgoingEmail: {
        smtpServer: "",
        login: "",
        password: ""
    },
    formidableConfig: {
        keepExtensions: true,
        multiples: true,
        uploadDir: "./tmp"
    }
}