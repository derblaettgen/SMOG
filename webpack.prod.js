const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const CompressionPlugin = require("compression-webpack-plugin");
const UglifyWebpackPlugin = require("uglifyjs-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  plugins: [new CompressionPlugin({
    algorithm: "gzip",
    deleteOriginalAssets: true
  })],
  optimization: {
    minimizer: [new UglifyWebpackPlugin({ sourceMap: false })]
  }
});
