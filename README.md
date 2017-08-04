
# express-webpack-live-reload-example

> express + webpack to hot reload

## Start

1. Clone this repo.

2. Install dependencies.

        npm install
        npm install supervisor -g

3. Try these out.

    * `npm start` to develop with full live reload.
    * `npm run browsersync` is a alternative for development. It may be faster when modifying the express views.
    * `npm run prod` to emit outputs and run the express for production.
    * `npm run build` if you care about what is hold in memory for development...



------------

# webpack + express 前后端热更新集合

> express + webpack to hot reload

## 开始

1. 下载这个项目.

2. 安装依赖.

	```
	//安装所有依赖
	npm install
	//为监控node文件变化安装全局
	npm install supervisor -g
	```

3. 启动命令

> 对应的具体执行命令可到 `package.json` 内看到

* `npm start` 开发模式，前端文件会构建至内存而不是实体文件
* `npm run browsersync` 快速修改视图，也就是前端部分
* `npm run prod` 生产版本.
* `npm run build` 单独构建前端文件部分


