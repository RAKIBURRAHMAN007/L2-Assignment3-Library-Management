# Library Management API

A RESTful Library Management System API built with **Express**, **TypeScript**, and **MongoDB** (using Mongoose). This API enables management of books and borrowing operations with proper validation, business logic enforcement, and aggregation features.

---

## 📖 Assignment Overview

This project is designed as part of Apollo Level 2 Web Development coursework. It demonstrates usage of:

- Schema validation with Mongoose
- Business logic enforcement (e.g., availability control when borrowing books)
- Aggregation pipelines for summaries
- Mongoose static and instance methods
- Middleware (pre/post hooks)
- Filtering and sorting features on API endpoints

---

## 🎯 Features

- **Book Management**

  - Create, update, get (single/all), and delete books
  - Validation of book fields (title, author, genre, isbn, copies, availability)
  - Filtering and sorting support when listing books

- **Borrowing System**

  - Borrow books with quantity and due date validation
  - Business logic to enforce copies availability and update book availability status
  - Borrowed books summary with aggregation (total quantity per book)

- **Error Handling**

  - Proper error responses for validation and other issues

---

## 🔧 Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose ODM

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB (local or Atlas cluster)
- npm or yarn package manager

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Apollo-Level2-Web-Dev/B5A3.git
cd B5A3
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env` file in the root directory and add:

```
MONGODB_URI=<your_mongodb_connection_string>
PORT=5000
```

Replace `<your_mongodb_connection_string>` with your MongoDB URI.

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

The server will start at `http://localhost:5000`.

---

## 📡 API Endpoints

### 1. Create Book

`POST /api/books`

- **Request Body:**

```json
{
  "title": "The Theory of Everything",
  "author": "Stephen Hawking",
  "genre": "SCIENCE",
  "isbn": "9780553380163",
  "description": "An overview of cosmology and black holes.",
  "copies": 5,
  "available": true
}
```

- **Success Response:**

```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "_id": "64f123abc4567890def12345",
    "title": "The Theory of Everything",
    "author": "Stephen Hawking",
    "genre": "SCIENCE",
    "isbn": "9780553380163",
    "description": "An overview of cosmology and black holes.",
    "copies": 5,
    "available": true,
    "createdAt": "2024-11-19T10:23:45.123Z",
    "updatedAt": "2024-11-19T10:23:45.123Z"
  }
}
```

---

### 2. Get All Books

`GET /api/books`

Supports filtering and sorting:

- **Query Parameters:**

| Parameter | Description                    | Example     |
| --------- | ------------------------------ | ----------- |
| filter    | Filter by genre                | `FANTASY`   |
| sortBy    | Field to sort by               | `createdAt` |
| sort      | Sort order (`asc` or `desc`)   | `desc`      |
| limit     | Number of results (default 10) | `5`         |

- **Example:** `/api/books?filter=FANTASY&sortBy=createdAt&sort=desc&limit=5`

- **Success Response:**

```json
{
  "success": true,
  "message": "Books retrieved successfully",
  "data": [
    {
      "_id": "64f123abc4567890def12345",
      "title": "The Theory of Everything",
      "author": "Stephen Hawking",
      "genre": "SCIENCE",
      "isbn": "9780553380163",
      "description": "An overview of cosmology and black holes.",
      "copies": 5,
      "available": true,
      "createdAt": "2024-11-19T10:23:45.123Z",
      "updatedAt": "2024-11-19T10:23:45.123Z"
    }
  ]
}
```

---

### 3. Get Book by ID

`GET /api/books/:bookId`

- **Success Response:**

```json
{
  "success": true,
  "message": "Book retrieved successfully",
  "data": {
    "_id": "64f123abc4567890def12345",
    "title": "The Theory of Everything",
    "author": "Stephen Hawking",
    "genre": "SCIENCE",
    "isbn": "9780553380163",
    "description": "An overview of cosmology and black holes.",
    "copies": 5,
    "available": true,
    "createdAt": "2024-11-19T10:23:45.123Z",
    "updatedAt": "2024-11-19T10:23:45.123Z"
  }
}
```

---

### 4. Update Book

`PUT /api/books/:bookId`

- **Request Body:**

```json
{
  "copies": 50
}
```

- **Success Response:**

```json
{
  "success": true,
  "message": "Book updated successfully",
  "data": {
    "_id": "64f123abc4567890def12345",
    "title": "The Theory of Everything",
    "author": "Stephen Hawking",
    "genre": "SCIENCE",
    "isbn": "9780553380163",
    "description": "An overview of cosmology and black holes.",
    "copies": 50,
    "available": true,
    "createdAt": "2024-11-19T10:23:45.123Z",
    "updatedAt": "2024-11-20T08:30:00.000Z"
  }
}
```

---

### 5. Delete Book

`DELETE /api/books/:bookId`

- **Success Response:**

```json
{
  "success": true,
  "message": "Book deleted successfully",
  "data": null
}
```

---

### 6. Borrow a Book

`POST /api/borrow`

- **Business Logic:**

  - Verify the book has enough available copies.
  - Deduct requested quantity from the book’s copies.
  - If copies become 0, update `available` to `false` (using Mongoose static or instance method).
  - Save borrow record with relevant details.

- **Request Body:**

```json
{
  "book": "64ab3f9e2a4b5c6d7e8f9012",
  "quantity": 2,
  "dueDate": "2025-07-18T00:00:00.000Z"
}
```

- **Success Response:**

```json
{
  "success": true,
  "message": "Book borrowed successfully",
  "data": {
    "_id": "64bc4a0f9e1c2d3f4b5a6789",
    "book": "64ab3f9e2a4b5c6d7e8f9012",
    "quantity": 2,
    "dueDate": "2025-07-18T00:00:00.000Z",
    "createdAt": "2025-06-18T07:12:15.123Z",
    "updatedAt": "2025-06-18T07:12:15.123Z"
  }
}
```

---

### 7. Borrowed Books Summary

`GET /api/borrow`

- **Purpose:** Return summary of borrowed books including total borrowed quantity per book and book details.

- **Implementation:** Uses MongoDB aggregation pipeline to group borrow records by book and sum quantities.

- **Success Response:**

```json
{
  "success": true,
  "message": "Borrowed books summary retrieved successfully",
  "data": [
    {
      "book": {
        "title": "The Theory of Everything",
        "isbn": "9780553380163"
      },
      "totalQuantity": 5
    },
    {
      "book": {
        "title": "1984",
        "isbn": "9780451524935"
      },
      "totalQuantity": 3
    }
  ]
}
```

---

## ⚠️ Error Handling

Standard error response format:

```json
{
  "message": "Validation failed",
  "success": false,
  "error": {
    "name": "ValidationError",
    "errors": {
      "copies": {
        "message": "Copies must be a positive number",
        "name": "ValidatorError",
        "properties": {
          "message": "Copies must be a positive number",
          "type": "min",
          "min": 0
        },
        "kind": "min",
        "path": "copies",
        "value": -5
      }
    }
  }
}
```
