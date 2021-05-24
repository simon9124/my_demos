/* 9.1 代理基础 */

/* 9.1.1 创建空代理 */
const target = {
  // 目标对象
  id: 'target',
}
const handler = {} // 处理程序对象（空对象）
const proxy = new Proxy(target, handler) // 创建空代理

console.log(target.id) // 'target'
console.log(proxy.id) // 'target'

target.id = 'foo' // 目标对象属性重新赋值
console.log(target.id) // 'foo'
console.log(proxy.id) // 'foo'，会反映到代理上

proxy.id = 'bar' // 代理属性重新赋值
console.log(target.id) // 'bar'，会反映到目标对象上
console.log(proxy.id) // 'bar'

console.log(target.hasOwnProperty('id')) // true
console.log(proxy.hasOwnProperty('id')) // true

// Proxy没有原型
console.log(Proxy) // [Function: Proxy]
console.log(Proxy.prototype) // undefined
// console.log(proxy instanceof Proxy) // TypeError: Function has non-object prototype 'undefined' in instanceof check

// 区分代理和目标
console.log(target === proxy) // false

/* 9.1.2 定义捕获器 */
const target2 = {
  foo: 'bar',
}
const handler2 = {
  // 定义get()捕获器函数，以方法名为键
  get() {
    return 'handler override'
  },
}
const proxy2 = new Proxy(target2, handler2)

console.log(proxy2.foo) // 'handler override'，代理对象上操作
console.log(proxy2['foo']) // 'handler override'，代理对象上操作
console.log(Object.create(proxy2).foo) // 'handler override'，代理对象上操作

console.log(target2.foo) // 'bar'，目标对象上操作
console.log(target2['foo']) // 'bar'，目标对象上操作
console.log(Object.create(target2).foo) // 'bar'，目标对象上操作

/* 9.1.3 捕获器参数和反射API */
const target3 = {
  foo: 'bar',
}
const handler3 = {
  // get()捕获器接收3个参数：目标对象、要查询的属性、代理对象
  get(tar, pro, rec) {
    console.log(tar === target3)
    console.log(pro)
    console.log(rec === handler3)
  },
}
const proxy3 = new Proxy(target3, handler3)
proxy3.foo
/* 
  true
  'foo'
  false
*/

// 重建被捕获方法的原始行为
const handler4 = {
  get(tar, pro, rec) {
    return tar[pro] // target3['foo']
  },
}
const proxy4 = new Proxy(target3, handler4)
console.log(proxy4.foo) // 'bar'

// Reflect对象封装了捕获器同名方法
const handler5 = {
  get() {
    return Reflect.get(...arguments) // 用arguments解耦
  },
  // get: Reflect.get, // 更简洁的写法
}
const proxy5 = new Proxy(target3, handler5)
console.log(proxy5.foo) // 'bar'

// 不定义处理程序对象
const proxy6 = new Proxy(target3, Reflect)
console.log(proxy6.foo) // 'bar'

// 利用反射API修改捕获的方法
const target4 = {
  foo: 'bar',
  baz: 'qux',
}
const handler6 = {
  get(tar, pro, rec) {
    let dec = ''
    pro === 'foo' && (dec = '!!!')
    return Reflect.get(...arguments) + dec
  },
}
const proxy7 = new Proxy(target4, handler6)
console.log(proxy7.foo) // 'bar!!!'
console.log(proxy7.baz) // 'qux'

/* 9.1.4 捕获器不变式 */
const target5 = {}
Object.defineProperty(target5, 'foo', {
  configurable: false, // 不可配置
  writable: false, // 不可重写
  value: 'bar',
})
const handler7 = {
  get() {
    return 'qux'
  },
}
const proxy8 = new Proxy(target5, handler7)
// console.log(proxy8.foo) // TypeError: 'get' on proxy: property 'foo' is a read-only and non-configurable data property on the proxy target but the proxy did not return its actual value (expected 'bar' but got 'qux')

/* 9.1.5 可撤销代理 */
const target6 = {
  foo: 'bar',
}
const handler8 = {
  get() {
    return 'intercepted'
  },
}
const revocable = Proxy.revocable(target6, handler8)
const proxy9 = revocable.proxy // 创建可撤销代理
console.log(proxy9.foo) // 'intercepted'

