---
title: 了解webpack的模块加载原理(一)
date: 2021-10-19
categories:
 - program
tags:
 - 前端
 - webpack
---

`webpack`是一个模块打包器，通过其自身的一套加载模块机制讲项目中所需的每一个模块组合一个或多个bundles。下面就用些简单的例子来讲解下`webpack`模块加载的原理。

## 基础

我们新建一个工程，在`src`目录下新建两个文件:

```javascript
// src/foo.js
export function foo() {
  return 'hello world'
}
```

```javascript
// src/index.js
import { foo } from './foo'

function component() {
  const element = document.createElement('div');

  // Lodash, currently included via a script, is required for this line to work
  element.innerHTML = foo();

  return element;
}

document.body.appendChild(component());
```

执行webpack指令打包

```bash
npx webpack --mode=development
```

打包后的代码如下：

```javascript
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/foo.js":
/*!********************!*\
  !*** ./src/foo.js ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"foo\": () => (/* binding */ foo)\n/* harmony export */ });\nfunction foo() {\r\n  return 'hello world'\r\n}\r\n\n\n//# sourceURL=webpack://load-module/./src/foo.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _foo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./foo */ \"./src/foo.js\");\n\r\n\r\nfunction component() {\r\n  const element = document.createElement('div');\r\n\r\n  // Lodash, currently included via a script, is required for this line to work\r\n  element.innerHTML = (0,_foo__WEBPACK_IMPORTED_MODULE_0__.foo)();\r\n\r\n  return element;\r\n}\r\n\r\ndocument.body.appendChild(component());\n\n//# sourceURL=webpack://load-module/./src/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;
```

打包后的代码就是一个[`IIFE`](https://developer.mozilla.org/zh-CN/docs/Glossary/IIFE), 首先我们关注`__webpack_modules__`这个对象:

```javascript
var __webpack_modules__ = ({
  "./src/foo.js": ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
    eval("...");
  }),
  "./src/index.js":
  ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
    eval("...");
  })
});
```

删去多于的注释后，可以看出他就是个以模块名为`key`，加载执行模块内容为`value`的对象，注意这个`value`是一个函数，它的三个对象简单的可以看成是`webpack`里的`module`、`export`和`require`，这三个概率对于熟悉`commonjs`的同学来说应该很熟悉了。

我们继续看这个`IIFE`还做了什么事情：

- 定义一个模块加载缓存对象`__webpack_module_cache__`
- 定义一个加载模块的方法`__webpack_require__`, 该方法参数为模块id，即上文提到的`__webpack_modules__`的`key`值。
- `__webpack_require__`上绑定一些工具函数
  - `__webpack_require__.d`：给模块的输出添加属性
  - `__webpack_require__.o`：同`Object.prototype.hasOwnProperty`
  - `__webpack_require__.r`：给模块的输出加上`esModule`的标识
- 加载入口文件`__webpack_require__("./src/index.js")`

可以发现还是很简单的，我们重点看一下`__webpack_require__`的实现:

```javascript
function __webpack_require__(moduleId) {

	var cachedModule = __webpack_module_cache__[moduleId];
	if (cachedModule !== undefined) {
		return cachedModule.exports;
	}

	var module = __webpack_module_cache__[moduleId] = {
		exports: {}
	};

	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);

	return module.exports;
}
```

1. 首先判断该模块是否缓存，有的话直接返回
2. 新建一个`module`，其有一个`export`属性，并将它加到缓存中
3. 通过模块`id`, 从上诉提到的`__webpack_modules__`中拿到该模块的加载函数，将`module`，`export`，`__webpack_require__`作为参数传入。

接下来我们看一看入口文件的加载，根据上诉`__webpack_require__`的逻辑，会执行下面的代码（去掉多于的注释）：

```javascript
__webpack_require__.r(__webpack_exports__);
var _foo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/foo.js");
function component() {
  const element = document.createElement('div');
  element.innerHTML = (0,_foo__WEBPACK_IMPORTED_MODULE_0__.foo)();
  return element;
}
document.body.appendChild(component());
```

可以发现和源代码的`src/index.js`基本一致，主要看看不同的地方:

`__webpack_require__.r(__webpack_exports__)`, 没什么好说的，将该模块(src/index.js)加上`esModule`的标识

引入`src/foo`模块变成了`var _foo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/foo.js");`, 调用`foo`函数变成`(0,_foo__WEBPACK_IMPORTED_MODULE_0__.foo)()`

这里加载`./src/foo.js`模块的执行代码如下:

```javascript
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "foo": () => (foo)
});
function foo() {
  return 'hello world'
}
```

很简单，主要就是给`__webpack_exports__`定义一个属性值`foo`，对应值便是我们在源代码里定义的`foo`函数，因此这里可以看成是:

```javascript
var _foo__WEBPACK_IMPORTED_MODULE_0__ = {
  foo: function () {
    return 'hello world'
  }
}

```

即`(0,_foo__WEBPACK_IMPORTED_MODULE_0__.foo)()`便是调用`foo`方法。

上诉便是一个简单的模块加载流程了，在总结一下：

1. 定义一个包含所有模块加载的对象`__webpack_modules__`
2. 定义一个加载模块的缓冲对象，有缓冲时直接加载
3. 定义一个加载方法`__webpack_require__`，源码中有引入其他模块的时候，就会调用该方法，加载时有缓冲时直接用缓存，没有缓存时回新建一个`module`，然后会加载对应的模块，将其导出的内容放到`module.export`内，同时把刚刚的`module`放到缓存中
4. 加载执行入口模块，递归加载其他模块。

**这里还有个问题，为什么需要使用`__webpack_require__.r`给模块加上标识呢？**，主要用来处理混用`commonjs`和`es module`的情况，对源代码进行修改：

```diff
// src/foo.js
- export function foo() {
-   return 'hello world'
- }

+ function foo() {
+   return 'hello world'
+ }
+ 
+ module.exports = foo
```

```diff
// src/index.js
- import { foo } from './foo'
+ import foo from './foo'

function component() {
  const element = document.createElement('div');

  // Lodash, currently included via a script, is required for this line to work
  element.innerHTML = foo();

  return element;
}

document.body.appendChild(component());
```

重新打包，会看到生成的代码中多了一个方法：

```javascript
__webpack_require__.n = (module) => {
	var getter = module && module.__esModule ?
		() => (module['default']) :
		() => (module);
	__webpack_require__.d(getter, { a: getter });
	return getter;
};
```

如果模式是`es module`，则返回`module['default']`，否则返回`module`。

在看看打包后的`foo`模块和`index`模块

```javascript
function foo() {  
  return 'hello world'
}
module.exports = foo
```

```javascript
__webpack_require__.r(__webpack_exports__);
var _foo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./foo */ "./src/foo.js");
var _foo__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(_foo__WEBPACK_IMPORTED_MODULE_0__);
function component() {
  const element = document.createElement('div');
  element.innerHTML = _foo__WEBPACK_IMPORTED_MODULE_0___default()();
  return element;
}
document.body.appendChild(component());
```

可以看到`foo`模块里没有在用`__webpack_require__.r`加标识了，因为现在不是`esModule`模块了，然后`__webpack_require__.n(_foo__WEBPACK_IMPORTED_MODULE_0__)`根据函数定义，即返回一个`getter`函数，调用该函数即得到`foo`的模块，
因此`_foo__WEBPACK_IMPORTED_MODULE_0___default()()`即等价于`foo()`
