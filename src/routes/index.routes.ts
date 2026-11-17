import { Router } from "express";

const router = Router();

// Retorna o status do servidor, nome do projeto e timestamp
router.get("/", (_req, res) => {
	res.json({
		status: "ok",
		project: "ERP Autopeças API",
		timestamp: new Date().toISOString(),
	});
});

router.get("/hello", (_req, res) => {
	res.json({ message: "Hello, World!" });
});

export default router;
