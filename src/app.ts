import express from "express";
import router from "./routes/index.routes";

function createApp() {
	// Cria instância do Express
	const app = express();

	// Rigistra middleware global para ler o body das requisições
	app.use(express.json());

	// Rigistra o router principal com o prefixo /api
	app.use("/api", router);

	return app;
}

export default createApp;
