/* 9.3 代理模式 */

/* 9.3.1 跟踪属性访问 */
const user = {
  name: 'Jake',
}
const proxy = new Proxy(user, {
  get(target, property, receiver) {
    console.log(`Getting ${property}`)
    return Reflect.get(...arguments)
  },
  set(target, property, value, receiver) {
    console.log(`Setting ${property}=${value}`)
    return Reflect.set(...arguments)
  },
})
proxy.name // 'Getting name'，触发get()拦截
proxy.age = 27 // 'Setting age=27'，触发set()拦截

/* 9.3.2 隐藏属性 */
const hiddenProperties = ['foo', 'bar'] // 要隐藏的键
const targetObject = {
  // 目标对象
  foo: 1,
  bar: 2,
  baz: 3,
}
const proxy2 = new Proxy(targetObject, {
  get(target, property) {
    if (hiddenProperties.includes(property)) {
      return undefined // 隐藏属性
    } else {
      return Reflect.get(...arguments)
    }
  },
  has(target, property) {
    if (hiddenProperties.includes(property)) {
      return undefined // 隐藏属性
    } else {
      return Reflect.get(...arguments)
    }
  },
})

// get()拦截
console.log(proxy2.foo) // undefined，在代理内部被隐藏
console.log(proxy2.bar) // undefined，在代理内部被隐藏
console.log(proxy2.baz) // 3

// has()拦截
console.log('foo' in proxy2) // false，在代理内部被隐藏
console.log('bar' in proxy2) // false，在代理内部被隐藏
console.log('baz' in proxy2) // true

/* 9.3.3 属性验证 */
const target = {
  onlyNumberGoHere: 0,
}
const proxy3 = new Proxy(target, {
  set(target, property, value) {
    if (typeof value !== 'number') {
      return false
    } else {
      return Reflect.set(...arguments)
    }
  },
})
proxy3.onlyNumberGoHere = 1 // 拦截操作，所赋的值为Number类型
console.log(proxy3.onlyNumberGoHere) // 1，赋值成功
proxy3.onlyNumberGoHere = '2' // 拦截操作，所赋的值为String类型
console.log(proxy3.onlyNumberGoHere) // 1，赋值失败

/* 9.3.4 函数与构造函数参数验证 */
/* 9.3.5 数据绑定与可观察对象 */
