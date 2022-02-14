---
title: TypeScript判断never类型
date: 2022-02-11
categories:
 - program
tags:
 - TypeScript
---

群里看到一个有趣的问题，`ts`里如何判断`never`:

```ts
// a is true
type a = never extends never ? true : false;

type isNever<T> = T extends never ? true : false
// b is never
type b = isNever<never>
```

看起来两个方法都是一样的，但是a得到正确的结果，b却得到`never`

想了解为什么会这样，需要理解下[TypeScript: Documentation - Conditional Types (typescriptlang.org)](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types)

根据`Distributive Conditional Types`，联合类型作为泛型传入后，用在判断类型上时，会将联合类型分开单独计算和进行合并返回

> When conditional types act on a generic type, they become distributive when given a union type. For example, take the following:

例如:

```ts
type ToArray<Type> = Type extends any ? Type[] : never;

// 等价于
// ToArray<string> | ToArray<number>
// 即 string[] | number[]
type StrArrOrNumArr = ToArray<string | number>;

```
因为`never`是一个特殊的联合类型，它没有任何一个成员，自然也不需要计算了，直接返回`never`就是了

不想让`Distributive Conditional Types`生效的话，可以在泛型前后加上括号即可:

```ts
type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;

// (string | number)[]
type StrArrOrNumArr = ToArrayNonDist<string | number>;
```

因此开头的问题需要改成如下:

```ts
type IsNever<T> = [T] extends [never] ? true : false
```

### 参考

[Generic conditional type T extends never ? 'yes' : 'no' resolves to never when T is never. · Issue #31751 · microsoft/TypeScript (github.com)](https://github.com/microsoft/TypeScript/issues/31751)

