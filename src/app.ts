import express, { Application } from "express";
import { bookRoutes } from "./app/controller/book.controller";
import { borrowRoutes } from "./app/controller/borrow.controller";
import cors from "cors";
const app: Application = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://library-management-topaz.vercel.app",
    ],
  })
);
app.use(express.json());
app.use("/api", bookRoutes);
app.use("/api", borrowRoutes);
app.get("/", (req, res) => {
  res.send("welcome to Library Management");
});
export default app;
