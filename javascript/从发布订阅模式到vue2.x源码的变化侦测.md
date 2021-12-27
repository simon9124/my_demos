- 发布订阅模式是前端设计模式的核心之一，在`vue2.x`的源码中举足轻重，本文就从该模式入手，层层递进，看看`vue2.x`的源码是怎样进行数据变化侦测的

## Object.defineProperty（核心方法）

- `Object.defineProperty`是`vue2.x`变化侦测的核心，通过为属性**设置访问器属性**，可在对象**获取属性**或**属性变化**时做监测

```js
let person = { name: 'Nicholas' }
let name = person.name
Object.defineProperty(person, 'name', {
  enumerable: true,
  configurable: true,
  get() {
    console.log('name被读取了')
    return name
  },
  set(newVal) {
    if (name === newVal) {
      return
    }
    console.log('name被修改了')
    name = newVal
  },
})

person.name // 'name被读取了'
person.name = 'Greg' // 'name被修改了'
console.log(person) // { name: "Greg" }
```

## Observer 类（发布者：数据劫持）

```js
// Observer类：把Object数据中的所有属性（包括子属性）都转换成getter/seter的形式来侦测变化
class Observer {
  constructor(value) {
    this.value = value
    if (Array.isArray(value)) {
      // value为数组
    } else {
      // value不为数组
      this.walk(value)
    }
  }

  // 原型方法walk：循环该对象的key，针对每个key执行defineReactive()方法 → 让对象变得可观测（因此要求vue的data必须返回一个对象）
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
}

// 使一个对象转化成可观测对象
function defineReactive(obj, key, val) {
  if (arguments.length === 2) {
    val = obj[key]
  }
  if (typeof val === 'object') {
    new Observer(val) // 若val仍是对象，则递归
  }

  /* 访问器属性 */
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    /* get:读取属性时调用的函数 */
    get() {
      console.log(`${key}被读取了`)
      return val
    },
    /* set:写入属性时调用的函数 */
    set(newVal) {
      if (val === newVal) {
        return
      }
      console.log(
        `${key}被修改了：${
          typeof val === 'string' ? val : JSON.stringify(val)
        }=>${typeof newVal === 'string' ? newVal : JSON.stringify(newVal)}`
      )
      val = newVal
    },
  })
}

let data = {
  brand: 'BMW',
  price: 3000,
  child: {
    count: 100,
  },
}
let observer = new Observer(data).value

observer.price // 'price被读取了'
observer.price = 5000 // 'price被修改了：3000=>5000'
observer.child.count = 101
// 'child被读取了'
// 'count被修改了：100=>101'
```

- 发布者对`data`（**被监测对象**）里的数据进行绑定（劫持），监控其属性是否发生了改变：
  - 通过递归，`data`的**全部属性**都调用`Object.defineProperty`，即**设置访问器属性**
  - 属性、子属性**被访问或修改**时，均触发该属性的`getter`或`setter`方法
  - 仅能监测对象的属性变化（因为`Object.defineProperty`**无法对数组进行监测**）
  - 无法监测向`data`中添加/删除`key/value`

## Dep 类（处理中心：收集依赖）

```js
let uid = 0

// Dep类：依赖管理器，用于存储收集到的依赖
class Dep {
  constructor() {
    this.id = uid++
    this.subs = [] // 依赖数组
  }

  addSub(sub) {
    this.subs.push(sub)
    console.log('向依赖中添加Watcher实例：subs', this.subs)
  }
  // 删除一个依赖
  removeSub(sub) {
    remove(this.subs, sub)
  }
  // 添加一个依赖
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this) // Dep.target即Watcher实例 -> 调用Watcher实例的addDep方法，参数为Dep实例
    }
  }
  // 通知所有依赖更新
  notify() {
    console.log('依赖更新：subs', this.subs)
    const subs = this.subs.slice()
    // 遍历所有依赖（即Watcher实例）
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update() // 执行依赖的update()方法（Watcher类中的update()方法）
    }
  }
}

// 删除一个依赖
function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}
```

