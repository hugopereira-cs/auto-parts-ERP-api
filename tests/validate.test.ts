import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { errorHandler } from "../src/middlewares/error-handler";
import { validate } from "../src/middlewares/validate";

// Cria uma instância do app para testar
function createTestApp() {
	const app = express();
	app.use(express.json());
	const bodySchema = z.object({
		name: z.string().min(3),
		price: z.number().positive(),
	});
	const paramsSchema = z.object({
		id: z.coerce.number().int().positive(),
	});
	const querySchema = z.object({
		page: z.coerce.number().int().positive().default(1),
	});
	// Rota de exemplo validando body
	app.post("/test-body", validate({ body: bodySchema }), (req, res) => {
		res.status(200).json({ body: req.body });
	});
	// Rota de exemplo validando params e query
	app.get(
		"/test-params/:id",
		validate({ params: paramsSchema, query: querySchema }),
		(req, res) => {
			res.status(200).json({ params: req.params, query: req.query });
		},
	);
	app.use(errorHandler);
	return app;
}
const app = createTestApp();
describe("validate middleware", () => {
	it("should accept a valid body and strip unknown fields", async () => {
		const response = await request(app)
			.post("/test-body")
			.send({ name: "Pastilha de Freio", price: 120.5, extra: "ignorar" });
		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			body: { name: "Pastilha de Freio", price: 120.5 },
		});
	});
	it("should return 400 with field details when body is invalid", async () => {
		const response = await request(app)
			.post("/test-body")
			.send({ name: "AB", price: -10 });
		expect(response.status).toBe(400);
		expect(response.body.error.code).toBe("VALIDATION_ERROR");
		expect(response.body.error.message).toBe("Dados de entrada inválidos");
		expect(response.body.error.details).toHaveProperty("name");
		expect(response.body.error.details).toHaveProperty("price");
	});
	it("should validate and coerce params and query", async () => {
		const response = await request(app).get("/test-params/42?page=3");
		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			params: { id: 42 },
			query: { page: 3 },
		});
	});
	it("should return 400 when params or query are invalid", async () => {
		const response = await request(app).get("/test-params/abc?page=-1");
		expect(response.status).toBe(400);
		expect(response.body.error.code).toBe("VALIDATION_ERROR");
		expect(response.body.error.details).toHaveProperty("id");
	});
});
