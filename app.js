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
app.locals.reload = true;

if (isDev) {

  var webpack = require('webpack'),
    webpackDevMiddleware = require('webpack-dev-middleware'),
    webpackHotMiddleware = require('webpack-hot-middleware'),
    webpackDevConfig = require('./webpack.config.js');
  //webpack对象
  var compiler = webpack(webpackDevConfig);
  //webpack对象
  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackDevConfig.output.publicPath,
    noInfo: true,
    reload: true,
    stats: {
      colors: true,
      chunks: false
    }
  }));

  app.use(webpackHotMiddleware(compiler, {
    log: console.log,
    path: webpackDevConfig.output.publicPath
  }));

  var staticPath = path.posix.join(webpackDevConfig.output.publicPath, webpackDevConfig.output.path)

  app.use(staticPath, express.static('views/asset'));

  routers(app, isDev, {
    compiler: compiler,
    dirname: __dirname
  });

  var server = http.createServer(app);

  reload(app);

  server.listen(port, function () {
    // console.log('App (dev) is now running on port 3000!');
  });

} else {

  app.set('views', path.join(__dirname, 'views'));
  app.use(express.static(path.join(__dirname, 'views/asset')));

  routers(app, isDev);

  app.listen(port, function () {
    console.log('running ok!!!')
  });

}
