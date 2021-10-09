---
title: 实现一个简单的webpack loader和webpack plugin
date: 2021-10-08
categories:
 - program
tags:
 - webpack
---

## loaders

在使用`webpack`的日常开发中，我们会使用到各种`loader`，如[`babel-loader`](https://github.com/babel/babel-loader)，可以让我们使用`babel`对js文件进行转化，如[`sass-loader`](https://github.com/webpack-contrib/sass-loader)，可以将`sass`文件或者`scss`文件转化为`css`文件，等等

简单来说，[`loader`](https://webpack.js.org/concepts/#loaders)就是个转化器，`webpack`用来它来讲对源代码进行转化。

> Out of the box, webpack only understands JavaScript and JSON files. Loaders allow webpack to process other types of files and convert them into valid modules that can be consumed by your application and added to the dependency graph.

下面我们实现一个简单的`loader`，给`css`文件添加上一行注释`/* 经过test-loader处理 */`

### loader的实现

loader其实就是提供一个函数，参数为要处理文件的源代码，返回值即为处理之后的内容。

我们新建一个文件`test-loader.js`，内容如下:

```js
module.exports = function (source) {
  return `
    /* 经过test-loader处理 */
    ${source}
  `;
};
```

这里我们就是在原来的`css`代码上添加一行注释，然后我们修改`webpack`配置，`css`文件以此被`test-loader`，`css-loader`，`style-loader`处理

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

运行`webpack`后，查看打包文件，看看打包后的代码：

```js
var e=r(81),u=r.n(e),i=r(645),o=r.n(i)()(u());o.push([n.id,"\n    /* 经过test-loader处理 */\n    div {\r\n  color: red;\r\n}\n  ",""])
```

可以看到注释加上了。

### loader options

上面写的`loader`功能太单调了，如果我们想修改注释的内容，总不能去修改`test-loader`吧？这时候就可以使用`options`告诉`loader`我们想要的内容。

首先需要安装`loader-utils`这个依赖来帮助我们获取配置传来的`options`

```bash
npm i loader-utils --save-dev
```

然后我们修改`test-loader`

```diff
+ const loaderUtils = require('loader-utils')

+ const defaultOptions = {
+  comment: '经过test-loader处理'
+ }

module.exports = function (source) {
  return `
-    /* 经过test-loader处理 */
+    /* ${options.comment} */
    ${source}
  `;
};
```

然后我们修改`webpack`配置，传入我们想要的注释内容

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
+            options: {
+              comment: '学习使我快乐'
+            }
          }
        ]
      }
    ]
  }
};
```

接着我们重新运行下`webpack`命令，查看输出的文件：

```js
var e=r(81),u=r.n(e),i=r(645),o=r.n(i)()(u());o.push([n.id,"\n    /* 学习使我快乐 */\n    div {\r\n  color: red;\r\n}\n  ",""]);
```

可以看到注释内容以及变成我们在配置文件内写的内容了。

读者可以直接使用下面的[在线编辑器](https://stackblitz.com/edit/github-vapjcm?embed=1&file=README.md)自行尝试：


<iframe 
style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
src="https://stackblitz.com/edit/github-vapjcm?embed=1&file=README.md"></iframe>

## plugin

todo