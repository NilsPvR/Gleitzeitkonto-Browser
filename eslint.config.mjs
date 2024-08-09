import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
    {
        files: ['**/*.js'],
        languageOptions: { sourceType: 'module' },
    },
    {
        files: ['src/**/*.js'],
        languageOptions: { globals: globals.browser },
    },
    {
        files: ['build/**/*.js'],
        languageOptions: { globals: globals.node },
    },
    {
        ignores: ['compressed/'],
    },
    pluginJs.configs.recommended,
    eslintConfigPrettier,
];
