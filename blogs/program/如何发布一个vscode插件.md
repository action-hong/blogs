---
title: 如何发布一个vscode插件
date: 2022-03-19
categories:
 - program
tags:
 - vscode
 - 插件
---

当你开发完一个vscode插件后，需要把他上传到市场，这里做一下上传的记录，方便以后观看。

## vsce

这是一个命令行工具，用来打包/发布/管理插件的命令行工具

```bash
# 安装
npm install -g vsce
```

## 发布

vscode使用[Azure DevOps Services | Microsoft Azure](https://azure.microsoft.com/zh-cn/services/devops/)来管理插件，需要也只能通过[使用个人访问令牌 - Azure DevOps | Microsoft Docs](https://docs.microsoft.com/zh-cn/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows)来发布插件。

### 获取个人访问令牌

首先在Azure DevOps上[创建组织](https://docs.microsoft.com/zh-cn/azure/devops/organizations/accounts/create-organization?view=azure-devops)，然后[创建一个项目](https://docs.microsoft.com/zh-cn/azure/devops/organizations/projects/create-project?view=azure-devops&tabs=preview-page)

然后[创建个人访问令牌](https://docs.microsoft.com/zh-cn/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows)，注意这里的权限范围选择**MarketPlace > Manage**即可

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ad9a899d61e946fd850317ed9b66fcb9~tplv-k3u1fbpfcp-watermark.image?)
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9e521321f8cd4af19626afdec949afc7~tplv-k3u1fbpfcp-watermark.image?)

### 创建publisher

**publisher**是用来发布插件到vscode插件市场的身份，每个插件都需要在`package.json`里包含`publisher`这个字段。

你需要再[Manage Extensions | Visual Studio Marketplace](https://marketplace.visualstudio.com/manage/publishers/kkopite)创建一个`publisher`，这里需要注意的是这里**必须使用刚才创建个人访问令牌的**微软账号，这里的`publisher`需要和你`package.json`里的`publisher`字段一样

创建完后，我们验证下:

```
vsce login <publisher name>
```

然后会让你输入刚刚创建的**个人访问令牌**，输入后出现下面类似提示表示正常:

```
The Personal Access Token verification succeeded for the publisher '你取的publisher名字'.
```

### 发布插件

```bash
vsce publish
```

如果你刚刚没有使用`vsce login xxx`, 那么这里会先让你输入**个人访问令牌**

你也可以选择直接在[Manage Extensions | Visual Studio Marketplace](https://marketplace.visualstudio.com/manage/publishers/kkopite)手动上传插件:


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2625dcbe52614abeb9d35a6e632c1a13~tplv-k3u1fbpfcp-watermark.image?)

## 自动升级插件版本

当你想发布新插件时，可以指定`major`,`minor`,`path`来自动升级版本。例如如果你想要把当前插件版本从`1.0.0`变到`1.1.0`, 那就使用如下指令:

```
vsce publish minor
```

在发布插件前，它会自动去更新`package.json`内的版本。

你也可以直接输入指定的版本:

```
vsce publish 2.0.1
```

## 参考资料

- [Publishing Extensions | Visual Studio Code Extension API](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)