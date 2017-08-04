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

  var compiler = webpack(webpackDevConfig);

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

  app.use(staticPath, express.static('views/asset'))

  app.get('/', function (req, res, next) {
    var strHtml = compiler.outputFileSystem.readFileSync(path.join(__dirname, './views/page1_index.html')) + '';
/*    compiler.outputFileSystem.readFile(path.join(__dirname, './views/page1_index.html'), function(err, result) {
      if (err) {
        // something error
        return next(err);
      }
      res.set('content-type', 'text/html');
      res.send(result);
      res.end();
    })*/
    res.render('frame/index', {
      html: strHtml,
      title: 'title'
    });
  });

  app.get('/page2', function (req, res) {
    res.render('page2_index', {
      title: "page2",
      page: "page2"
    });
  });

  var server = http.createServer(app);

  reload(app);

  server.listen(port, function () {
    // console.log('App (dev) is now running on port 3000!');
  });

} else {

  // app.set('views', path.join(__dirname, 'views'));
  // app.use(express.static(path.join(__dirname, 'views/asset')));

  // static assets served by express.static() for production
 /* app.use(express.static(path.join(__dirname, 'public')));
  require('./server/routes')(app);*/
/*  app.listen(port, function () {
    console.log('App (production) is now running on port 3000!');
  });*/

}

/*
 var server = app.listen(3000, function () {
 var host = server.address().address;
 var port = server.address().port;

 console.log('Example app listening at http://%s:%s', host, port);
 });*/
