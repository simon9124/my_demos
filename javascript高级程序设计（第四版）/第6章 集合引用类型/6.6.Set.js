/* 基本API */

// new关键字 和 Set构造函数
const s = new Set()
console.log(s) // Set(0) {}

// 使用数组初始化集合
const s1 = new Set(['val1', 'val2', 'val3'])
console.log(s1) // Set(3) { 'val1', 'val2', 'val3' }

// 自定义迭代器初始化集合
const s2 = new Set({
  [Symbol.iterator]: function* () {
    yield 'val1'
    yield 'val2'
    yield 'val3'
  },
})
console.log(s2) // Set(3) { 'val1', 'val2', 'val3' }

// add()、has()、size、delete()、clear()
const s3 = new Set()
console.log(s3.size) // 0

s3.add('Matt').add('Frisbie')
console.log(s3.has('Matt')) // true
console.log(s3.size) // 2

s3.delete('Matt') // 删除这个值
console.log(s3.has('Matt')) // false
console.log(s3.has('Frisbie')) // true
console.log(s3.size) // 1

s3.clear() // 清除所有值
console.log(s3.has('Matt')) // false
console.log(s3.has('Frisbie')) // false
console.log(s3.size) // 0

const s4 = new Set().add('val1').add('val2')
console.log(s4) // Set(2) { 'val1', 'val2' }

// 使用任何数据类型作为元素
const s5 = new Set()

const functionVal = function () {}
const symbolVal = Symbol()
const objectVal = new Object()

s5.add(functionVal).add(symbolVal).add(objectVal)
console.log(s5) // Set(3) { [Function: functionVal], Symbol(), {} }

console.log(s5.has(functionVal)) // true
console.log(s5.has(symbolVal)) // true
console.log(s5.has(objectVal)) // true

// 元素是对象或其他“集合”类型
const s6 = new Set()

const objVal = {},
  arrVal = []

s6.add(objVal).add(arrVal)
console.log(s6) // Set(2) { {}, [] }

objVal.bar = 'bar'
arrVal.push('bar')
console.log(s6) // Set(2) { { bar: 'bar' }, [ 'bar' ] }
console.log(s6.has(objVal)) // true
console.log(s6.has(arrVal)) // true

// delete()
const s7 = new Set()
s7.add('foo').add('bar')
console.log(s7.delete('foo')) // true
console.log(s7.delete('bar')) // true
console.log(s7) // Set(0) {}

/* 顺序与迭代 */

// 迭代器
const s8 = new Set(['val1', 'val2', 'val3'])
console.log(s8.values === s8[Symbol.iterator]) // true
console.log(s8.keys === s8[Symbol.iterator]) // true

for (let value of s8.values()) {
  console.log(value)
  /* 
    val1
    val2
    val3
  */
}
for (let value of s8[Symbol.iterator]()) {
  console.log(value)
  /* 
    val1
    val2
    val3
  */
}

// 扩展操作
console.log([...s8]) // [ 'val1', 'val2', 'val3' ]
console.log(...s8) // 'val1', 'val2', 'val3'

// 回调方式
s8.forEach((val, dupVal) => {
  console.log(`${val}->${dupVal}`)
  /* 
    val1->val1
    val2->val2
    val3->val3
  */
})

// 遍历时修改键或值
const s9 = new Set(['val1', 'val2']) // 字符串原始值作为元素

for (let value of s9.values()) {
  value = 'newVal' // 修改元素
  console.log(value) // 'newVal'
  console.log(s9.has('newVal')) // false，集合内部的引用无法修改
  console.log(s9.has('val1')) // true
}
console.log(s9) // Set(2) { 'val1', 'val2' }，集合不受影响

const valObj = { id: 1 }
const s10 = new Set([valObj]) // 引用值作为元素

for (let value of s10.values()) {
  value.id = 2 // 修改元素的属性
  console.log(value) // { id: 2 }
  console.log(s10.has(valObj)) // true，集合内部的引用未改变，对象在集合内部仍然引用相同的值
}
console.log(s10) // Set(1) { { id: 2 } }，集合受影响

for (let value of s10.values()) {
  value = { id: 3 } // 重写元素
  console.log(value) // { id: 3 }
  console.log(s10.has(valObj)) // true
}
console.log(s10) // Set(1) { { id: 2 } }，集合不受影响

/* 定义正式集合操作 */
