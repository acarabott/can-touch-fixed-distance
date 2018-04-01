const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

// const buildPath = "./dist";
const buildPath = "/Users/ac/sites/arthurcarabott.com/assets/projects/change-a-number/interactive";

module.exports = {
  entry: ["./src/js/touch-fixed-distance.js"],
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist"
  },
  plugins: [
    // new HtmlWebpackPlugin({
    //   filename: "index.html",
    //   template: "src/index.html",
    //   inject: "head"
    // }),
    // new CleanWebpackPlugin([buildPath])
  ],
  output: {
    filename: "touch-fixed-distance.js",
    path: buildPath,
    // path: path.resolve(__dirname, buildPath),
    library: "touchFixedDistance"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["env"]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader"
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        use: [
          "file-loader"
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          "file-loader"
        ]
      }
    ]
  }
};
