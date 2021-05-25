/* 9.2 代理捕获器与反射方法 */

/* 9.2.1 get() */
const myTarget = {
  foo: 'bar',
}
const proxy = new Proxy(myTarget, {
  get(target, property, receiver) {
    console.log(target) // { foo: 'bar' }，目标对象
    console.log(property) // 'foo'，目标对象键属性
    console.log(receiver) // { foo: 'bar' }，代理对象
    return Reflect.get(...arguments)
  },
})
console.log(proxy.foo) // 'bar'，拦截的操作

// 捕获器不变式
Object.defineProperty(myTarget, 'foo', {
  configurable: false, // 不可配置
})
const proxy2 = new Proxy(myTarget, {
  get() {
    return 'baz' // 试图重写
  },
})
// console.log(proxy2.foo) // TypeError

/* 9.2.2 set() */
const myTarget2 = {}
const proxy3 = new Proxy(myTarget2, {
  set(target, property, value, receiver) {
    console.log(target) // {}，目标对象
    console.log(property) // 'foo'，目标对象键属性
    console.log(value) // 'baz'，要赋给属性的值
    console.log(receiver) // {}，接收最初赋值的对象
    console.log(Reflect.set(...arguments)) // true，操作成功
    return Reflect.set(...arguments)
  },
})
proxy3.foo = 'baz' // 拦截的操作
console.log(proxy3.foo) // 'baz'
console.log(myTarget2.foo) // 'baz'，赋值转移到目标对象上

// 捕获器不变式
Object.defineProperty(myTarget2, 'foo', {
  configurable: false, // 不可配置
  writable: false, // 不可重写
})
const proxy4 = new Proxy(myTarget2, {
  set() {
    console.log(Reflect.set(...arguments)) // false，操作失败
    return undefined
  },
})
proxy4.foo = 'bar'
console.log(proxy4.foo) // 'baz'
console.log(myTarget2.foo) // 'baz'

/* 9.2.3 has() */
const myTarget3 = { foo: 'bar' }
const proxy5 = new Proxy(myTarget3, {
  has(target, property) {
    console.log(target) // { foo: 'bar' }，目标对象
    console.log(property) // 'foo'，目标对象键属性
    console.log(Reflect.set(...arguments)) // true，属性存在
    return Reflect.set(...arguments)
  },
})
'foo' in proxy5 // 拦截的操作

// 捕获器不变式
Object.defineProperty(myTarget3, 'foo', {
  configurable: false, // 不可配置
})
const proxy6 = new Proxy(myTarget3, {
  has() {
    return false // 试图返回false
  },
})
// 'foo' in proxy6 // TypeError

/* 9.2.4 defineProperty() */
const myTarget4 = {}
const proxy7 = new Proxy(myTarget4, {
  defineProperty(target, property, descriptor) {
    console.log(target) // {}，目标对象
    console.log(property) // 'foo'，目标对象键属性
    console.log(descriptor) // { value: 'bar' }，描述符对象
    console.log(Reflect.defineProperty(...arguments)) // true，属性定义成功
    return Reflect.defineProperty(...arguments)
  },
})
Object.defineProperty(proxy7, 'foo', { value: 'bar' }) // 拦截的操作
console.log(proxy7.foo) // 'bar'
console.log(myTarget4.foo) // 'bar'

// 捕获器不变式
Object.defineProperty(myTarget4, 'fox', {
  value: 'baz',
  configurable: false, // 不可配置
})
const proxy8 = new Proxy(myTarget4, {
  defineProperty() {
    return true
  },
})
// Object.defineProperty(proxy8, 'fox', {
//   value: 'qux',
//   configurable: true,
//   writable: true,
// }) // TypeError

/* 9.2.5 getOwnPropertyDescriptor() */
const myTarget5 = { foo: 'bar' }
const proxy9 = new Proxy(myTarget5, {
  getOwnPropertyDescriptor(target, property) {
    console.log(target) // { foo: 'bar' }，目标对象
    console.log(property) // 'foo'，目标对象键属性
    console.log(Reflect.getOwnPropertyDescriptor(...arguments)) // { value: 'bar', writable: true, enumerable: true, configurable: true }，属性的描述符对象
    return Reflect.getOwnPropertyDescriptor(...arguments)
  },
})
Object.getOwnPropertyDescriptor(proxy9, 'foo') // 拦截的操作

