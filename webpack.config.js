/*
 * @class   webpack配置文件
 * @author  Jeff Tsui
 * @date    2017.8.2
 */

var path = require('path'),
  config = require('./config'),
  fs = require('fs'),
  glob = require('glob'),
  webpack = require('webpack'),
  ExtractTextPlugin = require('extract-text-webpack-plugin'), //将样式提取到单独的css文件里
  HtmlWebpackPlugin = require('html-webpack-plugin'), //webpack中生成HTML的插件
  FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin'),
  CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin,
  UglifyJsPlugin = webpack.optimize.UglifyJsPlugin, //压缩
  hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&reload=true',
  isDebug = process.env.NODE_ENV !== 'production'; //用于判断开发模式

var getEntry = function (globPath) {
  var files = glob.sync(globPath);
  var entries = {},
    templates = {},
    entry, jsEntry, dirname, basename, pathname, extname, arrPath, arrPathLen;

  for (var i = 0; i < files.length; i++) {
    entry = files[i];
    dirname = path.dirname(entry);
    extname = path.extname(entry);
    basename = path.basename(entry, extname);
    pathname = path.join(dirname, basename);
    arrPath = entry.split('/');
    arrPathLen = arrPath.length;
    arrPath[arrPathLen - 1] = arrPath[arrPathLen - 1].replace('.html', '');
    if (arrPathLen > 0) {
      pathname = [arrPath[arrPathLen - 2], arrPath[arrPathLen - 1]].join('_');
      arrPath[arrPathLen - 1] += '.js';
      arrPath.splice(arrPathLen - 1, 0, 'js');
      jsEntry = arrPath.join('/')
    }
    // templates[pathname] = [path.join(__dirname, entry)];
    templates[pathname] = ['./' + entry];
    if (fs.existsSync(path.join(__dirname, jsEntry))) {
      entries[pathname] = ['./' + jsEntry, hotMiddlewareScript];
    }
  }
  console.log({
    html: templates,
    entries: entries,
  })
  return {
    html: templates,
    entries: entries,
  };
};

//需要创建的html
var allEntry = getEntry('client/pages/**/*.html'),
  pagesArr = allEntry.html,
  entryArr = allEntry.entries;

var webpackConfig = {
  debug: isDebug,
  entry: entryArr,
  output: {
    path: path.join(__dirname, './views/asset/'), //输出目录的配置，模板、样式、脚本、图片等资源的路径配置都相对于它
    publicPath: config.publicPath,               //模板、样式、脚本、图片等资源对应的server上的路径
    filename: 'js/[name].js',           //每个页面对应的主js的生成配置
    chunkFilename: 'js/[id].chunk.js'   //chunk生成的配置
  },
  module: {
    loaders: [ //加载器，关于各个加载器的参数配置，可自行搜索之。
      {
        test: /\.css$/,
        //配置css的抽取器、加载器。'-loader'可以省去
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
      }, {
        test: /\.less$/,
        //配置less的抽取器、加载器。中间!有必要解释一下，
        //根据从右到左的顺序依次调用less、css加载器，前一个的输出是后一个的输入
        //你也可以开发自己的loader哟。有关loader的写法可自行谷歌之。
        loader: ExtractTextPlugin.extract('css!less')
      }, {
        test: /\.scss$/,
        //配置scss的抽取器、加载器。中间!有必要解释一下，
        //根据从右到左的顺序依次调用scss、css加载器，前一个的输出是后一个的输入
        //你也可以开发自己的loader哟。有关loader的写法可自行谷歌之。
        loader: ExtractTextPlugin.extract('css!scss')
      }, {
        //html模板加载器，可以处理引用的静态资源，默认配置参数attrs=img:src，处理图片的src引用的资源
        //比如你配置，attrs=img:src img:data-src就可以一并处理data-src引用的资源了，就像下面这样
        test: /\.html$/,
        loader: "html?attrs=img:src img:data-src"
      }, {
        //文件加载器，处理文件静态资源
        test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader?name=./fonts/[name].[ext]'
      }, {
        //图片加载器，雷同file-loader，更适合图片，可以将较小的图片转成base64，减少http请求
        //如下配置，将小于8192byte的图片转成base64码
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader?limit=8192&name=./img/[hash].[ext]'
      }
    ]
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new FriendlyErrorsPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    }),
    new webpack.ProvidePlugin({ //加载jq
      $: 'jquery'
    }),
    new CommonsChunkPlugin({
      name: 'commons', // 将公共模块提取，生成名为`commons`的chunk
      chunks: ['index', 'page1'], //提取哪些模块共有的部分
      minChunks: 2 // 提取至少2个模块共有的部分
    }),
    new ExtractTextPlugin('css/[name].css'), //单独使用link标签加载css并设置路径，相对于output配置中的publickPath
    isDebug ? function () {
    } : new UglifyJsPlugin({ //压缩代码
      compress: {
        warnings: false
      },
      except: ['$super', '$', 'exports', 'require'] //排除关键字
    }),
  ],
  // devtool:'#source-map',
  devServer: {
    contentBase: "./dist",
    hot: true,
    inline: true,
    host: "localhost",
    port: 9876
  }
};

for (var pageName in pagesArr) {
  var conf = {
    filename: '../../views/' + pageName + '.html', //生成的html存放路径，相对于path
    template: pagesArr[pageName][0], //html模板路径
    inject: true,  //js插入的位置，true/'head'/'body'/false
    chunks: [pageName],
    hash: true, //为静态资源生成hash值
    /*
     * 压缩这块，调用了html-minify，会导致压缩时候的很多html语法检查问题，
     * 如在html标签属性上使用{{...}}表达式，所以很多情况下并不需要在此配置压缩项，
     * 另外，UglifyJsPlugin会在压缩代码的时候连同html一起压缩。
     * 为避免压缩html，需要在html-loader上配置'html?-minimize'，见loaders中html-loader的配置。
     */
    // minify: { //压缩HTML文件
    //  removeComments: true, //移除HTML中的注释
    //  collapseWhitespace: false //删除空白符与换行符
    // }
  };
  //HtmlWebpackPlugin，模板生成相关的配置，每个对于一个页面的配置，有几个写几个
  webpackConfig.plugins.push(new HtmlWebpackPlugin(conf));
}

module.exports = webpackConfig;