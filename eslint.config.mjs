import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
    {
        files: ['**/*.js', '**/*.ts'],
        languageOptions: { sourceType: 'module' },
    },
    {
        files: ['src/**/*.js', 'src/**/*.ts'],
        languageOptions: { globals: globals.browser },
    },
    {
        files: ['scripts/**/*.js', 'scripts/**/*.ts'],
        languageOptions: { globals: globals.node },
    },
    {
        ignores: ['build/'],
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
];
