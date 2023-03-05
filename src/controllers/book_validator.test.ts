import { Book } from "../models/book";
import { validateNewBook } from "./book_validator";

describe("book_validator", () => {
	test("get error string if object is missing any Book fields", async () => {
		const bookNoId = { title : 'Javascript', author : 'Fred', description : 'A programming book' };
        const bookNoTitle = { bookId : -1, author : 'Fred', description : 'A programming book' };
        const bookNoAuthor = { bookId : -1, title : 'Javascript', description : 'A programming book' };
        const bookNoDescr = { bookId : -1, title : 'Javascript', author : 'Fred' };

        const res1 = validateNewBook(bookNoId);      
        expect(res1).toContain('bookId');

        const res2 = validateNewBook(bookNoTitle);      
        expect(res2).toContain('title');

        const res3 = validateNewBook(bookNoAuthor);      
        expect(res3).toContain('author');

        const res4 = validateNewBook(bookNoDescr);      
        expect(res4).toContain('description');
	});

    test("get undefined if object has all Book fields", async () => {
        const book = { bookId : -1, title : 'Javascript', author : 'Fred', description : 'A programming book' };

        const res = validateNewBook(book);      
		expect(res).toBe(undefined);
    });
});