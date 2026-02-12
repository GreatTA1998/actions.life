module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true
  },
  parserOptions: {
    ecmaVersion: 'latest'
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  ignorePatterns: [
    'node_modules/**'
  ],
  rules: {
    'no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }]
  }
}
