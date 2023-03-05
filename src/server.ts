import { app, LOG_SERVER_OUTPUT } from "./app";
import { populateDummyData } from "./database/database_seed";
import { Server } from "http";

const environment = process.env.NODE_ENV || "dev";
const PORT = 3000;

console.log(`🌍 Running in ${environment} environment`);

try {
	// Seed the database with some data
	if (environment === "dev") {
		populateDummyData();
	}

	const server = app.listen(PORT, () => {
		if(LOG_SERVER_OUTPUT) console.log(`Server is now listening on port: ${PORT}`);
	})
	.on("error", (error) => {
		console.error("Express Error");
		console.error(error);
	});

	process.on("SIGINT", () => handleShutdown(server));
	process.on("SIGTERM", () => handleShutdown(server));
	process.on("SIGHUP", () => handleShutdown(server));

} catch (e: unknown) {
	console.error("🚨 Top level Error caught 🚨 ");
	console.error((e as Error).message);
}

function handleShutdown(server: Server) {
	server.close(() => {
		process.exit(0);
	});
}
