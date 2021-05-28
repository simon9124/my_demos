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

// 参数审查
function median(...nums) {
  return nums.sort()[Math.floor(nums.length / 2)]
}
const proxy4 = new Proxy(median, {
  apply(target, thisArg, argumentsList) {
    for (const arg of argumentsList) {
      if (typeof arg !== 'number') {
        // 只接收Number类型
        throw 'Non-number argument provided'
      }
    }
    return Reflect.apply(...arguments)
  },
})
console.log(proxy4(4, 7, 1)) // 4
// console.log(proxy4(4, 7, '1')) // Error: Non-number argument provided

// 必须传参
class User {
  constructor(id) {
    this._id = id
  }
}
const proxy5 = new Proxy(User, {
  construct(target, argumentsList, newTarget) {
    if (argumentsList[0] === undefined) {
      // 必须传参
      throw 'User cannot be instantiated without id'
    }
    return Reflect.construct(...arguments)
  },
})
new proxy5(1)
// new proxy5() // Error: 'User cannot be instantiated without id'

/* 9.3.5 数据绑定与可观察对象 */

// 将创建的实例添加到全局集合
const userList = []
class User2 {
  constructor(name) {
    this._name = name
  }
}
const proxy6 = new Proxy(User2, {
  construct() {
    const newUser = Reflect.construct(...arguments)
    userList.push(newUser) // 将实例添加到全局集合
    return newUser
  },
})
new proxy6('John')
new proxy6('Jacob')
new proxy6('Jake')
console.log(userList) // [ User2 { _name: 'John' }, User2 { _name: 'Jacob' }, User2 { _name: 'Jake' } ]

// 每次插入新实例发送消息
const eventList = []
function emit(newValue) {
  // console.log(newValue)
}
const proxy7 = new Proxy(eventList, {
  set(target, property, value, receiver) {
    console.log(target, property, value, receiver)
    const result = Reflect.set(...arguments)
    // result && emit(value)
    if (result) {
      emit(Reflect.get(target, property, receiver))
    }
    return result
  },
})
proxy7.push('John')
// proxy7.push('Jacob')
