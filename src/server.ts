
import createApp from "./app";
import { env } from "./config/env";

const app = createApp();

const startServer = () => {
	app.listen(env.PORT, () => {
		console.log(`Server is running on port ${env.PORT}`);
	});
};

startServer();