- `Dep`类作为中转站，负责将`Observer`类中监听到（触发`getter`）的数据放入依赖数组`subs`：
  - `Dep`单独存在是没有意义的，需结合`Watcher`一并使用，`Dep.target`指向`Watcher`实例
  - `depend()`方法向依赖数组`subs`中添加`Watcher`实例
  - `notify()`方法执行依赖数组`subs`中的`Watcher`实例的`update()`方法

```js
// 使一个对象转化成可观测对象
function defineReactive(obj, key, val) {
  const dep = new Dep() // 实例化一个依赖管理器，用来收集对象的依赖（让data的每个属性都注册一个dep对象）
  if (arguments.length === 2) {
    val = obj[key]
  }
  if (typeof val === 'object') {
    new Observer(val)
  }
  /* 访问器属性 */
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      console.log(`${key}被读取了`)
      dep.depend() // 调用Dep实例的depend()方法（收集对象依赖）
      return val
    },
    set(newVal) {
      if (val === newVal) {
        return
      }
      console.log(
        `${key}被修改了：${
          typeof val === 'string' ? val : JSON.stringify(val)
        }=>${typeof newVal === 'string' ? newVal : JSON.stringify(newVal)}`
      )
      val = newVal
      dep.notify() // 调用dep实例的notify()方法（通知对象依赖更新）
    },
  })
}
```

- 相应的，发布者`Observer`中的`defineReactive()`方法需做出上面的调整：
  - `data`的每个属性都注册一个`Dep`的实例`dep`，属性、子属性**被访问或修改**时，均触发该属性的`getter`或`setter`方法
  - `getter`方法中调用`dep`的`depend()`方法（即添加依赖）
  - `setter`方法中调用`dep`的`update()`方法（即通知依赖更新）

```js
let data = {
  brand: 'BMW',
  price: 3000,
  child: {
    count: 100,
  },
}
// 实例化Observer，在data的每个属性上都new一个dep实例，该属性获取时调用dep.depend()，更新时调用dep.update()
let observer = new Observer(data)
```

- `new Observer`将`data`的每个属性都转化成可观测对象，现在就差**订阅要监听的属性，即将`Dep.target`指向`Watcher`实例**了

## Watcher 类（订阅者：监听某属性的数据变化）

```js
// Watcher类：当数据发生变化时，通知Watcher实例，由Watcher实例去做真实的更新操作
class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm // 要监测的对象
    this.cb = cb // 回调方法
    this.depIds = new Set() // 依赖id集合 - 缓存
    this.getter = parsePath(expOrFn) // 在parsePath方法中触发数据的getter，详见parsePath方法源码
    this.value = this.get() // 实例化Watcher类时，在构造函数中调用this.get()方法
  }
  get() {
    Dep.target = this // 将Watcher实例赋给全局的唯一对象Dep的target属性（将Watcher注册到依赖中）
    const vm = this.vm
    let value = this.getter.call(vm, vm) // 获取被依赖的数据 → 触发该数据的getter → 触发dep.depend()，将Dep.target（Watcher）添加到依赖数组中
    // console.log(value)
    Dep.target = undefined // 将Watcher从依赖中释放
    return value
  }

  /* 添加依赖 */
  addDep(dep) {
    const id = dep.id
    // 避免重复添加
    if (!this.depIds.has(id)) {
      dep.addSub(this)
      this.depIds.add(id)
    }
  }

  // 更新依赖：从Dep类中调用notify()来通知
  update() {
    const oldValue = this.value
    this.value = this.get() // 获取监听到的变化后的值
    // 将this.cb利用call绑定到this.vm，并调用this.cb()即回调函数
    this.cb.call(this.vm, this.value, oldValue) // 调用数据变化的回调函数，从而更新视图
  }
}

const unicodeRegExp =
  /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/
const bailRE = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`)

