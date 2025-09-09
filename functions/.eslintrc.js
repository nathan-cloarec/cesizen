module.exports = {
  env: {
    node: true,          // <-- cette ligne est capitale
    es2021: true
  },
  extends: [
    "eslint:recommended"
  ],
  parserOptions: {
    ecmaVersion: "latest"
  },
  rules: {}
};
