const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin')
module.exports.getWebpackConfig = (config, options) => {
  // console.log(config);
  // console.log(options);
  config.resolve.fallback.stream = require.resolve('stream-browserify');

  if (config.resolve.alias) config.resolve.alias['react-select'] = false;
  else config.resolve.alias = { 'react-select': false };

  // config.resolve.alias["bentley-icons-generic-webfont.css"] = false
  // config.resolve.alias["@bentley/icons-generic-webfont"] = false

  // plugin id from plugin.json
  const pluginId = 'benpolinsky-itwin-viewer';
  
  return {
    ...config,
    plugins: [
      ...config.plugins,
      new CopyPlugin({patterns: [{
        from: `../node_modules/@itwin/**/lib/public/**/*`,
        noErrorOnMissing: true,
    
        // globOptions: {
        //   ignore: ["**/node_modules/**"],
        // },
        to({ absoluteFilename }) {
          console.log('transform!')
          console.log(absoluteFilename)
          const regex = new RegExp("(public(?:\\\\|\/))(.*)");
          return regex.exec(absoluteFilename)[2];
        },
      },
      {
        from: `../node_modules/@bentley/**/lib/public/**/*`,
        noErrorOnMissing: true,
    
        // globOptions: {
        //   ignore: ["**/node_modules/**"],
        // },
        to({ absoluteFilename }) {
          console.log('transform!')
          console.log(absoluteFilename)
          const regex = new RegExp("(public(?:\\\\|\/))(.*)");
          return regex.exec(absoluteFilename)[2];
        },
      }]}),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ],
    output: { ...config.output, publicPath: `public/plugins/benpolinsky-itwin-viewer/` },
  };
};