// 把一个形如'data.a.b.c'的字符串路径所表示的值，从真实的data对象中取出来
// data = {a:{b:{c:2}}}  parsePath('a.b.c')(data)===2
function parsePath(path) {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]] // 在这里触发数据的getter
    }
    return obj
  }
}
```

- 用`Watcher`订阅要监听的属性，接受三个参数：要监听的整个对象、具体监听属性所在的字符串路径、回调方法
  - 做个联动，`new`一个`Watcher`实例，监听前文`data`中的`price`属性

```js
new Watcher(data, 'price', function (newVal, oldVal) {
  console.log(`price被修改了：${oldVal}=>${newVal}`)
})
// price被读取了（Observer中触发）
// 向依赖中添加Watcher实例：subs [Watcher]（Dep中触发）
```

- 在`new Watcher`的过程中：
  - 触发原型方法`get()`，将`Watcher`实例赋给`Dep.target`
  - 根据字符串路径`price`获取该属性值（触发`Observer`中该属性的`getter`）
    - 触发`dep.depend()`，将`Dep.target`（`Watcher`实例）添加到依赖数组`subs`中
  - 释放`Dep.target`，赋值为`undefined`

```js
data.price++
// price被读取了（Observer中触发）
// price被修改了：3000=>3001（Observer中触发）
// 依赖更新：subs [Watcher]（Dep中触发）
// price被读取了（Observer中触发）
// price被修改了：3000=>3001（Watcher中触发）
```

- 对监听的属性`price`做出修改的过程中：
  - 触发`price`属性的`getter`，`subs`中已添加过该属性的`Watcher`实例因此无需重复添加
  - 触发`price`属性的`setter` → 调用`dep.notify()` → 调用`Watcher`实例的`update()`
    - 再次调用`Watcher`的原型方法`get()`，触发`price`属性的`getter`
    - 调用传给`Watcher`实例的回调方法

## 完整代码 & 过程总结

```js
// Observer类：把Object数据中的所有属性（包括子属性）都转换成getter/seter的形式来侦测变化
class Observer {
  constructor(value) {
    this.value = value
    if (Array.isArray(value)) {
      // value为数组
    } else {
      // value不为数组
      this.walk(value)
    }
  }

  // 原型方法walk：循环该对象的key，针对每个key执行defineReactive()方法 → 让对象变得可观测（因此要求vue的data必须返回一个对象）
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
}

// 使一个对象转化成可观测对象
function defineReactive(obj, key, val) {
  const dep = new Dep() // 实例化一个依赖管理器，用来收集对象的依赖（让data的每个属性都注册一个dep对象）
  if (arguments.length === 2) {
    val = obj[key]
  }
  if (typeof val === 'object') {
    new Observer(val)
  }
  /* 访问器属性 */
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      console.log(`${key}被读取了`)
      dep.depend() // 调用Dep实例的depend()方法（收集对象依赖）
      return val
    },
    set(newVal) {
      if (val === newVal) {
        return
      }
      console.log(
        `${key}被修改了：${
          typeof val === 'string' ? val : JSON.stringify(val)
        }=>${typeof newVal === 'string' ? newVal : JSON.stringify(newVal)}`
      )
      val = newVal
      dep.notify() // 调用dep实例的notify()方法（通知对象依赖更新）
    },
  })
}

let uid = 0

// Dep类：依赖管理器，用于存储收集到的依赖
class Dep {
  constructor() {
    this.id = uid++
    this.subs = [] // 依赖数组
  }

  addSub(sub) {
    this.subs.push(sub)
    console.log('向依赖中添加Watcher实例：subs', this.subs)
  }
  // 删除一个依赖
  removeSub(sub) {
    remove(this.subs, sub)
  }
  // 添加一个依赖
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this) // Dep.target即Watcher实例 -> 调用Watcher实例的addDep方法，参数为Dep实例
    }
  }
  // 通知所有依赖更新
  notify() {
    console.log('依赖更新：subs', this.subs)
    const subs = this.subs.slice()
    // 遍历所有依赖（即Watcher实例）
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update() // 执行依赖的update()方法（Watcher类中的update()方法）
    }
  }
}

