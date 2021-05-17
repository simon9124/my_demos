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
