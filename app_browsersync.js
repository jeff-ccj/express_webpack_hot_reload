var express = require('express');
var path = require('path');
var reload = require('reload');
var http = require('http');
var app = module.exports = express();
var port = 3000;
var isDev = process.env.NODE_ENV !== 'production';

app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

app.locals.env = process.env.NODE_ENV || 'dev';
app.locals.reload = false;

if (isDev) {
  var webpack = require('webpack'),
    webpackDevMiddleware = require('webpack-dev-middleware'),
    webpackHotMiddleware = require('webpack-hot-middleware'),
    webpackDevConfig = require('./webpack.config.js');

  var compiler = webpack(webpackDevConfig);

  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackDevConfig.output.publicPath,
    noInfo: true,
    stats: {
      colors: true
    }
  }));
  app.use(webpackHotMiddleware(compiler));

  app.get('/', function (req, res) {
    res.render('page1_index', {
      title: "page1",
      page: "page1"
    });
  });
  app.get('/page2', function (req, res) {
    res.render('page2_index', {
      title: "page2",
      page: "page2"
    });
  });

  // browsersync is a nice choice when modifying only views (with their css & js)
  var bs = require('browser-sync').create();
  app.listen(port, function(){
    bs.init({
      open: false,
      ui: false,
      notify: false,
      proxy: 'localhost:3000',
      files: ['./views/**'],
      port: 8080
    });
    console.log('App (dev) is going to be running on port 8080 (by browsersync).');
  });

} else {
  app.use(express.static(path.join(__dirname, 'views/asset')));

  app.get('/', function (req, res) {
    res.render('page1_index', {
      title: "page1",
      page: "page1"
    });
  });
  app.get('/page2', function (req, res) {
    res.render('page2_index', {
      title: "page2",
      page: "page2"
    });
  });

  app.listen(port, function () {
    console.log('App (production) is now running on port 3000!');
  });
}