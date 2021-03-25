/* 基本 API */

// new关键字 和 WeakMap构造函数
const wm = new WeakMap()
console.log(wm) // WeakMap {}

const key1 = { id: 1 },
  key2 = { id: 2 },
  key3 = { id: 3 }

const wm1 = new WeakMap([
  [key1, 'val1'],
  [key2, 'val2'],
  [key3, 'val3'],
])
console.log(wm1.get(key1)) // 'val1'
console.log(wm1.get(key2)) // 'val2'
console.log(wm1.get(key3)) // 'val3'

const wm2 = new WeakMap([
  [key1, 'val1'],
  [key2, 'val2'],
  [key3, 'val3'],
  // ['key4', 'val4'], // TypeError: Invalid value used as weak map key
])

// 原始值包装成对象作为键
const key4 = new String('key4')
const wm3 = new WeakMap([
  [key1, 'val1'],
  [key2, 'val2'],
  [key3, 'val3'],
  [key4, 'val4'],
])
console.log(wm3.get(key4)) // 'val4'

// set()、get()、has()、delete()
const wm4 = new WeakMap()
console.log(wm4.size) // undefined，WeakMap不自带size属性

const key5 = { id: 1 },
  key6 = { id: 2 }

wm4.set(key5, 'Matt').set(key6, 'Frisbie')
console.log(wm4.has(key5)) // true
console.log(wm4.get(key5)) // 'Matt'

wm4.delete(key5) // 删除这个键值对
console.log(wm4.has(key5)) // false
console.log(wm4.get(key5)) // undefined
console.log(wm4.has(key6)) // true

// wm4.clear() // TypeError: wm4.clear is not a function，WeakMap没有clear方法

const wm5 = new WeakMap().set(key5, 'Matt')
console.log(wm5) // WeakMap { { id: 1 } => 'Matt' }

/* 弱键 */

const wm6 = new WeakMap()
wm6.set({}, 'val') // 初始化一个新对象作为建，没有指向这个对象的其他引用，代码执行后键和值均会被当作垃圾回收

const wm7 = new WeakMap()
const container = { key: {} } // container对象维护着wm7中键的引用
wm7.set(container.key, 'val') // 键和值均不会成为垃圾回收的目标
container.key = null // 切断键对象的引用，键和值才会被垃圾回收

/* 使用弱映射 */

// 私有变量
const wm8 = new WeakMap()

class User {
  constructor(id) {
    this.idProperty = Symbol('id') // 创建符号
    this.setId(id)
  }
  setId(id) {
    this.setPrivate(this.idProperty, id)
  }
  setPrivate(property, value) {
    const privateMembers = wm8.get(this) || {}
    privateMembers[property] = value // { idProperty: Symbol(id): id }
    wm8.set(this, privateMembers)
  }
  getId() {
    return this.getPrivate(this.idProperty)
  }
  getPrivate(property) {
    return wm8.get(this)[property] // 获取到id
  }
}
const user = new User(123)
console.log(user) // User { idProperty: Symbol(id) }
console.log(wm8) // WeakMap { User => { idProperty: Symbol(id) } }
console.log(user.getId()) // 123

user.setId(456)
console.log(user.getId()) // 456

console.log(wm8.get(user)) // { [Symbol(id)]: 456 }
console.log(wm8.get(user)[user.idProperty]) // 456，外部变量拿到对象实例的引用和弱映射，取得私有变量

const UserClosure = (() => {
  // 用闭包把WeakMap包起来
  const wm9 = new WeakMap()

  class User {
    constructor(id) {
      this.idProperty = Symbol('id') // 创建符号
      this.setId(id)
    }
    setId(id) {
      this.setPrivate(this.idProperty, id)
    }
    setPrivate(property, value) {
      const privateMembers = wm9.get(this) || {}
      privateMembers[property] = value // { idProperty: Symbol(id): id }
      wm9.set(this, privateMembers)
    }
    getId() {
      return this.getPrivate(this.idProperty)
    }
    getPrivate(property) {
      return wm9.get(this)[property] // 获取到id
    }
  }
  return User
})()
const user2 = new UserClosure(123)
console.log(user2) // User { idProperty: Symbol(id) }
console.log(user2.getId()) // 123

user2.setId(456)
console.log(user2.getId()) // 456

// console.log(wm9) // ReferenceError: wm9 is not defined，拿不到弱映射，无法获取弱映射中对应的值，成功设置私有变量

// DOM 节点元数据
const m = new Map()
const loginButton = document.querySelector('#login')
m.set(loginButton, { disabled: true }) // 给节点关联元数据，保存在映射中，即使DOM被删除映射仍然存在

const wm10 = new WeakMap()
const loginButtin2 = document.querySelector('#login')
wm10.set(loginButton, { disabled: true }) // 给节点关联元数据，保存在弱映射中，DOM被删除（若没有其他地方引用loginButton）弱映射被回收
