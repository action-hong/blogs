---
title: Blockly的一些技巧
date: 2021-09-02
categories:
 - program
tags:
 - 前端
 - Blockly
 - 可视化编程
---

## 背景

笔者前几年基于[`Blockly`](https://developers.google.com/blockly)开发了几款app，对该库有了一些了解，本文将介绍一些关于使用`Blockly`的一些技巧和心得


## 代码片段

首先，我们需要初始化`Blockly`，并获取到`workspace`

```js
const workspace = Blockly.inject({
  ...
})

```

### 判断编程界面是否为空

有时候，我们在运行前需要做这个判断，然后弹窗提示

```js
/** @params {Blockly.Workspace} workspace */
function isEmpty (workspace) {
  return workspace.topBlocks_.length === 0
}
```

### 判断编程以某个模块为开头

有时候，我们需要强制用户以某个模块为开头(类似`scratch`，总是以绿旗模块为开头)，且只能有一组由该模块构成的程序

```js
/** @params {Blockly.Workspace} workspace */
function isValidStart (workspace, startType) {
  const topBlocks_ = workspace.topBlocks_
  return topBlocks_.length === 1
    && topBlocks_[0].type === startType // 对应的你的开始模块type
}
```

### 导入、导出当前的编程内容

用户可以创建多个编程内容并存储，这时候就需要我们将编好的内容存储起来，同时在必要时恢复

```js

// 返回值即可保存起来
function getText(workspace) {
  // https://github.com/google/blockly/blob/f94b1db85018b5a7261fa01f7d04cd5c8367fe2c/core/xml.js#L42
  const xml = Blockly.Xml.workspaceToDom(workspace, false)
  return Blockly.Xml.domToText(xml)
}

// text参数为getText方法的返回值
// 恢复之前的编程内容
function restore(workspace, text) {
  const xml = Blockly.Xml.textToDom(text)
  Blockly.Xml.domToWorkspace(xml, workspace)
}

```

### 生成对应的代码

这部分[官方的文档](https://developers.google.com/blockly/guides/configure/web/code-generators)讲得很明白了

```js
const code = Blockly.JavaScript.workspaceToCode(workspace);
```