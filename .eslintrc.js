module.exports = {
  extends: [
    'google',
    'eslint:recommended',
  ],
  plugins: [
    'unused-imports',
  ],
  env: {
    browser: true,
    es2021: true,
  },
  globals: {
    window: true,
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'arrow-parens': ['error', 'always'],
    indent: ['error', 2],
    // https://github.com/typescript-eslint/typescript-eslint/issues/1824
    // '@typescript-eslint/indent': ['error', 2],
    'max-len': [
      1,
      {
        code: 110,
        ignoreComments: true,
        ignorePattern: '^(\\s*[a-zA-Z_]+: \'[^\']+\'[,;]*)|(.*interpolate.*)|(.*require.*)|(.*_\\.template.*)|(<svg .*)|(<rect .*)|(<polygon .*)$',
        ignoreRegExpLiterals: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        tabWidth: 2,
      },
    ],
    'no-console': 'warn',
    'no-invalid-this': 'off',
    'no-mixed-operators': 'error',
    'no-multiple-empty-lines': ['warn', { max: 1}],
    'no-nested-ternary': 'error',
    'no-param-reassign': 'error',
    'no-plusplus': 'error',
    'object-curly-spacing': ['warn', 'always'],
    'quote-props': ['error', 'as-needed'],
    quotes: ['error', 'single'],
    radix: [1, 'as-needed'],
    'require-jsdoc': 'off',
    semi: ['error', 'always'],
    'space-infix-ops': ['error', { int32Hint: false }],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        vars: 'all',
        varsIgnorePattern: '^_',
      },
    ],
  },
};