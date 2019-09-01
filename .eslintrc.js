module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    // Allow paren-less arrow functions only when there's no braces
    'arrow-parens': ['error', 'as-needed', { 'requireForBlockBody': true }],
    // Allow async-await
    'generator-star-spacing': 'off',
    // Allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-console': 'off',
    // Prefer const over let
    'prefer-const': ['error', {
      'destructuring': 'any',
      'ignoreReadBeforeAssign': false
    }],
    // No single if in an "else" block
    'no-lonely-if': 'error',
    // Force curly braces for control flow,
    // including if blocks with a single statement
    'curly': ['error', 'all'],
    // No async function without await
    'require-await': 'error',
    // Force dot notation when possible
    'dot-notation': 'error',
    // Force object shorthand where possible
    'object-shorthand': 'error',
    // No useless destructuring/importing/exporting renames
    'no-useless-rename': 'error',
    // Other
    'no-var': 'error',
    'camelcase': 'off',
  }
}
