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

/* 不可迭代键 */

/* 使用弱映射 */

// 私有变量

// DOM 节点元数据
