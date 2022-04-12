---
title: 写一个unocss的vite插件
date: 2022-04-12
description: unocss的一个vite插件，使可以直接在开发者模式下添加unocss的相关class看到效果
categories:
 - program
tags:
 - vite
 - unocss
---

## 背景

前几天逛`unocss`的`issue`， 发现个有意思的[提案](https://github.com/unocss/unocss/issues/796)。

由于`unocss`是按需生成对应的规则样式的，因此如果你想用浏览器上的开发者模式给元素添加上符合规则的`class`时，是无法生效的。但我有时可能我就是想这么干，不然来回切换编辑器和浏览器查看效果就是很烦。

## 实现

原理上很简单，我们只需通过[`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)来监听所有元素的`class`变化，然后将新增的`class`传给服务。这里我们可以引入一个虚拟文件将监听脚本返回给客户端:

```ts
{
  load(id) {
    if (id === DEVTOOLS_PATH) {
      // 生产环境下, 返回空
      return config.command === 'build'
            ? '' : `

function post(data: any) {
  return fetch('__POST_PATH__', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

function schedule() {
  ...
  post({ type: 'add-classes', data: Array.from(pendingClasses) })
}

const mutationObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'class' && mutation.target) {
      Array.from((mutation.target as Element).classList || [])
        .forEach((i) => {
          if (!visitedClasses.has(i))
            pendingClasses.add(i)
        })
      schedule()
    }
  })
})

`
    }
  }
}

```

由于需要将增加的`class`发送给服务端，故还需要创建一个接口用来接收新增的`class`:

```ts
{
  ...
  configureServer(server) {
    server.middlewares.use(async(req, res, next) => {
      // POST_PATH 为新增类的url路径
      if (req.url !== POST_PATH)
        return next()

      try {
        const data = await getBodyJson(req)
        const type = data?.type
        let changed = false
        switch (type) {
          case 'add-classes':
            (data.data as string[]).forEach((key) => {
              if (!devtoolCss.has(key)) {
                devtoolCss.add(key)
                changed = true
              }
            })
            if (changed)
            // 更新类
              updateDevtoolClass()
        }
        res.statusCode = 200
      }
      catch (e) {
        console.error(e)
        res.statusCode = 500
      }

      res.end()
    })
  }
}
```

这里服务端接收到新增的`class`后, 存到一个`Set`中，如果有之前没有的，就重新更新`css`文件

通过`DevTool`增加的`class`对应的css代码也是一个虚拟文件, 可以在前面提到的`DEVTOOLS_PATH`返回的代码中引入这个虚拟文件:

```diff
...
const mutationObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'class' && mutation.target) {
      Array.from((mutation.target as Element).classList || [])
        .forEach((i) => {
          if (!visitedClasses.has(i))
            pendingClasses.add(i)
        })
      schedule()
    }
  })
})
+ import('${DEVTOOLS_CSS_PATH}')
```

该模块用于返回所有监听到新增的类对应的css规则生成:

```ts
{
  load (id) {
    if (id === DEVTOOLS_CSS_PATH) {
      // 根据所有devtools新增的类, 生成对应的css返回
      const { css } = await uno.generate(devtoolCss)
      return css
    }
  }
}
```

接下来就很简单了，只要收到客户端有更新新的`class`的时候，通知该模块更新即可:

```ts
function updateDevtoolClass() {
  const mod = server.moduleGraph.getModuleById(DEVTOOLS_CSS_PATH)
  if (!mod)
    return
  server.moduleGraph.invalidateModule(mod)
  server.ws.send({
    type: 'update',
    updates: [{
      acceptedPath: DEVTOOLS_CSS_PATH,
      path: DEVTOOLS_CSS_PATH,
      timestamp: lastUpdate,
      type: 'js-update',
    }],
  })
}
```

以上就是在插件的大致实现思路，详细的代码参见该[PR](https://github.com/unocss/unocss/pull/812)

## 缺陷

由于`MutationObserver`监听是并不知道类的通过`DevTools`添加的还是通过脚本添加的，因此如果你使用类似如下的代码:

```ts

let value = getValue() // 假设为2
const el = document.querySelector('#app')
el.classList.push(`p-${value}`)

```

那么此时`p-2`这个规则会有效果，但是再生产环境下是没有这个规则的(编译阶段没有扫描到这个规则`p-2`), 因此可能会出现开发环境和生产环境不一致的情况。

所有应当尽量避免这种以拼接的形式组成`class`或者使用[`safelist`](https://github.com/unocss/unocss/issues/511)

## 参考

- [design-in-devtools](https://windicss.org/integrations/vite.html#design-in-devtools)
- [MutationObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)
- [实现的PR](https://github.com/unocss/unocss/pull/812)