import type { NextFunction, Request, Response } from "express";
import { AppError } from "../shared/errors/app-error";

// Instancia o erro 404 (Not Found) e passa o erro para error-handler usando next()
export function notFound(
	req: Request,
	_res: Response,
	next: NextFunction,
): void {
	next(
		new AppError(
			`Rota ${req.method} ${req.originalUrl} não encontrada`,
			404,
			"ROUTE_NOT_FOUND",
		),
	);
}
