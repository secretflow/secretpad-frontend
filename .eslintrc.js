module.exports = {
  root: true,
  extends: [require.resolve('@secretflow/config-eslint')],
  ignorePatterns: ['vendor/**/'],
  rules: {
    'react-hooks/exhaustive-deps': 0,
    'react-hooks/rules-of-hooks': 0,
  },
};
