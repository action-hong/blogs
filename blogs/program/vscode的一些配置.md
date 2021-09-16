---
title: vscode的一些配置
date: 2021-09-16
categories:
 - program
tags:
  - vscode
publish: false
---

本文介绍一些我常用到的`vscode`配置，持续更新

## typescript

### 去掉自动引入双引号以及分号

平时写代码会用到`eslint`，配置都会用上以下两条

```json
{
  "semi": ["error", "never"],
  "quotes": ["error", "single", { "avoidEscape": true, "allowTemplateLiterals": false }]
}
```

而`vscode`的自动引入的模块路径会使用双引号且有分号，如下：

```ts
import {  } from "utils"; 
```

虽然`eslint`可以自动修复，但看着还是很不爽，使用下面的配置可以直接得到想要的结果

```json
{
  "typescript.preferences.quoteStyle": "single",
  "typescript.format.semicolons": "remove",
  // 如果是javascript的话
  "javascript.preferences.quoteStyle": "single"
}
```