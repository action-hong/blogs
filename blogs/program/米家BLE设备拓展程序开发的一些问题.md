---
title: 关于米家BLE设备拓展程序开发的笔记
date: 2021-11-19
categories:
  - program
tags:
  - 米家
---

## 开发环境

|平台|版本|
|--|--|
|米家sdk|10053|
|Android|6.12.709|
|iOS|v6.14.100|

## spec 属性读取

```js
const props = [{
  siid: 4,
  piid: 1
}, {
  siid: 4,
  piid: 2
}, ...]
let entity = { objects: props };
let json = JSON.stringify(entity);
Bluetooth.spec
      .getProperty(Device.mac, json)
      .then((data) => {
        // 处理返回结果
      }
```

### 读取时机

经测试，需要在发现特征值后，才能正确读取属性，而非连接成功。（不过`Android`上连接后即可）

```js
this._s2 = BluetoothEvent.bluetoothCharacteristicDiscovered.addListener(
  (bluetooth, service, characters) => {
    // TODO: 处理发现的特征值
    ...
    // 读取设备信息
    this.getProperty();
  }

```

### 处理返回结果

这里很神奇的是，`Android`返回的是一个 json 字符串，而`ios`返回的是一个对象，因此需要做如下处理

```js
if (typeof data === 'string') {
  data = JSON.parse(data)
}
```

同理设置 spec 属性返回的结果也是如此

处理后，`Android`和`ios`的结构一样，如下：

```json
{
  "objects": [
    { "type": 0, "piid": 1, "value": true, "ssid": 4, "siid": 4, "code": 0 },
    { "type": 1, "piid": 2, "value": 4, "ssid": 4, "siid": 4, "code": 0 },
    { "type": 0, "piid": 3, "value": true, "ssid": 4, "siid": 4, "code": 0 },
    { "type": 0, "piid": 4, "value": true, "ssid": 4, "siid": 4, "code": 0 },
    { "type": 1, "piid": 5, "value": 20, "ssid": 4, "siid": 4, "code": 0 }
  ],
  "opcode": 3
}
```

然后我们根据读到的值去更新UI就行了。

## spec 属性设置

```javascript
const props = [
  {
    siid: 4,
    piid: 2,
    type: 2,
    value: '1',
  },
]
let entity = { objects: props }
let json = JSON.stringify(entity)
Bluetooth.spec.setPropertiesValue(Device.mac, json).then((data) => {
  // 处理返回结果
})
```

### 传参

这里需要注意，要设置的每个属性，都要传入对应的`type`，具体不同类型值对应的`type`如下：

```javascript
const TYPE_BOOL = 0
const TYPE_UINT8 = 1
const TYPE_INT8 = 2
const TYPE_UINT16 = 3
const TYPE_INT16 = 4
const TYPE_UINT32 = 5
const TYPE_INT32 = 6
const TYPE_UINT64 = 7
const TYPE_INT64 = 8
const TYPE_FLOAT = 9
const TYPE_STRING = 10
```

**还有一点更重要的：**，除了是布尔类型，传入的`value`取`true`或`false`，其他的各种整型，均应该转成字符串传入，例如现在我有一个属性`mode`，他的类型是`unit8`，现在我要将该属性设置为`2`，此时我应该这样定义：

```js
const json = [
  {
    siid: 4,
    piid: 2,
    type: 2,
    value: '2',
  },
]
```

### 处理返回结果

返回的`data`在不同平台上类型不同，同上面读取返回的结果那样处理即可。

还有一点是这里不同平台返回的结果也不同：

`Android`

```json
{
  "objects": [{ "piid": 1, "ssid": 4, "siid": 4, "value": 1, "code": 0 }],
  "opcode": 1
}
```

`ios`

```json
{ "objects": [{ "piid": 1, "ssid": 4, "siid": 4, "code": 0 }], "opcode": 1 }
```

可以很明显发现`ios`返回的结果没有携带属性设置后的值，因此我们应该直接使用传入的`json`里的值去更新界面

```js
...
Bluetooth.spec.setPropertiesValue(Device.mac, json).then((data) => {
  // 处理返回结果
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }
  for (let i = 0; i < props.length; i++) {
    let { type, value } = props[i]
    // 这里注意，value除了布尔型都是字符串，
    // 根据type将整型，浮点型的数据转回来
    if (type !== TYPE_BOOL
      && type !== TYPE_STRING) {
      if (type === TYPE_FLOAT) {
        value = parseFloat(value);
      } else {
        value = parseInt(value);
      }
    }
    // 根据value去更新界面
  }
})
```
