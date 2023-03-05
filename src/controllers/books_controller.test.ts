import * as bookService from "../services/books";
import request from "supertest";
import { app } from "../app";
import { Book } from "../models/book";

jest.mock("../services/books");

const dummyBookData = [
	{
		bookId: 1,
		title: "The Hobbit",
		author: "J. R. R. Tolkien",
		description: "Someone finds a nice piece of jewellery while on holiday.",
	},
	{
		bookId: 2,
		title: "The Shop Before Life",
		author: "Neil Hughes",
		description:
			"Before being born, each person must visit the magical Shop Before Life, where they choose what kind of person they will become down on Earth...",
	},
];

afterEach(() => {
	jest.clearAllMocks();
});

describe("GET /api/v1/books endpoint", () => {
	test("status code successfully 200", async () => {
		// Act
		const res = await request(app).get("/api/v1/books");

		// Assert		
		expect(res.statusCode).toEqual(200);
	});

	test("books successfully returned as empty array when no data", async () => {
		// Arrange
		jest.spyOn(bookService, "getBooks").mockResolvedValue([]);
		// Act
		const res = await request(app).get("/api/v1/books");

		// Assert
		expect(res.body).toEqual([]);
		expect(res.body.length).toEqual(0);
	});

	test("books successfully returned as array of books", async () => {
		// Arrange

		// NB the cast to `Book[]` takes care of all the missing properties added by sequelize
		//    such as createdDate etc, that we don't care about for the purposes of this test
		jest
			.spyOn(bookService, "getBooks")
			.mockResolvedValue(dummyBookData as Book[]);

		// Act
		const res = await request(app).get("/api/v1/books");

		// Assert
		expect(res.body).toEqual(dummyBookData);
		expect(res.body.length).toEqual(2);
	});
});

describe("GET /api/v1/books/{bookId} endpoint", () => {
	test("status code successfully 200 for a book that is found", async () => {
		// Arrange
		jest
			.spyOn(bookService, "getBook")
			.mockResolvedValue(dummyBookData[1] as Book);

		// Act
		const res = await request(app).get("/api/v1/books/2");

		// Assert
		expect(res.statusCode).toEqual(200);
	});

	test("status code successfully 404 for a book that is not found", async () => {
		// Arrange

		jest
			.spyOn(bookService, "getBook")
			// this is a weird looking type assertion!
			// it's necessary because TS knows we can't actually return unknown here
			// BUT we want to check that in the event a book is missing we return a 404
			.mockResolvedValue(undefined as unknown as Book);
		// Act
		const res = await request(app).get("/api/v1/books/77");

		// Assert
		expect(res.statusCode).toEqual(404);
		expect(res.body.hasOwnProperty('availableBooks')).toBe(true);
		// also sends a list of available books
	});

	test("controller successfully returns book object as JSON", async () => {
		// Arrange
		jest
			.spyOn(bookService, "getBook")
			.mockResolvedValue(dummyBookData[1] as Book);

		// Act
		const res = await request(app).get("/api/v1/books/2");

		// Assert
		expect(res.body).toEqual(dummyBookData[1]);
	});
});

// POST is for adding a new book
describe("POST /api/v1/books endpoint", () => {
	test("status code successfully 201 for saving a valid book", async () => {
		// Act
		const res = await request(app)
			.post("/api/v1/books")
			.send({ bookId: -1, title: "Fantastic Mr. Fox", author: "Roald Dahl", description: "" });
			// server requires all fields now when adding
		// Assert
		expect(res.statusCode).toEqual(201);
	});

	test("status code 400 when saving ill formatted JSON", async () => {
		// Arrange - we can enforce throwing an exception by mocking the implementation
		//jest.spyOn(bookService, "saveBook").mockImplementation(() => {
		//	throw new Error("Error saving book");
		//});
		// the book controller checks for missing fields

		// Act
		const res = await request(app)
			.post("/api/v1/books")
			.send({ title: "Fantastic Mr. Fox", author: "Roald Dahl" });
			// missing title and description

		// Assert
		expect(res.statusCode).toEqual(400);
		const msg = res.body.message.toLowerCase();		
		expect(msg.indexOf('bookid')).not.toBe(-1);
		expect(msg.indexOf('description')).not.toBe(-1);
		// expecting list of missing field names
	});
});

// PUT is for updating an existing book
describe("PUT /api/v1/books endpoint", () => {
	test("status code successfully 200 for updating a valid book", async () => {
		// Arrange
		// mocking the book service to return a book given it's ID
		const book = { bookId: 1, title: "Fantastic Mr. Fox", author: "Roald Dahl", description: "" };
		jest
			.spyOn(bookService, "getBook")
			.mockResolvedValue(book as Book);

		// Act
		// update the book with PUT
		const book2 = { bookId: 1, title: "Fantastic Mr. Fox", author: "Roald Dahl", description: "Some text added" };
		const res = await request(app)
			.put("/api/v1/books")
			.send(book2);

		// Assert
		expect(res.statusCode).toEqual(200);
		const msg = res.body.message as string;			
		expect(msg.toLowerCase().indexOf('book updated')).not.toBe(-1);
		// expecting message as well
	});

	test("status code 400 for updating a book with missing fields", async () => {
		// Act
		const book = { title : "Javascript for Fun", author : "Fred" };
		const res = await request(app)
			.put("/api/v1/books")
			.send(book);
		// missing bookID and description

		// Assert
		expect(res.statusCode).toEqual(400);
		const msg = res.body.message as string;		
		expect(msg.indexOf('missing field')).not.toBe(-1);
		// expecting list of missing fields returned
	});

	test("status code 404 for updating a book with ID not present in database", async () => {
		// Arrange
		// mock an undefined return value from book server
		jest
			.spyOn(bookService, "getBook")
			.mockResolvedValue(undefined as unknown as Book);

		// Act
		const book = { bookId : 99, title : "Javascript for Fun", author : "Fred", description : "some text added" };
		const res = await request(app)
			.put("/api/v1/books")
			.send(book);

		// Assert
		expect(res.statusCode).toEqual(404);
		const msg = res.body.message as string;
		expect(msg.toLowerCase().indexOf('book not found')).not.toBe(-1);
	});
});

describe("DELETE /api/v1/books/{bookId} endpoint", () => {
	test("status code error 404 for deleting a book with invalid book ID", async () => {
		// Arrange
		// mocking the book service to return undefined
		jest
			.spyOn(bookService, "getBook")
			.mockResolvedValue(undefined as unknown as Book);

		// Act
		const res = await request(app)
			.delete("/api/v1/books/1");			

		// Assert
		expect(res.statusCode).toEqual(404);
	});
	test("status code success 200 for deleting a valid book", async () => {
		// Arrange
		// mocking the book service to return the book to be deleted
		const book = { bookId: 1, title: "Fantastic Mr. Fox", author: "Roald Dahl", description: "" };
		jest
			.spyOn(bookService, "getBook")
			.mockResolvedValue(book as Book);

		// Act
		const res = await request(app).delete("/api/v1/books/1");

		// Assert
		expect(res.statusCode).toEqual(200);
	});
});
