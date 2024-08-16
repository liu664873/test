const path = require('path');
const htmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  mode:"development",
  plugins:[new htmlWebpackPlugin({
    title:"phaser3-start",
    template:"index.html"
  })],
  devServer: {
    hot:true,
    open:true,
    static: {
      directory: path.join(__dirname, 'static'),
      watch: false,
    },
  }
};