// 删除一个依赖
function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

// Watcher类：当数据发生变化时，通知Watcher实例，由Watcher实例去做真实的更新操作
class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm // 要监测的对象
    this.cb = cb // 回调方法
    this.depIds = new Set() // 依赖id集合 - 缓存
    this.getter = parsePath(expOrFn) // 在parsePath方法中触发数据的getter，详见parsePath方法源码
    this.value = this.get() // 实例化Watcher类时，在构造函数中调用this.get()方法
  }
  get() {
    Dep.target = this // 将Watcher实例赋给全局的唯一对象Dep的target属性（将Watcher注册到依赖中）
    const vm = this.vm
    let value = this.getter.call(vm, vm) // 获取被依赖的数据 → 触发该数据的getter → 触发dep.depend()，将Dep.target（Watcher）添加到依赖数组中
    // console.log(value)
    Dep.target = undefined // 将Watcher从依赖中释放
    return value
  }

  /* 添加依赖 */
  addDep(dep) {
    const id = dep.id
    // 避免重复添加
    if (!this.depIds.has(id)) {
      dep.addSub(this)
      this.depIds.add(id)
    }
  }

  // 更新依赖：从Dep类中调用notify()来通知
  update() {
    const oldValue = this.value
    this.value = this.get() // 获取监听到的变化后的值
    // 将this.cb利用call绑定到this.vm，并调用this.cb()即回调函数
    this.cb.call(this.vm, this.value, oldValue) // 调用数据变化的回调函数，从而更新视图
  }
}

const unicodeRegExp =
  /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/
const bailRE = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`)

// 把一个形如'data.a.b.c'的字符串路径所表示的值，从真实的data对象中取出来
// data = {a:{b:{c:2}}}  parsePath('a.b.c')(data)===2
function parsePath(path) {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]] // 在这里触发数据的getter
    }
    return obj
  }
}

let data = {
  brand: 'BMW',
  price: 3000,
  child: {
    count: 100,
  },
}
let observer = new Observer(data)

new Watcher(data, 'price', function (newVal, oldVal) {
  console.log(`price被修改了：${oldVal}=>${newVal}`)
})
// price被读取了（Observer中触发）
// 向依赖中添加Watcher实例：subs [Watcher]（Dep中触发）

data.price++
// price被读取了（Observer中触发）
// price被修改了：3000=>3001（Observer中触发）
// 依赖更新：subs [Watcher]（Dep中触发）
// price被读取了（Observer中触发）
// price被修改了：3000=>3001（Watcher中触发）
```

- `new Observer`，将`data`对象的所有属性都转化成可观测：
  - `child`属性的值仍是对象，会进行递归
  - 所有可观测的属性上，都调用`new Dep`，注册一个`dep`对象
  - 获取该属性时触发`getter`即`dep.depend()`，修改该属性时触发`setter`即`dep.notify()`
- `new Watcher`，订阅要监听的属性`price`：
  - 触发原型方法`get()`，将`Watcher`实例赋给`Dep.target`
  - 根据字符串路径`price`获取该属性值（触发`Observer`中该属性的`getter`），打印**price 被读取了**
  - 触发`dep.depend()`，将`Dep.target`（`Watcher`实例）添加到依赖数组`subs`中，打印**向依赖中添加 Watcher 实例：subs [Watcher]**
  - 释放`Dep.target`，赋值为`undefined`
- `data.price++`，对监听的属性`price`做出修改
  - 触发`price`属性的`getter`，打印**price 被读取了**，`subs`中已添加过该属性的`Watcher`实例因此无需重复添加
  - 触发`price`属性的`setter`，打印**price 被修改了：3000=>3001**
    - 调用`dep.notify()`，打印**依赖更新：subs [Watcher]**
  - 调用`Watcher`实例的`update()`
    - 再次调用`Watcher`的原型方法`get()`，触发`price`属性的`getter`，打印**price 被读取了**
    - 调用传给`Watcher`实例的回调方法，打印**price 被修改了：3000=>3001**
