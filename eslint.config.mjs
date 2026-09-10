import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [".next", "out", "dist", "build", "storybook-static", "node_modules", "next-env.d.ts"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    files: [
      "src/views/recording/ui/**/*.{ts,tsx}",
      "src/views/recording/services/hooks/**/*.{ts,tsx}",
      "src/views/analysis-result/ui/**/*.{ts,tsx}",
      "src/shared/services/hooks/**/*.{ts,tsx}",
    ],
    ignores: ["**/__tests__/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/services/server/**",
                "**/supabase/server",
                "**/service-role",
                "**/logging/pino",
                "node:*",
                "pino",
              ],
              message: "서버 구현 대신 명시적인 Server Action 또는 클라이언트 어댑터를 사용하세요.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSInterfaceDeclaration",
          message: "타입 계약은 해당 모듈의 models에 선언하세요.",
        },
        {
          selector: "TSTypeAliasDeclaration",
          message: "타입 계약은 해당 모듈의 models에 선언하세요.",
        },
      ],
    },
  },
  {
    files: [
      "src/features/recording-storage/**/*.{ts,tsx}",
      "src/features/roleplay-sessions/**/*.{ts,tsx}",
    ],
    ignores: ["**/__tests__/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/views/**", "@/widgets/**", "@/app/**"],
              message: "Feature는 상위 레이어에 의존할 수 없습니다.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/views/analysis-result/services/server/*ResultPageData.ts",
      "src/views/analysis-result/services/server/loadSessionAnalysis.ts",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.property.name='requestAnalysisJob']",
          message: "결과 조회에서 분석 job을 생성하지 마세요.",
        },
      ],
    },
  },
  eslintConfigPrettier,
);
