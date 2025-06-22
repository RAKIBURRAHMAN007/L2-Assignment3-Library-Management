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
exports.borrowRoutes = void 0;
const express_1 = __importDefault(require("express"));
const book_model_1 = require("../model/book.model");
const borrow_model_1 = require("../model/borrow.model");
exports.borrowRoutes = express_1.default.Router();
exports.borrowRoutes.post("/borrow", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const foundBook = yield book_model_1.Book.findById(book);
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
        yield foundBook.updateAvailability();
        yield foundBook.save();
        const borrow = yield borrow_model_1.Borrow.create({
            book,
            quantity: parsedQuantity,
            dueDate: parsedDueDate,
        });
        res.status(201).json({
            success: true,
            message: "Book borrowed successfully",
            data: borrow,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Borrow failed",
            error: {
                message: error.message,
                name: error.name,
            },
        });
    }
}));
exports.borrowRoutes.get("/borrow", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const summary = yield borrow_model_1.Borrow.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get borrowed books summary",
            error: error.message,
        });
    }
}));
