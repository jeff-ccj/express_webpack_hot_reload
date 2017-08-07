/*
 * @class   入口文件
 * @author  Jeff Tsui
 * @date    2017.8.2
 */

var express = require('express'),
  path = require('path'),
  http = require('http'),
  reload = require('reload'),
  config = require('./config'), //配置文件
  routers = require('./routers/index'), //路由
  port = config.port, //启动项目端口
  app = module.exports = express(),
  isDev = process.env.NODE_ENV !== 'production'; //是否开发模式

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


  routers(app, isDev, {
    compiler: compiler,
    dirname: __dirname
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
      port: 8098
    });
    console.log('App (dev) is going to be running on port 8098 (by browsersync).');
  });

} else {

  app.set('views', path.join(__dirname, 'views'));
  app.use(express.static(path.join(__dirname, 'views/asset')));

  routers(app, isDev);

  app.listen(port, function () {
    console.log('running ok!!!')
  });

}