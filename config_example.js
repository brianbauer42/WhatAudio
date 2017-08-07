// Setup Instructions:
// Rename this file (or a copy of it) to config.js
// Fill in the sessionSecret and mongoUri valuues before starting your server.

module.exports = {
    sessionSecret: "",
    mongoUri: "",
    productionPort: 80,
    devPort: 8080,
    contactPageEmail: "",
    formidableConfig: {
        encoding: 'utf-8',
        keepExtensions: true,
        multiples: true,
        uploadDir: __dirname + "/uploads"
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
