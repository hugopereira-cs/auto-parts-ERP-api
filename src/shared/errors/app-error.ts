export class AppError extends Error {
	public readonly statusCode: number;
	public readonly code: string;
	public readonly details?: unknown;

	constructor(
		message: string,
		statusCode = 400,
		code = "BAD-REQUEST",
		details?: unknown,
	) {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
		this.details = details;

		// Garante que o nome da classe apareça no stack trace
		this.name = "AppError";

		// Mantém o stack trace limpo no V8 (Node.js)
		Error.captureStackTrace?.(this, this.constructor);
	}
}
