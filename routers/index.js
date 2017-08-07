var   path = require('path'),
  testRouters = require('./test');

//导入模块路由
var arrRouters = [].concat(
  testRouters
  //多个..
);

module.exports = function (app, isDev, options) {
  var routerItem, templateStr;
  //遍历所有路由
  for(var i = 0, len = arrRouters.length; i < len; i++){
    routerItem = arrRouters[i];
    templateStr = routerItem.template.replace('/', '_');
    if(isDev){ //是否开发模式
      app.get(routerItem.url, function (req, res) {
        //如果开发模式，则从内存找到对应模板内容
        options.compiler.outputFileSystem.readFile(path.join(options.dirname, './views/' + templateStr + '.html'),
          function(err, strHtml) {
            //过滤掉公共部分，因为在模版已经引入
            strHtml = strHtml.toString().replace(/\<%\s*include(.+?)%\>/g, '');
            //当作字符串变量打入html内容进模版
            res.render('frame/index', {
              html: strHtml,
              title: routerItem.title
            })
          });
      });
    }else {
      //非开发版本,直接增加路由
      app.get(routerItem.url, function (req, res) {
        res.render(templateStr, {
          title: routerItem.title
        })
      });
    }
  }
};