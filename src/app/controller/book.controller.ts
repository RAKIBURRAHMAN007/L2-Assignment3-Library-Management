import express, { Request, Response } from "express";
import { z } from "zod";
import { Book } from "../model/book.model";

export const bookRoutes = express.Router();

const createBookZodSchema = z.object({
  title: z.string(),
  author: z.string(),
  genre: z.enum([
    "FICTION",
    "NON_FICTION",
    "SCIENCE",
    "HISTORY",
    "BIOGRAPHY",
    "FANTASY",
  ]),
  isbn: z.string(),
  description: z.string().optional(),
  copies: z.number().min(0, "Copies must be a positive number"),
  available: z.boolean().optional(),
});

bookRoutes.post("/books", async (req: Request, res: Response): Promise<any> => {
  try {
    const body = await createBookZodSchema.parseAsync(req.body);
    const book = await Book.create(body);
    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: book,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      const errors: any = {};

      error.issues.forEach((issue: any) => {
        const field = issue.path[0];
        errors[field] = {
          message: issue.message,
          name: "ValidatorError",
          properties: {
            message: issue.message,
            type: "min",
            min: issue.minimum,
            path: field,
          },
          kind: "min",
          path: field,
          value: req.body[field],
        };
      });

      return res.status(400).json({
        message: "Validation failed",
        success: false,
        error: {
          name: "ValidationError",
          errors,
        },
      });
    }

    res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
});

bookRoutes.get("/books", async (req: Request, res: Response) => {
  try {
    const {
      filter,
      sortBy = "createdAt",
      sort = "desc",
      limit = "10",
    } = req.query;

    const books = await Book.find(filter ? { genre: filter } : {})
      .sort({ [sortBy as string]: sort === "desc" ? -1 : 1 })
      .limit(parseInt(limit as string));

    res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      data: books,
    });
  } catch (error: any) {
    res.status(404).json({
      message: "Failed to fetch books",
      success: false,
      error,
    });
  }
});

bookRoutes.get(
  "/books/:bookId",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const bookId = req.params.bookId;
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }
      res.status(200).json({
        success: true,
        message: "Book retrieved successfully",
        data: book,
      });
    } catch (error: any) {
      res.status(404).json({
        message: "Failed to fetch book",
        success: false,
        error,
      });
    }
  }
);

bookRoutes.patch(
  "/books/:bookId",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const bookId = req.params.bookId;
      const updateBody = req.body;
      const book = await Book.findByIdAndUpdate(bookId, updateBody, {
        new: true,
      });

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }
      await book.updateAvailability();
      await book.save();
      res.status(200).json({
        success: true,
        message: "Book updated successfully",
        data: book,
      });
    } catch (error: any) {
      res.status(404).json({
        message: "Failed to update book",
        success: false,
        error,
      });
    }
  }
);

bookRoutes.delete(
  "/books/:bookId",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const bookId = req.params.bookId;
      const deletedBook = await Book.findByIdAndDelete(bookId);

      if (!deletedBook) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }
      res.status(200).json({
        success: true,
        message: "Book deleted successfully",
        data: null,
      });
    } catch (error) {
      res.status(404).json({
        message: "Failed to delete book",
        success: false,
        error,
      });
    }
  }
);
