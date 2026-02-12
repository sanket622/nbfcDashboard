const { override, removeModuleScopePlugin } = require('customize-cra');

module.exports = override(
  removeModuleScopePlugin(),
  (config) => {
    config.module.rules.push({
      test: /\.m?js/,
      resolve: {
        fullySpecified: false,
      },
    });
    return config;
  }
);
