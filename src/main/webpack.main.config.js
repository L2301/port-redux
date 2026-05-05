const os = require('os');
const entry = {
  index: './src/main/index.ts',
}

if (os.platform() === 'win32') {
  entry.conpty_console_list_agent = './node_modules/node-pty/lib/conpty_console_list_agent.js';
}

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry,
  // Put your normal webpack config below here
  module: {
    rules: require('../../webpack.rules'),
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json']
  },
  // Native modules ship a .node binary that electron-rebuild produces in
  // node_modules/<pkg>/build/Release. Bundling them through webpack strips
  // the binary, so leave them as commonjs externals and let electron-forge
  // copy the node_modules tree into the packaged app.
  externals: {
    'node-pty': 'commonjs node-pty',
    'nedb': 'commonjs nedb',
    'node-ipc': 'commonjs node-ipc',
  },
};