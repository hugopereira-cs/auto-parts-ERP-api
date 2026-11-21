import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { AppError } from "../shared/errors/app-error";

// Middleware de tratamento de erros (Precisa receber esses 4 parâmetros para que o Express o reconheça como um Error Handler)
export function errorHandler(
	error: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
): void {
	// 1. Erro operacional de negócio conhecido (AppError)
	if (error instanceof AppError) {
		res.status(error.statusCode).json({
			error: {
				code: error.code,
				message: error.message,
				...(error.details ? { details: error.details } : {}),
			},
		});
		return;
	}

	// 2. Erro de validação de schemas do Zod
	if (error instanceof ZodError) {
		res.status(400).json({
			error: {
				code: "VALIDATION_ERROR",
				message: "Dados de entrada inválidos",
				details: error.flatten().fieldErrors,
			},
		});
		return;
	}

	// 3. Log do erro inesperado para observabilidade
	console.error("Erro inesperado capturado:", error);

	// 4. Erro 500 (falha inesperada / bug)
	const isDevelopment = env.NODE_ENV === "development";

	res.status(500).json({
		error: {
			code: "INTERNAL_SERVER_ERROR",
			message: isDevelopment ? error.message : "Erro interno do servidor",
			...(isDevelopment && error.stack ? { stack: error.stack } : {}),
		},
	});
}
