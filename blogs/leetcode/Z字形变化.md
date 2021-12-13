---
title: Z字形变化
date: 2021-12-13
categories:
 - leetcode
---

## 题目

[题目链接]([https://link](https://leetcode-cn.com/problems/zigzag-conversion/))


## 分析

画出示意图，可以很容易得出第一行和最后一行，每个数的间隔是`(numRows - 1) * 2`，而其他行可以看把两个数看成一个整体，每个整体的间隔也是`(numRows - 1) * 2`，然后一个整体里两个数的间隔为`(numRows - 1 - row) * 2`，于是很容易写出以下解法：

```javascript
/**
 * @param {string} s
 * @param {number} numRows
 * @return {string}
 */
var convert = function(s, numRows) {
    if (numRows === 1) return s
    let res = ''
    for (let i = 0; i < numRows; i++) {
        // 第i行
        for (let j = i; j < s.length;) {
            res += s[j]
            if (i > 0 && i < numRows - 1) {
                const t = (numRows - i - 1) * 2 + j
                if (t < s.length) {
                    res += s[t]
                }
            }
            j += (numRows - 1) * 2
        }
    }
    return res
};
```

## 按行排序

另一种更为直观的方法，就是新建`numRow`个字符串，然后后按从第0个字符开始遍历，一次放到对应字符串，每遍历`numRow`个字符就反向，例如当前输入有3行，那么第0个字符放在第0个字符串，第1个放到第1个字符串，第2个放到第2个字符串，此处以及遍历3个了，要反向，那么第3个就放到第1个字符串...，代码如下：

```javascript
/**
 * @param {string} s
 * @param {number} numRows
 * @return {string}
 */
var convert = function(s, numRows) {
    if (numRows === 1) return s
    let arr = new Array(numRows).fill('')
    let inc = false
    let index = 0
    for (let i = 0; i < s.length; i++) {
        if (index === 0 || index === numRows - 1) {
            inc = !inc
        }
        arr[index] += s[i]
        index = inc ? index + 1 : index - 1
    }
    return arr.join('')
};
```