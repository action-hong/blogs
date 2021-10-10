---
title: 将github头像转成手绘图片
date: 2021-09-07
categories:
 - toys
tags:
 - 前端
 - roughjs
 - canvas
---

该工具可以将`github`默认生成的头像转成[手绘风格](https://roughjs.com/)

::: danger
必须是上传github默认生成的头像，上传其他图片将无法得到想要的效果
:::

<Rough-Avatar />

::: tip
参数的说明参见[rough文档](https://github.com/rough-stuff/rough/wiki#options)
:::

## TODO

- 部分图片无法正确转换，如[这张图](https://avatars.githubusercontent.com/u/34114132?v=4)
- 优化算法，现在加载新图片需要1s多