import { Book } from "../models/book";

export const BOOK_FIELD_NAMES = ["bookId", "title", "author", "description"];

/**
 *
 * @param book
 * @returns undefined if object represents a valid book and has all required fields
 *          or error string listing each missing field
 */
export function validateNewBook(book: any) {
	const result = BOOK_FIELD_NAMES
		.filter((field) => !book.hasOwnProperty(field))
		.map(field => field);

	if(result.length > 0) {
		return result.join('\n');
	}

	return undefined;
}
