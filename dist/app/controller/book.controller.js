"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookRoutes = void 0;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const book_model_1 = require("../model/book.model");
exports.bookRoutes = express_1.default.Router();
const createBookZodSchema = zod_1.z.object({
    title: zod_1.z.string(),
    author: zod_1.z.string(),
    genre: zod_1.z.enum([
        "FICTION",
        "NON_FICTION",
        "SCIENCE",
        "HISTORY",
        "BIOGRAPHY",
        "FANTASY",
    ]),
    isbn: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    copies: zod_1.z.number().min(0, "Copies must be a positive number"),
    available: zod_1.z.boolean().optional(),
});
exports.bookRoutes.post("/books", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = yield createBookZodSchema.parseAsync(req.body);
        const book = yield book_model_1.Book.create(body);
        res.status(201).json({
            success: true,
            message: "Book created successfully",
            data: book,
        });
    }
    catch (error) {
        if (error.name === "ZodError") {
            const errors = {};
            error.issues.forEach((issue) => {
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
}));
exports.bookRoutes.get("/books", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filter, sortBy = "createdAt", sort = "desc", limit = "10", } = req.query;
        const books = yield book_model_1.Book.find(filter ? { genre: filter } : {})
            .sort({ [sortBy]: sort === "desc" ? -1 : 1 })
            .limit(parseInt(limit));
        res.status(200).json({
            success: true,
            message: "Books retrieved successfully",
            data: books,
        });
    }
    catch (error) {
        res.status(404).json({
            message: "Failed to fetch books",
            success: false,
            error,
        });
    }
}));
exports.bookRoutes.get("/books/:bookId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookId = req.params.bookId;
        const book = yield book_model_1.Book.findById(bookId);
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
    }
    catch (error) {
        res.status(404).json({
            message: "Failed to fetch book",
            success: false,
            error,
        });
    }
}));
exports.bookRoutes.patch("/books/:bookId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookId = req.params.bookId;
        const updateBody = req.body;
        const book = yield book_model_1.Book.findByIdAndUpdate(bookId, updateBody, {
            new: true,
        });
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found",
            });
        }
        yield book.updateAvailability();
        yield book.save();
        res.status(200).json({
            success: true,
            message: "Book updated successfully",
            data: book,
        });
    }
    catch (error) {
        res.status(404).json({
            message: "Failed to update book",
            success: false,
            error,
        });
    }
}));
exports.bookRoutes.delete("/books/:bookId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookId = req.params.bookId;
        const deletedBook = yield book_model_1.Book.findByIdAndDelete(bookId);
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
    }
    catch (error) {
        res.status(404).json({
            message: "Failed to delete book",
            success: false,
            error,
        });
    }
}));
