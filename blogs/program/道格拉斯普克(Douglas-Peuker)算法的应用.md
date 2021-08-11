---
title: 道格拉斯普克(Douglas-Peuker)算法的应用
date: 2021-08-11
categories:
 - program
 - 计算几何
 - 前端
---

## 背景

有一款app通过蓝牙连接，可控制玩家小车实现前进、后退、左转、右转等功能，现在想实现一个需求：在一个空白页面，通过手绘绘制一条轨迹，然后让小车按照绘制出来的轨迹移动。

## 分析

这需求看着似乎不怎么难，只需监听出触摸事件，将每个点的存起来，比连在一起绘制轨迹。然后根据每个点之间的距离，角度转化成相应的指令发给小车就行了，于是很快有了demo:

<CarPath />

但是很快就发现了问题，随意画条轨迹，产生的点就达到了上百个（读者可以自己在尝试），这个转化成的指令就更多了。而且很多点之间的距离很小，发送的指令会导致小车产生“抖动”的现象。因此我们需要过滤掉中间的一些点，同时让轨迹尽可能拟合原来绘制的轨迹。

## 首次尝试

一开始考虑的是使用[节流](https://www.lodashjs.com/docs/lodash.throttle#throttle)来控制添加点的个数，按照正常速度绘制的话，该方案是可以正常使用的，但是如果绘制速度比较快或比较慢，就必须得改变节流时间才能保证添加的点满足要求，读者可以尝试点击上方组件内的“**显示节流的轨迹**”以及修改对应的**节流时间**，用不同的绘制速度来绘制轨迹，查看节流后的效果。

很容易得出结论：画得快的时候，节流时间需要调小，画得慢的时候节流时间需要调大

当然我们不可能要求用户来手动调整这个时间，因此这个方案是不可行的。

## 道格拉斯普克（Douglas-Peuker）算法

通过分析，实际上我们要的就是找到一条点数较少的相似轨迹，而这个[算法](https://zh.wikipedia.org/wiki/%E9%81%93%E6%A0%BC%E6%8B%89%E6%96%AF-%E6%99%AE%E5%85%8B%E7%AE%97%E6%B3%95)便是用来做这件事的。

### 原理

该算法首先确定一个临界值`epsilon`, 再保留第一点和最后一个点，然后从剩余的点中找到距离里第一点和最后一点连成的线端最远的点，如果这个点到线段的距离小于`epsilon`，则可以舍弃掉除第一点和最后一点的其他点返回，如果大于`epsilon`，则该最远点必须保留，同时以第一点和最远点，最远点和最后一点为参数调用该算法，递归完成后，就可以生成一条新的轨迹。下面是该算法的代码实现

```js
function DouglasPeucker(points, epsilon) {
  let max = 0
  let index = 0
  const last = points.length - 1
  for (let i = 1; i < points.length - 2; i++) {
    // 计算点i和 第一个点与最后一点组成的线段的垂直距离
    const distance = getDistance(points[i], points[0], points[last])
    if (max < distance) {
      max = distance
      index = i
    }
  }

  const result = []

  if (max > epsilon) {
    const r1 = DouglasPeucker(points.slice(0, index + 1), epsilon)
    const r2 = DouglasPeucker(points.slice(index), epsilon)

    // 注意这里r1,r2都保留最远点，所以r1里最后一个点要去掉
    return r1.slice(0, r1.length - 1).concat(r2)
  } else {
    return [points[0], points[last]]
  }
}
```

下面是一张该算法的简单示意图:

![img](https://upload.wikimedia.org/wikipedia/commons/3/30/Douglas-Peucker_animated.gif)

### 分析

有了该算法后，我们只要调整好相应的`epsilon`值，就能得到我们想要的效果了。读者可以尝试点击上方组件内的“Douglas-Peuker算法轨迹”以及调整`epsilon`值查看生成的轨迹以及点数，并于源轨迹进行比较。

设置好合适的`epsilon值`后，无论我们绘制的轨迹如何，速度快还是慢，生成的轨迹都基本和源轨迹相似且点数大幅减少。因此该方案时可行的。

## 后记

之前有看过这么一句话：「你不知道你不知道的东西」，真的很有道理。如果做这个需求的时候，你不知道这个算法，可能你很难找到一个很好的解决方案，而知道这个算法之后实现起来就很快了。因此平时要多拓展自己的知识面，才能才迎接各种奇形怪状的需求下保持从容淡定。


## 参考

1. [道格拉斯-普克算法](https://zh.wikipedia.org/wiki/%E9%81%93%E6%A0%BC%E6%8B%89%E6%96%AF-%E6%99%AE%E5%85%8B%E7%AE%97%E6%B3%95)
2. [Javascript implementation of the Ramer Douglas Peucker Algorithm](https://karthaus.nl/rdp/)
