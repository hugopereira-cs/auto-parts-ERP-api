import request from "supertest";
import { describe, expect, it } from "vitest";
import createApp from "../src/app";

const app = createApp();

describe("API base routes", () => {
	it("GET /api - should return an 'ok' status, the project name, and a timestamp", async () => {
		const response = await request(app).get("/api");

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("status", "ok");
		expect(response.body).toHaveProperty("project", "ERP Autopeças API");
		expect(response.body).toHaveProperty("timestamp");
	});

	it("GET /api/non-existent-route - sould return 404 with standardized error JSON", async () => {
		const response = await request(app).get("/api/non-existent-route");

		expect(response.status).toBe(404);
		expect(response.body).toEqual({
			error: {
				code: "ROUTE_NOT_FOUND",
				message: "Rota GET /api/non-existent-route não encontrada",
			},
		});
	});

	it("GET /api/hello - should return the message Hello, World!", async () => {
		const response = await request(app).get("/api/hello");

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			message: "Hello, World!",
		});
	});
});
