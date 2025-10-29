import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: true,
  react: true,
  ignores: [
    '**/node_modules',
    '**/dist',
    '**/es',
    '**/lib',
    '**/.ldesign',
    '**/coverage',
    '**/*.md',
    '**/*.js',
    '**/*.cjs',
    '**/*.mjs'
  ],
  rules: {
    'no-console': 'off',
    'antfu/no-top-level-await': 'off',
    'node/prefer-global/process': 'off',
    'ts/consistent-type-definitions': 'off',
    'ts/no-explicit-any': 'warn',
    'unused-imports/no-unused-vars': 'warn',
    // Disable rules with ESLint 9 compatibility issues
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'unicorn/error-message': 'off'
  }
})
