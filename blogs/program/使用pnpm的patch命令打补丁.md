---
title: 使用pnpm的patch命令打补丁
date: 2022-07-12
categories:
 - program
---

在开发时，有时ui碰到依赖的类库有bug，需要修改，一般都有这几种处理方式

1. fork源码，修复bug然后提交pr，等待作者合并，释放新版本
2. 提issue 等待作者修复（等同于法1）
3. 使用`patch-package`打补丁，安装依赖后自动打上修改的内容

显然1和2的方法在紧张的开发阶段不大现实，因此使用法3更为合理。但如果你项目使用`pnpm`的话，[`patch-package`并不能使用](https://github.com/ds300/patch-package/issues/338)，所幸在v7.4.0的版本中，`pnpm`添加了`pnpm patch`和`pnpm pathc-commit`，支持了给依赖打补丁。

大致的流程也比较简单：通过命令拷贝一份依赖库的文件项目，然后用户对该拷贝的项目进行修改，然后通过提供的命令对修改后的代码以及原来的代码进行diff，生成一个`xxx.patch`的文件，对应项目的`package.json`会有个`pnpm.patchedDependencies`字段来指向`patch`文件，之前其他人安装依赖后，会自动使用到该`patch`

下面做一个简单的demo：

```bash
mkdir patch-demo

cd patch-demo

pnpm init
```

安装`is-odd`依赖

```bash
pnpm i is-odd
```
接下来，我们对该库进行自己的一些修改

首先，执行如下指令：生成一个is-odd的临时文件夹：

```bash
# 注意这里要指定对应的版本
pnpm patch is-odd@3.0.1

You can now edit the following folder: C:\Users\ADMINI~1\AppData\Local\Temp\482a1b2c5aaad6b4abb4d39bab8ef39c\user
```

然后我们打开生成的这个链接`C:\Users\ADMINI~1\AppData\Local\Temp\482a1b2c5aaad6b4abb4d39bab8ef39c\user`，在里面修改`is-odd`的代码

`is-odd`的代码很简单，假设我们要在改方法加上一行打印

```diff
module.exports = function isOdd(value) {
+ console.log('patch')
  const n = Math.abs(value);
  if (!isNumber(n)) {
    throw new TypeError('expected a number');
  }
  if (!Number.isInteger(n)) {
    throw new Error('expected an integer');
  }
  if (!Number.isSafeInteger(n)) {
    throw new Error('value exceeds maximum safe integer');
  }
  return (n % 2) === 1;
};
```

修改完成保存后，执行如下指令：

```bash
pnpm patch-commit  C:\Users\ADMINI~1\AppData\Local\Temp\482a1b2c5aaad6b4abb4d39bab8ef39c\user 
```

然后可以看到项目中生成了一个`patches/is-odd@3.0.1.patch`的文件，同时在`package.json`中也增加了如下配置：

```json
"pnpm": {
  "patchedDependencies": {
    "is-odd@3.0.1": "patches/is-odd@3.0.1.patch"
  }
}
```

然后这就搞定了！查看node_modeles下的is-odd代码，该修改已经加上了，后续别人拿到该项目，重新`pnpm i`也能得到修改后的代码

## 参考

- https://youtu.be/0GjLqRGRbcY
- https://pnpm.io/cli/patch
