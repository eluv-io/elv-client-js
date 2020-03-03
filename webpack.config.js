const webpack = require("webpack");
const path = require("path");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

let cmdOpts = {};

for(let i = 0; i < process.argv.length; i++){
  if(process.argv[i].startsWith("--")){
    cmdOpts[process.argv[i].substr(2)] = process.argv[i+1];
    i += 1;
  }
}

let plugins = [
  new webpack.optimize.LimitChunkCountPlugin({
    maxChunks: 1,
  }),
  new webpack.IgnorePlugin(/unorm/),
  new BundleAnalyzerPlugin({
    analyzerMode: "static",
    reportFilename: path.resolve(path.join(__dirname, "test", "bundle-analysis", "index.html")),
    openAnalyzer: false
  })
];

// Exclude node-fetch for web build
if(cmdOpts["target"] !== "node") {
  plugins.push(new webpack.IgnorePlugin(/node-fetch-polyfill/));
}

module.exports = {
  entry: "./dist/src/ElvClient.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "ElvClient-min-dev.js",
    libraryTarget: "umd"
  },
  node: {
    fs: "empty"
  },
  resolve: {
    alias: {
      // Force webpack to use *one* copy of bn.js instead of 8
      "bn.js": path.resolve(path.join(__dirname, "node_modules", "bn.js"))
    }
  },
  mode: "development",
  devtool: cmdOpts["mode"] === "production" ? "" : "source-map",
  plugins: plugins,
  module: {
    noParse: [
      /sjcl\.js$/
    ],
    rules: [
      {
        test: /\.(txt|bin|abi)$/i,
        loader: "raw-loader"
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"],
        }
      },
    ]
  },
};
