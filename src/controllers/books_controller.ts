import { Request, Response } from "express";
import { Book } from "../models/book";
import * as bookService from "../services/books";
import { validateNewBook } from "./book_validator";

let nextBookID = 3;

export const getBooks = async (req: Request, res: Response) => {
	const books = await bookService.getBooks();
	res.json(books).status(200);
};

export const getBook = async (req: Request, res: Response) => {
	const bookId = req.params.bookId;
	const book = await bookService.getBook(Number(bookId));

	if (book) {
		res.json(book).status(200);
	} else {
		// book not found so return a list of available books
		// as a JSON object, client can format the list to show to the user
		const summary = await getBookListSummary();		
		res.status(404).json({ message: `Error: book not found (Book ID: ${bookId})`,
			availableBooks: summary });
	}
};

export const saveBook = async (req: Request, res: Response) => {
	const bookToBeSaved = req.body;
	if(bookHasMissingFields(bookToBeSaved, res)) {
		return;
	}

	// ensure book title is unique when adding a new book
	const book = await bookService.getBookByTitle(String(bookToBeSaved.title));
	if (book) {
		const error = `Error: a book with that title already exists '${book.title}'`;
		res.status(400).json({ message: error });
	} else {
		// assign unqiue book ID
		// for now this is just a running counter as the database is only held in memory
		Object.assign(bookToBeSaved, { "bookId": nextBookID });
		nextBookID++;

		try {
			const book = await bookService.saveBook(bookToBeSaved);				
			res.status(201).json(book);
		} catch (error) {
			res.status(400).json({ message: (error as Error).message });
		}
	}
};

// User Story 4 - Update Book By Id Solution
export const updateBook = async (req: Request, res: Response) => {
	const bookUpdateData = req.body;
	if(bookHasMissingFields(bookUpdateData, res)) {
		return;
	}

	const bookId = Number.parseInt(bookUpdateData.bookId);
	const book = await bookService.getBook(bookId);
	if (!book) {
		sendBookNotFoundErrorResponse(res, bookId);
	} else {
		const book = await bookService.updateBook(bookId, bookUpdateData);
		res.status(200).json({ message: `Book updated successfully (Book ID: ${bookId})`});
	}
};

export const deleteBook = async (req: Request, res: Response) => {	
	const bookId = Number.parseInt(req.params.bookId);
	const book = await bookService.getBook(bookId);
	if (!book) {	
		sendBookNotFoundErrorResponse(res, bookId);
	} else {
		await bookService.deleteBook(bookId);
		res.status(200).json({ message: `Book delete successfully (Book ID: ${bookId})`});
	}
};

function sendBookNotFoundErrorResponse(res: Response, bookId : string | number) {
	res.status(404).json({ message: `Error: book not found (Book ID: ${bookId})`});
}

export function bookHasMissingFields(book : Book, res: Response) {
	const missingFields = validateNewBook(book);
	if (missingFields !== undefined) {
		res.status(400).json({ message: `New book is missing field(s): ${missingFields}` });
		return true;
	}
	return false;
}

export async function getBookListSummary() {
	const books = await bookService.getBooks();
	return books.map(book => `${book.bookId} ${book.title}\n`).join();
}
