export default {
    "tsconfig": "./tsconfig.json",
    "entryPoints": [
        "./src/main.ts",
    ],
    "out": "./docs/public/api/",
    "categorizeByGroup": false,
    "defaultCategory": "Others",
    "categoryOrder": ["Math", "GameNode", "Texture", "*"],
    "plugin": ['typedoc-theme-category-nav'],
    "theme": 'navigation',
    "readme": "./README.md",
    "exclude": ["**/*.test.ts"],
}