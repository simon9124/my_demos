
var express = require('express');
var path = require('path');
var opn = require('opn');
var Webpack = require('webpack');
var merge = require('webpack-merge');
var history = require('connect-history-api-fallback');
var webpackMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');

var config = require('./webpack.base');
config = merge(config, {
  plugins: [
    new Webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    historyApiFallback: {
      disableDotRule: true
    }
  }
})

var port = 7878;

var app = express();

var compiler = Webpack(config);
var middleware = webpackMiddleware(compiler, {
  publicPath: config.output.publicPath,
  hot: true,
  stats: {
    colors: true,
    hash: false,
    timings: true,
    chunks: false,
    chunkModules: false,
    modules: false
  }
});

app.use(middleware);

app.use(webpackHotMiddleware(compiler, {
  heartbeat: 2000
}));
app.use(express.static(path.join(__dirname, '../dist/')));
app.use(history());

app.listen(port, function onStart(err) {
  var uri = 'http://127.0.0.1:' + port;
  if (err) {
    console.log(err);
  } else {
    console.log(uri);
  }
  opn(uri);
});