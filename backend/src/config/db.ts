import mysql from "mysql2/promise";
import config from "./config";

export const pool = mysql.createPool({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export async function dbConnect() {
    try {
        const connection = await pool.getConnection();
        console.log("✅ MySQL Database connected successfully.");
        connection.release();
    }
    catch (error) {
        console.error("❌ MySQL Database connection failed.");
        process.exit(1);
    }
}