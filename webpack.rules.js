module.exports = [
  // Add support for native node modules
  {
    test: /\.node$/,
    use: 'node-loader',
  },
  {
    test: /conpty_console_list_agent/,
    loader: 'string-replace-loader',
    options: {
      search: 'build/Debug',
      replace: 'build/Release'
    }
  },
  // Webpack 5 asset modules (replaces file-loader)
  {
    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
    type: 'asset/resource',
    generator: {
      filename: 'dist/assets/[name][ext]'
    }
  },
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true
      }
    }
  },
];
