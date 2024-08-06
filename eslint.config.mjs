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
        ignores: ['src/companionapp/'],
        languageOptions: { globals: globals.browser },
    },
    {
        files: ['src/companionapp/**/*.js', 'build/**/*.js'],
        languageOptions: { globals: globals.node },
    },
    {
        ignores: ['compressed/', 'src/companionapp/gleitzeitkonto-api'],
    },
    pluginJs.configs.recommended,
    eslintConfigPrettier,
];
