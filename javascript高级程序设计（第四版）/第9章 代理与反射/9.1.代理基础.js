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
const o = {}
try {
  Object.defineProperty(o, 'foo', 'bar')
  console.log('success')
} catch (error) {
  console.log('failure') // 'failure'，Object.defineProperty()定义出错会抛出错误
}

if(Reflect.defineProperty(o, 'foo', 'bar'))
