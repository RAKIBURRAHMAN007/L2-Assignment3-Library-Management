import { Server } from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

let server: Server;
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k53g2.mongodb.net/advance-note-app?retryWrites=true&w=majority&appName=Cluster0`;

async function main() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("DB Connection Error:", error);
  }
}

main();
