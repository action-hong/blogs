---
title: 解决react-native无法设置transform-origin的问题
date: 2021-09-03
categories:
 - program
tags:
 - 前端
 - react native
 - 矩阵
---

## 前言

最近工作上用`react-native`来写几个小应用，碰到了个问题：以往我们写css经常会用到`transform：rorate(xxdeg)`让元素绕某个点（通过设置`transform-origin`）旋转角度，但是`react-native`无法设置旋转中心，固定只能绕元素中心来进行旋转。

看上去要想绕其他点旋转就很难做到了，其实这问题很简单，只需回忆下以前中心学过的线性代数就能做到了

## 分析

不妨设元素的左上角为原点O，中心A为`(x0, y0)`，元素上任意一点为P`(x, y)`，那么点P绕点A旋转后的坐标计算如下：


![img](/img/公式1.png)

简单说明下，先偏移`(x0, y0)`，此时原点来到之前的中心点A处，然后这时候就是绕原点旋转了，旋转结束后，再重新移动原来距离。

同理由于`react-native`是绕中心点旋转的，那么我们要让元素绕其他点B`(x1, y1)`旋转，只需在一开始先移动坐标轴`(-x1+x0, -y1+y0)`，旋转结束后，再移动`(x1-x0, y1-y0)`即可

例如，我们有一个元素，宽高均为100像素，旋转中心为左上角，要是他绕中心点旋转30°，我们可以先让他向右，向下平移50像素，然后旋转45°，再向左，向上平移50像素，如下示意图：

<div class="transform-demo transform-demo-0"></div>

## 实践

由于css中默认`transform-origin`就是中心点，因此我们之间在浏览器模拟`react-native`

```css
div.transform-demo::after {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: red;
  content: '';
}

div.transform-demo{
  width: 100px;
  height: 100px;
  border: 1px solid black;
  box-sizing: border-box;
  position: relative;
  margin: 30px auto;
}
```

绕中心点旋转45deg


<div class="transform-demo transform-demo-1"></div>

```css{2}
div.transform-demo-1:after {
  transform: rotate(45deg);
}
```

绕右上角逆时针旋转30deg, 根据上面的分析，坐标轴需要先向右移动`50%`, 向上移动`50%`，然后旋转后，再向左移动`50%`, 向下移动`50%`

<div class="transform-demo transform-demo-2"></div>


```css{3,5}
div.transform-demo-2::after {
  transform: 
    translate(50%, -50%)
    rotate(-30deg)
    translate(-50%, 50%);
}
```

绕左下角逆时针旋转45deg

<div class="transform-demo transform-demo-3"></div>

```css{3,5}
div.transform-demo-3::after {
  transform: 
    translate(-50%, 50%)
    rotate(-45deg)
    translate(50%, -50%);
}
```

<style>

  div.transform-demo{
    width: 100px;
    height: 100px;
    border: 1px solid black;
    box-sizing: border-box;
    position: relative;
    margin: 30px auto;
  }

  div.transform-demo::after {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: red;
    content: '';
  }

  div.transform-demo-1:after {
    transform: rotate(45deg);
  }

  div.transform-demo-2::after {
    transform: translate(50%, -50%) 
      rotate(-30deg) 
      translate(-50%, 50%);
  }
  div.transform-demo-3::after {
    transform: translate(-50%, 50%) rotate(-45deg) translate(50%, -50%);
  }

  div.transform-demo-0::after {
    transform-origin: 0 0;
    animation: xixi 10s infinite linear forwards;
  }

  @keyframes xixi {
    30% {
      transform: translate(50%, 50%);
    }

    60% {
      transform: translate(50%, 50%) rotate(45deg);
    }

    90%, 100% {
      transform: translate(50%, 50%) rotate(45deg) translate(-50%, -50%);
    }
  }
</style>

## 后记

本来想写个`npm`包来封装的，搜索了一下，已经有人写好了[类似的东西](https://www.npmjs.com/package/react-native-anchor-point)，那就直接拿来用就行了
