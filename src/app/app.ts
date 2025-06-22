import express, { Application } from "express";
import { bookRoutes } from "./controller/book.controller";
import { borrowRoutes } from "./controller/borrow.controller";
const app: Application = express();
app.use(express.json());
app.use("/api", bookRoutes);
app.use("/api", borrowRoutes);
app.get("/", (req, res) => {
  res.send("welcome to Library Management");
});
export default app;
