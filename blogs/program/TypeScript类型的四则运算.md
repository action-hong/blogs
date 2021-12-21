---
title: TypeScript类型的四则运算
date: 2021-12-21
categories:
 - program
tags:
 - TypeScript
---


## 背景

之前写过篇博文[使用TypeScript类型体操实现一个简易版扫雷游戏](https://zhuanlan.zhihu.com/p/429165133), 里面使用了**查表的方式**来实现数组的加减：

```TypeScript
type 加法表 = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  never
]

type 查表<
  表格,
  数字,
  值 = never
> = 数字 extends keyof 表格 ? 表格[数字] : 值

type 加一<数字> = 查表<加法表, 数字>
```

但这种方式是有很大**缺陷**的，即没法做到通用：如果计算值超过9那只能修改`加法表`，显然就不是很现实。因此需要一种更通用的方法来处理。

## 方案

事实上，我们可以通过获取数组的`length`属性来得知数组的长度，因此两个数a和b相加，我们可以看成是获取长度a和长度b的数组合并起来的新的数组的长度，间接实现的**加法**。

首先我们需要通过数字构造一个对应长度额数组：

```TypeScript
type NArray<N extends number, R extends any[] = []> = R['length'] extends N ? R : NArray<N, [...R, 0]>
```

然后我们就可以通过合并两个数组实现加法了：

### 加法

```TypeScript
type Add<A extends number, B extends number> = [...NArray<A>, ...NArray<B>]['length'];
```

### 减法

```TypeScript
type Sub<A extends number, B extends number> = NArray<A> extends [...B: NArray<B>, ...Rest: infer R] ? R['length'] : never;
```

### 乘法

乘法其实可以看成是加法，即A*B可以看成B个A相加。大致思路就是用一个临时的变量，每次迭代用这个变量合并A长度的数组形成新的变量，同时将B减1，等到B为0时，返回这个变量的长度即为结果：

```TypeScript
type Mul<A extends number, B extends number, R extends any[] = []>
 = B extends 0 ? R['length']
  : Mul<A, Sub<B, 1>, [...R, ...NArray<A>]>;
```

### 除法

除法的思路其实和乘法类似，初始化一个临时变量，每次给A减一次B，就给该变量增加1的长度, 直到A小于B：

```TypeScript
type Div<A extends number, B extends number, R extends any[] = []>
 = Sub<A, B> extends never ? R['length']
  : Div<Sub<A, B>, B, [...R, 0]>;
```

这里的`Sub<A, B> extends never`表示此时A小于B的意思，这时候就可以返回了

## 其他

当然上诉方案也有其他缺陷：

- 不支持负数
- 不支持浮点型
- 减法中被减数必须大于减数

负数似乎也没有什么方法来实现

## 参考

- [TypeScript 类型体操天花板，用类型运算写一个 Lisp 解释器](https://zhuanlan.zhihu.com/p/427309936)