import * as express from "express";
import { Express } from "express";
import * as booksController from "../controllers/books_controller";

export const router = express.Router();

export function initialiseRoutes(app: Express, logServerOutput = true) {
    addBaseRouter(app, logServerOutput);
    addAPIRoutes(app, logServerOutput);
}

function addBaseRouter(app: Express, logServerOutput = true) {
    router.use((req, res, next) => {
		res.header("Access-Control-Allow-Methods", "GET");
		if(logServerOutput) console.log(`📨 ${req.url}`);
		next();
	});

    if(logServerOutput) console.log("🏠❤️‍🩹  Adding home health check route...");
    router.get("/", (req, res) => {
        res.status(200).send("👍 Okay! The server is responding! 🙌");
    });

    if(logServerOutput) console.log("🛠️  Applying base router to Express server...");
	app.use("/", router);
}

function addAPIRoutes(app: Express, showInfo = true) {
    const apiRouter = express.Router();

	apiRouter.use((req, res, next) => {
		// we'll use this router to return specifically JSON
		res.setHeader("Content-Type", "application/json");
		next();
	});

    apiRouter.get("/books", booksController.getBooks);
    apiRouter.get("/books/:bookId", booksController.getBook);
    apiRouter.post("/books", booksController.saveBook);
    apiRouter.delete("/books/:bookId", booksController.deleteBook);

    // User Story 4 - Update Book By Id Solution
    // Have removed bookID param from url, it can be found from the book object in the request body
    apiRouter.put("/books/", booksController.updateBook);
    app.use("/api/v1", apiRouter);
}


