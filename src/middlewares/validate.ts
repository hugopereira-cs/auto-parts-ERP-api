import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

interface ValidationSchemas {
	body?: ZodType;
	query?: ZodType;
	params?: ZodType;
}

// Recebe schemas Zod opcionais (body, query, params) e retorna um middleware do Express
export const validate = (schemas: ValidationSchemas) => {
	return async (
		req: Request,
		_res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			if (schemas.body) {
				// parseAsync é uma boa prática, já que o middleware é genérico e receberá schemas de todos os módulos do ERP
				// Ele funciona tanto para validação assíncrona, quanto síncrona
				req.body = await schemas.body.parseAsync(req.body);
			}

			if (schemas.params) {
				// Type assertion necessária porque parseAsync retorna unknown e req.params espera ParamsDictionary
				req.params = (await schemas.params.parseAsync(
					req.params,
				)) as Request["params"];
			}

			if (schemas.query) {
				// No Express 5, req.query é um getter somente leitura; Object.defineProperty permite sobrescrevê-lo com os dados validados
				const parsedQuery = await schemas.query.parseAsync(req.query);
				Object.defineProperty(req, "query", {
					value: parsedQuery,
					writable: true,
					enumerable: true,
					configurable: true,
				});
			}

			next();
		} catch (error) {
			next(error);
		}
	};
};
