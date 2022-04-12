---
title: 处理引入第三方库时global为undefined
date: 2022-03-22
categories:
 - 问题
tags:
 - vite
---

## 背景

今天使用`vite`写一个demo，引入了`txml`这个库，结果运行的时候报了如下错误:

```log
Uncaught ReferenceError: global is not defined
    at node_modules/.pnpm/registry.npmmirror.com+readable-stream@3.6.0/node_modules/readable-stream/lib/_stream_readable.js (txml.js:1796:25)
    at __require (chunk-BNF35FCG.js:29:50)
    at node_modules/.pnpm/registry.npmmirror.com+readable-stream@3.6.0/node_modules/readable-stream/readable-browser.js (txml.js:2794:32)
    at __require (chunk-BNF35FCG.js:29:50)
    at node_modules/.pnpm/registry.npmmirror.com+through2@3.0.2/node_modules/through2/through2.js (txml.js:2809:21)
    at __require (chunk-BNF35FCG.js:29:50)
    at txml.js:3212:31
```

由于浏览器上是没有`global`这个变量的, 而`readable-stream`这个类库又使用到了:

```js
...
var OurUint8Array = global.Uint8Array || function () {};
```

看到有不少[`pr`](https://github.com/nodejs/readable-stream/pull/464/files)来修复该问题, 但官方还未并入

## 解决

解决也很简单, 只需要polyfill一个`global`全局变量即可(这个其实还是第三方库的问题, 提供给浏览器的依赖就不应该有使用到`global`)

```ts
// vite.config.ts
export default defineConfig({
  ...
  define: {
    global: {}
  }
})
```

如果你使用`vitest`作为测试框架, 则这里需要区分下测试环境: 

```js
export default defineConfig(({ mode }) => ({
  ...
  define: mode === 'test'
    ? {}
    : {
      global: {}
    }
}))
```

## 参考

- https://github.com/vitejs/vite/issues/2778
- https://dev.to/richardbray/how-to-fix-the-referenceerror-global-is-not-defined-error-in-sveltekitvite-2i49