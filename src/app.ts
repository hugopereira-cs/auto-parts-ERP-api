import express from "express";
import { errorHandler } from "./middlewares/error-handler";
import { notFound } from "./middlewares/not-found";
import router from "./routes/index.routes";

function createApp() {
	// Cria instância do Express
	const app = express();

	// Rigistra middleware global para ler o body das requisições
	app.use(express.json());

	// Rigistra o router principal com o prefixo /api
	app.use("/api", router);

	// Rigistra o middleware de 404 (Not Found)
	app.use(notFound);

	// Rigistra o middleware de tratamento de erros (ÚLTIMO middleware)
	app.use(errorHandler);

	return app;
}

export default createApp;
