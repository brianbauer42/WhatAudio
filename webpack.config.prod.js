var path = require('path');
var webpack = require('webpack');

module.exports = {
  devServer: {
    historyApiFallback: true
  },
  devtool: 'source-map',
  entry: [
    './client/index.js'
  ],
  mode: 'production',
  output: {
    path: path.join(__dirname, 'static'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: '/node_modules/',
        include: path.join(__dirname, 'client'),
        query: {
          plugins: ['transform-runtime'],
          presets: ['env', 'react']
        }
      },
      {
        test: /\.css$/,
        loaders: ["style-loader", "css-loader"]
      },
      {   // load images without inlining them into the bundle
        test: /\.(jpg|png)$/,
        loader: 'file?name=[path][name].[hash].[ext]',
        include: path.join(__dirname, 'assets/img')
      }
    ]
  },
  optimization: {
    minimize: true
  }
};