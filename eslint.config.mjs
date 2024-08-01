import globals from 'globals';
import pluginJs from '@eslint/js';


export default [
  {
    files: ['**/*.js'],
    languageOptions: { sourceType: 'commonjs'}
  },
  {
    files: ['src/**/*.js'],
    ignores: ['src/companionapp/'],
    languageOptions: { globals: globals.browser }
  },
  {
    files: ['src/companionapp/**/*.js', 'build/**/*.js'],
    languageOptions: { globals: globals.node }
  },
  {
    ignores: ['compressed/', 'src/companionapp/gleitzeitkonto-api']
  },
  pluginJs.configs.recommended,
];