// Setup Instructions:
// Copy this file to the server folder and rename it to config.js
// Fill in the sessionSecret and mongoUri strings.

module.exports = {
    sessionSecret: {
        secret: ""
    },
    mongoUri: "",
    formidableConfig: {
        keepExtensions: true,
        multiples: true,
        uploadDir: "./tmp"
    },
    infiniteConfig: {
        allowRegistrations: false,
        email: {
            smtpServer: "",
            login: "",
            password: ""
        }
    }
}