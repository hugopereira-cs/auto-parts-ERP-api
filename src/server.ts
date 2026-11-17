import createApp from "./app";

const app = createApp();
const PORT = process.env.PORT || 3333;

const startServer = () => {
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
};

startServer();
