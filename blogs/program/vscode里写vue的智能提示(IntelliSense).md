---
title: vscode里写vue的智能感知(IntelliSense)
date: 2021-08-20
categories:
 - program
tags:
  - vscode
  - vue
---

## 背景

有时候我们写点`demo`时，并不需要使用类似`vue-cli`的脚手架来开发，而是直接使用`cdn`引用直接写了。但是这时候就会碰到没有代码提示尴尬，幸好`vscode`有提供[解决方案](https://code.visualstudio.com/docs/nodejs/working-with-javascript#_intellisense)

按照文档提供的方法，我们再根目录新建一个`jsconfig.json`，内容为如下：

```json
{
  "typeAcquisition": {
    "include": [
      "vue"
    ]
  }
}
```

然后设置后，并没有得到想要的效果，`Vue`没有任何的提示

## 解决

搜索一番，vscode所有类型的包版本都会存放在`C:\Users\<username>\AppData\Local\Microsoft\TypeScript\4.3\node_modules\types-registry\index.json`

```json
...
"vue-chartkick":{"latest":"0.5.1","ts2.3":"0.5.0","ts2.4":"0.5.0","ts2.5":"0.5.0","ts2.6":"0.5.0","ts2.7":"0.5.0","ts2.8":"0.5.0","ts2.9":"0.5.0","ts3.0":"0.5.0","ts3.1":"0.5.0"},"vue-clickaway":{"latest":"2.2.0"},"vue-color":{"latest":"2.4.3","ts2.0":"2.4.0","ts2.1":"2.4.0","ts2.2":"2.4.0","ts2.3":"2.4.0","ts2.4":"2.4.2","ts2.5":"2.4.2","ts2.6":"2.4.2","ts2.7":"2.4.2","ts2.8":"2.4.2","ts2.9":"2.4.2","ts3.0":"2.4.2","ts3.1":"2.4.2"},"vue-cropperjs":{"latest":"4.1.2","ts3.0":"4.1.0","ts3.1":"4.1.0","ts3.2":"4.1.1","ts3.3":"4.1.1","ts3.4":"4.1.1","ts3.5":"4.1.1"}
...
```

里面有很多依赖`vue`的插件，但唯独没有`vue`，这就很奇怪了

尝试添加`vue-ls`这个插件到`jsconfig`下

```json
{
  "typeAcquisition": {
    "include": [
      "vue-ls"
    ]
  }
}
```

会自动下载`@types/vue-ls`到缓存，同时也会把其依赖`vue`也下载了，这时候发现`vue`可以正常智能提示了。

为什么会添加`vue`呢？有些奇怪。

## 参考

1. [Why does VS Code fail type acquisition for Vue?](https://stackoverflow.com/questions/62254784/why-does-vs-code-fail-type-acquisition-for-vue)