// 捕获器不变式
Object.defineProperty(myTarget5, 'fox', {
  value: 'baz', // 目标对象的属性存在
  configurable: false, // 不可配置
})
const proxy10 = new Proxy(myTarget5, {
  getOwnPropertyDescriptor() {
    // return undefined // TypeError，必须返回一个表示该属性存在的对象
    return {
      value: 'baz',
      writable: false,
      enumerable: false,
      configurable: false,
    }
  },
})
Object.getOwnPropertyDescriptor(proxy10, 'fox')

/* 9.2.6 deleteProperty() */
const myTarget6 = { foo: 'bar' }
const proxy11 = new Proxy(myTarget6, {
  deleteProperty(target, property) {
    console.log(target) // { foo: 'bar' }，目标对象
    console.log(property) // 'foo'，目标对象键属性
    console.log(Reflect.deleteProperty(...arguments)) // true，删除属性成功
    return Reflect.deleteProperty(...arguments)
  },
})
delete proxy11.foo // 拦截的操作
console.log(proxy11.foo) // undefined
console.log(myTarget6.foo) // undefined

// 捕获器不变式
Object.defineProperty(myTarget6, 'fox', {
  value: 'baz', // 目标对象的属性存在
  configurable: false, // 不可配置
})
const proxy12 = new Proxy(myTarget6, {
  deleteProperty() {
    console.log(Reflect.deleteProperty(...arguments)) // false，删除属性失败
    return Reflect.deleteProperty(...arguments)
  },
})
delete proxy12.fox
console.log(proxy12.fox) // 'baz'
console.log(myTarget6.fox) // 'baz'

/* 9.2.7 ownKeys() */
const myTarget7 = { foo: 'bar' }
const proxy13 = new Proxy(myTarget7, {
  ownKeys(target) {
    console.log(target) // { foo: 'bar' }，目标对象
    console.log(Reflect.ownKeys(...arguments)) // [ 'foo' ]，可枚举键的数组
    return Reflect.ownKeys(...arguments)
  },
})
Object.keys(proxy13) // 拦截的操作

// 捕获器不变式
Object.defineProperty(myTarget7, 'fox', {
  value: 'baz',
  configurable: false, // 不可配置
})
const proxy14 = new Proxy(myTarget7, {
  ownKeys() {
    // return [] // TypeError: 'ownKeys' on proxy: trap result did not include 'fox'，必须包含目标对象所有不可配置的自有属性
    return ['fox', 'qux'] // 必须包含fox键
  },
})
Object.keys(proxy14)

/* 9.2.8 getPrototypeOf() */
const myTarget8 = new Array(1, 2, 3)
const proxy15 = new Proxy(myTarget8, {
  getPrototypeOf(target) {
    console.log(target) // [ 1, 2, 3 ]，目标对象
    console.log(Reflect.getPrototypeOf(...arguments)) // Array的原型对象，可在浏览器中查看
    return Reflect.getPrototypeOf(...arguments)
  },
})
Object.getPrototypeOf(proxy15) // 拦截的操作

// 捕获器不变式
Object.preventExtensions(myTarget8) // 不可扩展
const proxy16 = new Proxy(myTarget8, {
  getPrototypeOf(target) {
    // return [] // TypeError，唯一有效的返回值是Object.getPrototypeOf(target)的返回值
    return Object.getPrototypeOf(target) // 有效
  },
})
Object.getPrototypeOf(proxy16)

/* 9.2.9 setPrototypeOf() */
const myTarget9 = {}
const targetPrototype = { foo: 'bar' }
const proxy17 = new Proxy(myTarget9, {
  setPrototypeOf(target, prototype) {
    console.log(target) //{}，目标对象
    console.log(targetPrototype) // { foo: 'bar' }，target的替代原型
    console.log(Reflect.setPrototypeOf(...arguments)) // true，原型赋值成功
    return Reflect.setPrototypeOf(...arguments)
  },
})
Object.setPrototypeOf(proxy17, targetPrototype)
console.log(proxy17) // {}
console.log(proxy17.__proto__ === targetPrototype) // true
console.log(proxy17.foo) // 'bar'
console.log(myTarget9.foo) // 'bar'

