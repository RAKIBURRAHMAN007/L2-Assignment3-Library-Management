import express, { Application } from "express";
import { bookRoutes } from "./controller/book.controller";
const app: Application = express();
app.use(express.json());
app.use("/api", bookRoutes);
app.get("/", (req, res) => {
  res.send("welcome to Library Management");
});
export default app;
