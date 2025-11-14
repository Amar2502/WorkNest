import dotenv from "dotenv";

dotenv.config();

const config = {
    port: process.env.PORT || 3000,
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_USER: process.env.DB_USER || "root",
    DB_PASSWORD: process.env.DB_PASSWORD || "",
    DB_NAME: process.env.DB_NAME || "test",
    JWT_SECRET: process.env.JWT_SECRET || "secret",
}

export default config;