revocable.revoke() // 撤销代理
revocable.revoke() // 撤销代理，调用多次结果相同
revocable.revoke() // 撤销代理，调用多次结果相同
// console.log(proxy9.foo) // TypeError: Cannot perform 'get' on a proxy that has been revoked

/* 9.1.6 实用反射API */

/* 状态标记 */
const o = {}
Object.defineProperty(o, 'foo', {
  writable: false, // 不可重写
})

// Object.defineProperty(o, 'foo', { value: 'bar' }) // TypeError: Cannot redefine property: foo，Object.defineProperty()定义不成功会抛出错误
Reflect.defineProperty(o, 'foo', { value: 'bar' }) // Reflect.defineProperty()定义不成功不会抛出错误
console.log(Reflect.defineProperty(o, 'foo', { value: 'bar' })) // false，Reflect.defineProperty()返回“状态标记”的布尔值

// 重构后的代码
if (Reflect.defineProperty(o, 'foo', { value: 'bar' })) {
  console.log('success')
} else {
  console.log('failure') // 'failure'
}

/* 用一等函数替代操作符 */
const o2 = {
  foo: 1,
  bar: 2,
  get baz() {
    return this.foo + this.bar
  },
}
Reflect.get(o2, 'foo') // 1
Reflect.set(o2, 'foo', 3)
console.log(o2.foo) // 3
Reflect.has(o2, 'foo') // true
Reflect.deleteProperty(o2, 'bar')
console.log(o2.bar) // undefined
const arr = Reflect.construct(Array, [1, 2, 3])
console.log(arr) // [ 1, 2, 3 ]

/* 安全地应用函数 */
const f1 = function () {
  console.log(arguments[0] + this.mark)
}
const o3 = {
  mark: 95,
}
f1.apply(o3, [15]) // 110，将f1的this绑定到o3
Function.prototype.apply.call(f1, o3, [15]) // 110，函数的原型对象的apply方法，利用call进行绑定
Reflect.apply(f1, o3, [15]) // 110，通过指定的参数列表发起对目标函数的调用，三个参数（目标函数、绑定的this对象、实参列表）

/* 9.1.7 代理另一个代理 */
const target7 = {
  foo: 'bar',
}
const firstProxy = new Proxy(target7, {
  // 第一层代理
  get() {
    console.log('first proxy')
    return Reflect.get(...arguments)
  },
})
const secondProxy = new Proxy(firstProxy, {
  // 第二层代理
  get() {
    console.log('second proxy')
    return Reflect.get(...arguments)
  },
})
console.log(secondProxy.foo)
/* 
  'second proxy'
  'first proxy'
  'bar'
*/

/* 9.1.8 代理的问题与不足 */

/* 代理中的this */
const target8 = {
  thisValEqualProxy() {
    return this === proxy10
    /* 
      this指向：
      在实例中，指向实例本身
      在代理中，指向代理对象
    */
  },
}
const proxy10 = new Proxy(target8, {})
console.log(target8.thisValEqualProxy()) // false
console.log(proxy10.thisValEqualProxy()) // true

// 目标对象依赖于对象标识
const wm = new WeakMap()
class User {
  constructor(userId) {
    wm.set(this, userId) // 使用目标对象作为WeakMap的键
    /* 
      this的指向：目标对象
    */
  }
  get id() {
    return wm.get(this)
    /* 
      this的指向：
      在实例中，指向实例本身 User {}
      在代理中，指向代理对象
    */
  }
}

const user = new User(123)
console.log(wm) // WeakMap {User => 123}
console.log(user.id) // 123

const userInstanceProxy = new Proxy(user, {}) // 代理user实例，User类constructor中的this指向User类实例
console.log(wm) // WeakMap {User => 123}，弱键未发生变化
console.log(userInstanceProxy.id) // undefined

const userClassProxy = new Proxy(User, {}) // 代理User类本身
const proxyUser = new userClassProxy(456) // 创建代理实例，User类constructor中的this指向代理实例
console.log(wm) // WeakMap {User => 123, User => 456}，弱键发生变化，追加了以代理作为键
console.log(proxyUser.id) // 456

/* 代理与内部槽位 */
const target9 = new Date()
const proxy11 = new Proxy(target9, {})
console.log(target9.getDate()) // 24，当天日期
// console.log(proxy11.getDate()) // TypeError: this is not a Date object.
