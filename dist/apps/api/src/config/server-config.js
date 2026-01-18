const dotenv = require("dotenv");
dotenv.config();
module.exports = {
    PORT: process.env.PORT || 5000,
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
};
