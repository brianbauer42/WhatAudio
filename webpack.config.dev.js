var path = require("path");
var webpack = require("webpack");

module.exports = {
  devtool: "eval",
  entry: ["webpack-hot-middleware/client", "./client/index.js"],
  mode: "development",
  output: {
    path: path.join(__dirname, "static"),
    filename: "bundle.js",
    publicPath: "/static/"
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: "/node_modules/",
        include: path.join(__dirname, "client"),
        query: {
          plugins: ["transform-runtime"],
          presets: ["env", "react", "react-hmre"]
        }
      },
      {
        test: /\.css$/,
        loaders: ["style-loader", "css-loader"]
      }
    ]
  },
  optimization: {
    noEmitOnErrors: true // NoEmitOnErrorsPlugin
  }
};
