/*
 * @class   路由入口
 * @author  Jeff Tsui
 * @date    2017.8.2
 */

var path = require('path'),
  testRouters = require('./test');

//导入模块路由
var arrRouters = [].concat(
  testRouters
  //多个..
);

module.exports = function (app, isDev, options) {
  var templateStr,
    routerItemDefault = {
      url: '/', //路由
      method: 'get', //请求方式
      title: '', //title
      template: '', //模板
      isApi: false, //是否api
      success: function () { //回调函数
      }
    };
  //遍历所有路由
  for (var i = 0, len = arrRouters.length; i < len; i++) {
    //当前路由配置
    var routerItem = Object.assign({}, routerItemDefault, arrRouters[i]);
    //模板处理
    if(routerItem.template) routerItem.template = routerItem.template.replace('/', '_');

    (function (routerItem) {

      //加入路由
      app[routerItem.method](routerItem.url, function (req, res) {

        var routerData = Object.assign({}, routerItem);

        if (routerData.isApi) {

          if(routerData.success && typeof routerData.success === 'function'){
            routerData.success();
          }
          res.json(req.params);

        } else {

          if (isDev) { //是否开发模式

            //如果开发模式，则从内存找到对应模板内容
            options.compiler.outputFileSystem.readFile(path.join(options.dirname, './views/' + routerData.template + '.html'),
              function (err, strHtml) {
                //过滤掉公共部分，因为在模版已经引入
                strHtml = strHtml.toString().replace(/\<%\s*include(.+?)%\>/g, '');
                //当作字符串变量打入html内容进模版
                res.render('frame/index', {
                  html: strHtml,
                  title: routerData.title
                })
              });

          } else {

            //非开发版本,直接增加路由
            app[routerItem.method](routerData.url, function (req, res) {
              res.render(templateStr, {
                title: routerData.title
              })
            });

          }

        }

      });

    })(routerItem)

  }
};