import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import nounsanitized from 'eslint-plugin-no-unsanitized';

export default [
    {
        files: ['**/*.js', '**/*.ts'],
        languageOptions: { sourceType: 'module' },
        plugins: { 'no-unsanitized': nounsanitized },
        rules: {
            'no-unsanitized/method': 'error',
            'no-unsanitized/property': 'error',
        },
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
