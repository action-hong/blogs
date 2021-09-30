---
title: 关于flex-grow和flex-shrink如何影响元素的大小
date: 2021-09-29
categories:
 - program
 - CSS
 - flex
---

## 前言

本文默认`flex-direction`为`row`

该文章主要介绍在使用`flex`的时候，`flex`的子元素总宽度大于或小于父类元素宽度后，`flex-grow`及`flex-shrink`如何控制子元素的扩大或缩放，以及最后宽度的计算

## flex-grow

在所有`flex`子元素的宽度总和小于父类宽度时，父类宽度减去所有`flex`子元素的宽度就得到一个多余的宽度（[positive free space](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Controlling_Ratios_of_Flex_Items_Along_the_Main_Ax#positive_and_negative_free_space)），各个子元素会根据自身设置的`flex-grow`值的比例来占据这个剩余宽度

假设父类宽度为`300px`，有两个子元素（a、b）大小均为`100px`，`flex-grow`值分别为`1`和`2`

那么剩余宽度即为：`300 - 200 = 100px`

子元素的宽度为：**原宽度 + 剩余宽度 * 自身flex-grow值 / 所有子元素的flex-grow的和**

所以a和b的宽度分别为:

a: `100 + 100 * 1 / 3 = 133.33`

b: `100 + 100 * 2 / 3 = 166.67`

## flex-shrink

同理，当所有子元素的宽度大于父类宽度时，相减得到的值即为子元素溢出的尺寸，各个子元素会根据自身设置的`flex-shrink`值的比例来缩放自身的宽度

假设父类宽度为`300px`，有两个子元素（a、b）大小均为`200px`，`flex-shrink`值分别为`1`和`2`

那么溢出的宽度为: `2 * 200 - 300 = 100px`

子元素的宽度为：**原宽度 - 溢出宽度 * 自身flex-shrink值 / 所有子元素的flex-shrink的和**

所以a和b的宽度分别为:

a: `200 - 100 * 1 / 3 = 166.67px`

b: `200 - 100 * 2 / 3 = 133.33px`

可以尝试拖动下面的进度条，调整`flex-grow`和`flex-shrink`，看看具体效果

<iframe src="https://codesandbox.io/embed/xenodochial-feather-seudt?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="xenodochial-feather-seudt"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>