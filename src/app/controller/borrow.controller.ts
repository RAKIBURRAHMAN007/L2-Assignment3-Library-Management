import express, { Request, Response } from "express";
import { Book } from "../model/book.model";
import { Borrow } from "../model/borrow.model";

export const borrowRoutes = express.Router();

borrowRoutes.post(
  "/borrow",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { book, quantity, dueDate } = req.body;
      console.log(req.body);

      if (!book || typeof book !== "string") {
        return res.status(400).json({
          success: false,
          message: "Book ID must be a valid string.",
        });
      }

      const parsedQuantity = parseInt(quantity);
      if (!parsedQuantity || parsedQuantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a positive number.",
        });
      }

      const parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date format.",
        });
      }

      const foundBook = await Book.findById(book);

      if (!foundBook) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }

      if (foundBook.copies < parsedQuantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough copies available. Available: ${foundBook.copies}`,
        });
      }

      foundBook.copies -= parsedQuantity;
      await foundBook.updateAvailability();
      await foundBook.save();

      const borrow = await Borrow.create({
        book,
        quantity: parsedQuantity,
        dueDate: parsedDueDate,
      });

      res.status(201).json({
        success: true,
        message: "Book borrowed successfully",
        data: borrow,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Borrow failed",
        error: {
          message: error.message,
          name: error.name,
        },
      });
    }
  }
);

borrowRoutes.get("/borrow", async (req: Request, res: Response) => {
  try {
    const summary = await Borrow.aggregate([
      {
        $group: {
          _id: "$book",
          totalQuantity: { $sum: "$quantity" },
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookInfo",
        },
      },
      {
        $unwind: "$bookInfo",
      },
      {
        $project: {
          _id: 0,
          book: {
            title: "$bookInfo.title",
            isbn: "$bookInfo.isbn",
          },
          totalQuantity: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Borrowed books summary retrieved successfully",
      data: summary,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to get borrowed books summary",
      error: error.message,
    });
  }
});
