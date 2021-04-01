/* 基本 API */

// new关键字 和 WeakSet构造函数
const ws = new WeakSet()
console.log(ws) // WeakSet {}

const val1 = { id: 1 },
  val2 = { id: 2 },
  val3 = { id: 3 }

const ws1 = new WeakSet([val1, val2, val3])
console.log(ws1.has(val1)) // true
console.log(ws1.has(val2)) // true
console.log(ws1.has(val3)) // true

// const ws2 = new WeakSet([val1, val2, val3, 'val4']) // TypeError: Invalid value used in weak set

// 原始值包装成对象作为值
const val4 = new String('val4')
const ws3 = new WeakSet([val1, val2, val3, val4])
console.log(ws3.has(val4)) // true

// add()、has()、delete()
const ws4 = new WeakSet()
console.log(ws4.size) // undefined，WeakSet不自带size属性

const val5 = { id: 1 },
  val6 = { id: 2 }

ws4.add(val5).add(val6)
console.log(ws4.has(val5)) // true
console.log(ws4.has(val6)) // true

ws4.delete(val5) // 删除这个元素
console.log(ws4.has(val5)) // false
console.log(ws4.has(val6)) // true

// ws4.clear() // TypeError: ws4.clear is not a function，WeakSet没有clear方法

const ws5 = new WeakSet().add(val5)
console.log(ws5) // WeakSet { { id: 1 } }

/* 弱值 */

const ws6 = new WeakSet()
ws6.add({}) // 初始化一个新对象作为值，没有指向这个对象的其他引用，代码执行后值会被当作垃圾回收

const ws7 = new WeakSet()
const container = { val: {} } // container对象维护着ws7中值的引用
ws7.add(container.val) // 值不会成为垃圾回收的目标
container.val = null // 切断值对象的引用，值才会被垃圾回收

/* 使用弱集合 */

// 给对象打标签
const disabledElements = new Set()
const loginButton = document.querySelector('#login')
disabledElements.add(loginButton) // 给节点打上“禁用”标签，保存在集合中，即使DOM被删除集合仍然存在

const disabledElements2 = new WeakMap()
const loginButtin2 = document.querySelector('#login')
disabledElements2.add(loginButton2) // 给节点打上“禁用”标签，保存在弱集合中，DOM被删除（若没有其他地方引用loginButton2）弱集合被回收
