const { FlatCompat } = require('@eslint/eslintrc');

// FlatCompat requires a recommendedConfig parameter in newer versions
// Use 'eslint:recommended' as the base recommended config so built-in extends resolve
const compat = new FlatCompat({ baseDirectory: __dirname, recommendedConfig: 'eslint:recommended' });

module.exports = [
  // Import everything from the existing legacy config
  ...compat.extends('./.eslintrc.json')
];
