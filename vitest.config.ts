import { defineConfig } from "vitest/config"; // defineConfig fornece autocomplete e checagem de tipos nas configurações do Vitest

export default defineConfig({
	test: {
		globals: true, // Permite usar funções globais
		environment: "node",
		include: ["tests/**/*.test.ts"], // Garante que o Vitest procure os arquivos de teste, na pasta tests/, e terminados em .test.ts
	},
});
