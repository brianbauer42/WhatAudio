module.exports = {
    sessionSecret: "",
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