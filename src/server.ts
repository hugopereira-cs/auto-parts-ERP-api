import createApp from "./app";
import { env } from "./config/env";

// Chama a fábrica para obter a aplicação configurada
const app = createApp();

const startServer = () => {
	// Abri o socket TCP na porta indicada e aguarda requisições
	app.listen(env.PORT, () => {
		console.log(`Server is running on port ${env.PORT}`);
	});
};

startServer();