// 捕获器不变式
Object.preventExtensions(myTarget9) // 不可扩展
const proxy18 = new Proxy(myTarget9, {
  setPrototypeOf() {
    return Reflect.setPrototypeOf(...arguments)
  },
})
// Object.setPrototypeOf(proxy18, targetPrototype) // TypeError，唯一有效的prototype参数是Object.getPrototypeOf(target)的返回值
Object.setPrototypeOf(proxy18, Object.getPrototypeOf(myTarget9)) // 有效
console.log(proxy18.__proto__ === Object.getPrototypeOf(myTarget9)) // true

/* 9.2.10 isExtensible() */
const myTarget10 = {}
const proxy19 = new Proxy(myTarget10, {
  isExtensible(target) {
    console.log(target) // {}，目标对象
    console.log(Reflect.isExtensible(...arguments)) // true，target可扩展
    return Reflect.isExtensible(...arguments)
  },
})
Object.isExtensible(proxy19) // 拦截的操作

// 捕获器不变式
Object.preventExtensions(myTarget10) // 不可扩展
const proxy20 = new Proxy(myTarget10, {
  isExtensible() {
    // return true // TypeError，不可扩展必须返回false
    console.log(Reflect.isExtensible(...arguments)) // false，target不可扩展
    return false
  },
})
Object.isExtensible(proxy20)

/* 9.2.11 preventExtensions() */
const myTarget11 = {}
const proxy21 = new Proxy(myTarget11, {
  preventExtensions(target) {
    console.log(target) // {}，目标对象
    console.log(Reflect.preventExtensions(...arguments)) // true，target已经不可扩展
    return Reflect.preventExtensions(...arguments)
  },
})
Object.preventExtensions(proxy21) // 拦截的操作

// 捕获器不变式
Object.preventExtensions(myTarget11) // 不可扩展
console.log(Object.isExtensible(myTarget11)) // false，目标对象已经不可扩展
const proxy22 = new Proxy(myTarget11, {
  preventExtensions() {
    // return false // TypeError，处理程序此时必须返回true
    return true
  },
})
Object.preventExtensions(proxy22)

/* 9.2.12 apply() */
const myTarget12 = () => {}
const targetApply = { foo: 'bar' }
const proxy23 = new Proxy(myTarget12, {
  apply(target, thisArg, argumentsList) {
    console.log(target) // [Function: myTarget12]，目标对象
    console.log(thisArg) // { foo: 'bar' }，调用函数时的 this 参数
    console.log(argumentsList) // [ 1, 2, 3 ]，调用函数时的参数列表
    return Reflect.apply(...arguments)
  },
})
Reflect.apply(proxy23, targetApply, [1, 2, 3]) // 拦截的操作

// 捕获器不变式
const proxy24 = new Proxy(targetApply, {
  apply() {
    return Reflect.apply(...arguments)
  },
})
// proxy24() // TypeError: proxy24 is not a function，target必须是函数对象

/* 9.2.13 construct() */
const MyTarget13 = function () {}
const proxy25 = new Proxy(MyTarget13, {
  construct(target, argumentsList, newTarget) {
    console.log(target) // [Function: MyTarget13]，目标构造函数
    console.log(argumentsList) // [ 123 ]，传给目标构造函数的参数列表
    console.log(newTarget) // [Function: MyTarget13]，最初被调用的构造函数
    return Reflect.construct(...arguments)
  },
})
new proxy25(123) // 拦截的操作

const MyTarget14 = () => {} // 箭头函数，不能用作构造函数
const proxy26 = new Proxy(MyTarget14, {
  construct() {
    return Reflect.construct(...arguments)
  },
})
// new proxy26() // TypeError: proxy26 is not a constructor，target必须可以用作构造函数
