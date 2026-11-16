// Configuration ESLint partagée (fichier PARTAGÉ : modifier seulement par une PR "chore:").
// Les règles "no-restricted-imports" garantissent qu'aucun module n'importe le code d'un autre :
// on passe toujours par src/contrats et src/config.
import tseslint from "typescript-eslint";

const frontiere = (interdits) => ({
  "no-restricted-imports": [
    "error",
    {
      patterns: interdits.map((m) => ({
        // ../temps, ../../temps/phases/... sont interdits ; ../contrats/temps reste autorisé.
        group: [`../**/${m}`, `../**/${m}/**`, "!../**/contrats/**"],
        message: `Import interdit : passe par src/contrats (module ${m} appartient à un autre membre).`,
      })),
    },
  ],
});

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "coverage/**"] },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  { files: ["src/temps/**/*.ts"], rules: frontiere(["lac", "perception"]) },
  { files: ["src/lac/**/*.ts"], rules: frontiere(["temps", "perception"]) },
  { files: ["src/perception/**/*.ts"], rules: frontiere(["temps", "lac"]) },
  { files: ["src/contrats/**/*.ts", "src/config/**/*.ts"], rules: frontiere(["temps", "lac", "perception"]) },
);
