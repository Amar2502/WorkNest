import app from "./app";
import config from "./config/config";
import { dbConnect } from "./config/db";

dbConnect();

app.listen(config.port, () => {
    console.log(`✅ Server is running on port ${config.port}`);
});
