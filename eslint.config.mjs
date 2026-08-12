import { defineConfig } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends("eslint:recommended"),

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.commonjs,
        },

        ecmaVersion: 2018,
        sourceType: "script",
    },

    settings: {
        "html/html-extensions": [".tmpl"],
        "html/xml-extensions": [".tmpl"],
        "html/indent": "+2",
        "html/report-bad-indent": "error",
    },

    rules: {
        indent: ["error", 2, {
            SwitchCase: 1,
            ignoredNodes: ["TemplateLiteral"],
        }],

        "keyword-spacing": ["warn", {
            before: true,
            after: true,

            overrides: {
                if: {
                    after: false,
                },

                for: {
                    after: false,
                },

                switch: {
                    after: false,
                },

                while: {
                    after: false,
                },

                catch: {
                    after: false,
                },
            },
        }],

        "linebreak-style": ["error", "unix"],
        "no-undef": "off",
        "no-case-declarations": "off",
        quotes: ["error", "double"],
        semi: ["error", "always"],
    },
}, {
    files: ["test/**/*.js"],

    rules: {
        "no-console": "off",
    },
}]);
