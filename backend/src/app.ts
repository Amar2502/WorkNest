import express from "express";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userroutes";
import workspaceRoutes from "./routes/workspaceroutes";
import cors from "cors";
import projectRoutes from "./routes/projectroutes";

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


app.use("/user", userRoutes);
app.use("/workspace", workspaceRoutes);
app.use("/project", projectRoutes);

export default app;