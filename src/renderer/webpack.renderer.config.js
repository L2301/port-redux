const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const rules = require('../../webpack.rules');
const plugins = require('../../webpack.plugins');
const FixNedb = require('../../webpack.fixnedbpath');


rules.push({
  test: /\.css$/i,
  use: [
    {
      loader: MiniCssExtractPlugin.loader,
    },
    {
      loader: 'css-loader',
      options: {importLoaders: 1},
    },
    {
      loader: 'postcss-loader',
    },
  ],
});

module.exports = {
  module: {
    rules,
  },
  plugins,
  target: 'electron-renderer',
  output: {
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    plugins: [new FixNedb()]
  },
  // The background_window entry pulls in nedb, node-ipc, and node-pty (via
  // terminal-service in main, but the renderer config also handles
  // landscape-preload and friends). Keep native deps as commonjs externals so
  // their compiled .node binaries — placed in node_modules by electron-rebuild —
  // can be loaded at runtime instead of bundled out of existence.
  externals: {
    'node-pty': 'commonjs node-pty',
    'nedb': 'commonjs nedb',
    'nedb-async': 'commonjs nedb-async',
    'node-ipc': 'commonjs node-ipc',
  },
};
