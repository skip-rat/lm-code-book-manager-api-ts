import express from "express";
import { initialiseRoutes, router } from "./routes/routes";

export const app = express();

// read server cmd line args
// looking for arg to enable/disable logging server output, so it can be disabled when running tests
const arr = process.argv.slice(2);
export const LOG_SERVER_OUTPUT = arr.find(arg => arg === 'log-server-output') !== undefined;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initialiseRoutes(app, LOG_SERVER_OUTPUT);

