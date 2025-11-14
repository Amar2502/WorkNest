import app from "./app";
import config from "./config/config";
import { dbConnect } from "./config/db";

dbConnect();

app.get("/", (req, res) => {
    res.send("Hello World");
});

console.log("app is running");


app.listen(config.port, () => {
    console.log(`✅ Server is running on port ${config.port}`);
    console.log(`✅ Server is running on http://localhost:${config.port}`);
});
