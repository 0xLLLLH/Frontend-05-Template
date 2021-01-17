/**
 * @type {import('@babel/core').ConfigFunction}
 */
module.exports = (api) => {
  api.cache(true);

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: "current",
          },
          modules: process.env.BABEL_ENV === "script" ? "auto" : false,
        },
      ],
      ["@babel/preset-typescript", { allExtensions: true, isTSX: true }],
    ],
    plugins: [
      ["@babel/transform-react-jsx", { pragma: "ReflectDOM.createElement" }],
      "@babel/plugin-proposal-object-rest-spread",
      [
        "@babel/plugin-proposal-decorators",
        {
          legacy: true,
        },
      ],
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-optional-chaining",
    ],
  };
};
