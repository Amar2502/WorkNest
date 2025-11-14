import express from "express";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userroutes";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.get("/", (req, res) => {
    res.send("Hello World");
});


app.use("/users", userRoutes);

export default app;