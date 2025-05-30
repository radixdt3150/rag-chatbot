module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: ['.eslintrc.js'],
    rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',

        // Prettier rules
        'prettier/prettier': [
            'error',
            {
                singleQuote: false,       // Use single quotes instead of double quotes
                semi: true,              // End statements with a semicolon
                trailingComma: 'es5',    // Add trailing commas where valid in ES5 (like objects and arrays)
                printWidth: 80,          // Set the maximum line width before wrapping
                tabWidth: 4,             // Set the number of spaces per indentation level
                useTabs: false,          // Use spaces instead of tabs
                bracketSpacing: true,    // Print spaces between brackets in object literals
                arrowParens: 'always',   // Always include parentheses around arrow function parameters
            },
        ],
    },
};
