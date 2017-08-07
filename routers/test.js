/*
 * @class   路由模块
 * @author  Jeff Tsui
 * @date    2017.8.2
 */

module.exports = [
  {
    url: '/',
    title: '首页',
    template: 'page1/index',
  },
  {
    url: '/test',
    method: 'post', //默认get
    isApi: true,
    success: function(data, next) {

    }
  },
  {
    url: '/dd',
    title: 'dddd',
    template: 'page1/add',
  }
]