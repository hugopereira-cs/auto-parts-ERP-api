import createApp from "./app";
import { env } from "./config/env";

// Chama a fábrica para obter a aplicação configurada
const app = createApp();

const startServer = () => {
	app.listen(env.PORT, () => {
		console.log(`Server is running on port ${env.PORT}`);
	}); // Abri o socket TCP na porta indicada e aguarda requisições
};

startServer();
