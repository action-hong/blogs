---
title: 如何主动关闭el-cascader弹窗
date: 2021-10-13
categories:
 - 使用姿势
tags:
 - Element
 - 前端
---

碰到个小需求，产品希望说用户在使用`el-cascader`级联选择器时，选择任意一级后，就直接隐藏弹窗，**而不必再点击空白区域来关闭弹窗**，方便用户使用。

我觉得很有道理，然后我去翻阅[相关的文档](https://element.eleme.cn/#/zh-CN/component/cascader#cascader-methods)，结果一无所获，对外只提供一个`getCheckedNodes`方法。

没办法，只好去翻[相关源码](https://github.com/ElemeFE/element/blob/dev/packages/cascader/src/cascader.vue)了：

```html
<div
  ref="reference"
  :class="[
    'el-cascader',
    realSize && `el-cascader--${realSize}`,
    { 'is-disabled': isDisabled }
  ]"
  v-clickoutside="() => toggleDropDownVisible(false)"
  ...
  >
  ...
  </div>
```

```javascript
// https://github.com/ElemeFE/element/blob/dev/packages/cascader/src/cascader.vue#L395
  toggleDropDownVisible(visible) {
    if (this.isDisabled) return;
    const { dropDownVisible } = this;
    const { input } = this.$refs;
    visible = isDef(visible) ? visible : !dropDownVisible;
    if (visible !== dropDownVisible) {
      this.dropDownVisible = visible;
      if (visible) {
        this.$nextTick(() => {
          this.updatePopper();
          this.panel.scrollIntoView();
        });
      }
      input.$refs.input.setAttribute('aria-expanded', visible);
      this.$emit('visible-change', visible);
    }
  },
...
```

很显然，组件内部便是调用`toggleDropDownVisible(false)`来实现弹窗开关的，因此我们可以通过监听`change`事件，执行该方法来实现上诉的需求，如下：

```html
<el-cascader
  ref="cascader"
  @change="$refs.cascader.toggleDropDownVisible(false)"
  :options="options"
  :props="{ checkStrictly: true }"
  clearable></el-cascader>
```

[你可以试试](https://codepen.io/action-hong/pen/mdMJBjQ)
