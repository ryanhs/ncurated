module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: ['airbnb-base', 'plugin:jest/recommended', 'plugin:prettier/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    fetch: 'readonly',
    fetchMock: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  plugins: ['jest'],
  rules: {
    'camelcase': 'off',
    'no-console': 'warn',
    'no-trailing-spaces': 'off',
    'global-require': 'off',
    'no-underscore-dangle': 'off', // mongoId
    'padded-blocks': 'off',
    'no-unused-vars': 'warn',
    'no-param-reassign': ['error', { props: false }],
    'radix': 'warn',
    'max-len': [
      'error',
      { code: 120, comments: 200, ignoreTrailingComments: true, ignoreUrls: true },
    ],
    'prettier/prettier': ['error'],
    "jest/no-focused-tests": "warn",
    "jest/no-standalone-expect": "warn",
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      rules: {
        'no-unused-vars': 'off',
        'no-console': 'off',
        'prefer-const': 'off',
      },
    },
    {
      files: ['*.md'],
      rules: {
        'arrow-body-style': 0,
        'consistent-return': 0,
        'flowtype/require-valid-file-annotation': 0,
        'import/no-extraneous-dependencies': 0,
        'import/no-unresolved': 0,
        'jest/no-focused-tests': 0,
        'jest/no-identical-title': 0,
        'jest/valid-expect': 0,
        'no-undef': 0,
        'no-unused-vars': 0,
        'prettier/prettier': 0,
        'react/jsx-no-undef': 0,
        'react/react-in-jsx-scope': 0,
        'sort-keys': 0,
      },
    },
  ],
};
