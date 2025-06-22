import { model, Schema } from "mongoose";
import { IBorrow } from "../interface/borrow.interface";
import { number, z } from "zod";

const borrowSchema = new Schema<IBorrow>(
  {
    book: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Book",
    },
    quantity: {
      type: Number,
      min: [1, "Quantity must be at least 1"],
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
export const Borrow = model("Borrow", borrowSchema);
