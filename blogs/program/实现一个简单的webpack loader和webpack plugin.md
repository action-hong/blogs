---
title: 实现一个简单的webpack loader和webpack plugin
date: 2021-10-08
categories:
 - program
tags:
 - webpack
---

## loaders

在使用`webpack`的日常开发中，我们会使用到各种`loader`，如[`babel-loader`](https://github.com/babel/babel-loader)，可以让我们使用`babel`对js文件进行转化，如[`sass-loader`](https://github.com/webpack-contrib/sass-loader)，可以将`sass`文件转化为`css`文件，等等

简单来说，[`loader`](https://webpack.js.org/concepts/#loaders)就是个转化器，`webpack`用来它来讲对源代码进行转化。

> Out of the box, webpack only understands JavaScript and JSON files. Loaders allow webpack to process other types of files and convert them into valid modules that can be consumed by your application and added to the dependency graph.

下面我们实现一个简单的`loader`，将`css`文件中所有的`red`字符串替换成`green`

### loader的实现

loader其实就是提供一个函数，参数为要处理文件的源代码，返回值即为处理之后的内容。

我们新建一个文件`test-loader.js`，内容如下:

```js
module.exports = function (source) {
  return source.replaceAll('red', 'green');
};
```

这里我们就是把原来`css`代码中的`red`全部替换成`green`，然后我们修改`webpack`配置，`css`文件以此被`test-loader`，`css-loader`，`style-loader`处理

```js
const path = require('path');

module.exports = {
  ...
  module: {
    rules: [
      {
        test: /.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: path.resolve('/path/to/test-loader.js')
          }
        ]
      }
    ]
  }
};

```

写完之后，我们写一个测试`css`文件：

```css
div {
  color: red;
}
```

运行`webpack`后，查看打包文件，看看打包后的`css`代码：

```css
div {
  color: green;
}
```

可以看到替换成功了。

### loader options

上面写的`loader`功能太单调了，如果我们想替换成其他颜色，总不能去修改`test-loader`吧？这时候就可以使用`options`告诉`loader`我们想要的内容。

首先需要安装`loader-utils`这个依赖来帮助我们获取配置传来的`options`

```bash
npm i loader-utils --save-dev
```

然后我们修改`test-loader`

```diff
+ const loaderUtils = require('loader-utils')

+ const defaultOptions = {
+  color: 'green'
+ }

module.exports = function (source) {
+  const options = {
+    ...defaultOptions,
+    ...loaderUtils.getOptions(this)
+  }
-  return source.replaceAll('red', 'green');
+  return source.replaceAll('red', options.color);
};
```

然后我们修改`webpack`配置，传入我们想要替换后的颜色

```diff
const path = require('path');

module.exports = {
  ...
  module: {
    rules: [
      {
        test: /.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
-            loader: path.resolve('/path/to/test-loader.js')
+            loader: path.resolve('/path/to/test-loader.js'),
+            options: {
+              color: 'blue'
+            }
          }
        ]
      }
    ]
  }
};
```

接着我们重新运行下`webpack`命令，查看输出的样式文件：

```css
div {
  color: blue;
}
```

这样所有的`div`的颜色都是`blue`了

### 异步loaders

有些时候我们处理文件的过程是异步的，这时候就要用到其提供的一个方法`this.async`

我们新建一个异步loader

```js
module.exports = function (source) {
  const callback = this.async()
  // 使用setTimeout模拟异步处理
  setTimeout(_ => {
    callback(null, `
    ${source}
    div {
      border: 1px solid; 
    }
  `)
  }, 1000)
};
```

这里调用`this.async()`会返回一个`callback`，该callback是个函数，[可接受四个参数](https://webpack.js.org/api/loaders/#thiscallback)：

```js
this.callback(
  err: Error | null,
  content: string | Buffer,
  sourceMap?: SourceMap,
  meta?: any
);
```

1. 第一个参数必须是`Error`或`null`
2. 第二个参数必须是`string`或`buffer`
3. 可选：第三个参数必须是解析该模块的`source map`
4. 可选：第四个参数会被`webpack`忽略，可以传任意你想传的值。

编写完`loader`后，我们再次修改`webpack`的配置文件:

```diff
const path = require('path');

module.exports = {
  ...
  module: {
    rules: [
      {
        test: /.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: path.resolve('/path/to/test-loader.js'),
            options: {
              color: 'blue'
            }
-          }
+          },
+         'async-loader'
        ]
      }
    ]
  }
};
```

接着我们重新运行下`webpack`命令，查看输出的样式文件：

```css
div {
  color: blue;
}

div {
  border: 1px solid;
}
```

可以看到刚刚异步`loader`也顺利执行了。

[在这里试试](https://stackblitz.com/edit/github-vapjcm?embed=1&file=README.md)

## plugin

相比较于`loader`只能对源代码进行处理，插件能做的事情的多了。

webpack在编译过程中会触发[很多事件](https://webpack.js.org/api/compiler-hooks/#hooks)，插件可以通过监听这些事件，然后使用相关api对输出资源进行处理。

首先看下官网文档的定义，插件需要包含如下部分：

1. 一个类或者命名函数
2. 有个`apply`方法
3. 指定一个[事件](https://webpack.js.org/api/compiler-hooks/)来绑定
4. 处理`webpack`内部实例的数据
5. 完成想要的功能后调用`webpack`提供的回调函数。

另外在写插件之前，我们需要先对`compiler`和`compilation`这两个重要的对象有所了解

下面我们写一个简易版本的[`HtmlWebpackPlugin`](https://webpack.js.org/plugins/html-webpack-plugin/)

```javascript
class HtmlWebpackPlugin {
  apply(compiler) {
    const pluginName = HtmlWebpackPlugin.name
    // webpack module instance can be accessed from the compiler object,
    // this ensures that correct version of the module is used
    // (do not require/import the webpack or any symbols from it directly).
    const { webpack } = compiler;

    // Compilation object gives us reference to some useful constants.
    const { Compilation } = webpack;

    // RawSource is one of the "sources" classes that should be used
    // to represent asset sources in compilation.
    const { RawSource } = webpack.sources;
    compiler.hooks.thisCompilation.tap(
      pluginName,
      (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: pluginName,
  
            // Using one of the later asset processing stages to ensure
            // that all assets were already added to the compilation by other plugins.
            stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
          },
          (assets) => {
            // 获取编译生成的js文件
            const filename = compiler.options.output.filename
    
            const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  </head>
  <body>
  
  </body>
  <script src="${filename}"></script>
</html>`

            compilation.emitAsset(
              'index.html',
              new RawSource(html)
            )
          }
        )
      }
    )
  }
}

module.exports = HtmlWebpackPlugin
```