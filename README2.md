
# Minimalist Book Manager API

### Implementation

- Added 'log-server-output' arg to the server start command to enable server info logging
   to the console, this arg is not set when running tests, so the server output does
   not clutter the test output

- Using Postman to send client requests to API (see postman_test_requests.json)

Get Book by ID
- Server returns list of available books (bookID + title) if a book is requested
   by an ID that does not exist

Add Book
- Server returns error if any Book field is missing
- Server returns error if book title already exists in DB
- Success response is the book with a unique ID assigned

Update Book
- Server returns error if any Book field is missing
- Server returns error if it cannot find a book in the DB with the required ID
- Success response is 200 with message to say book updated

Delete Book
- Server returns error if it cannot find a book in the DB with the required ID
- Success response is 200 with message to say book deleted


### Limitations

- Updating a book uses the book ID to update it in the database,
   sending a book object with the wrong ID will delete the wrong object,
   in a real world app you would not be able to change the book ID
   as it is a unique ID for it in the database
  