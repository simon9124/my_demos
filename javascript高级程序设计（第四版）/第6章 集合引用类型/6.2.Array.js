/* 创建数组 */

// new Array()
let colors = new Array()
console.log(colors) // []

colors = new Array(10)
console.log(colors) // [ <10 empty items> ]

colors = new Array('red', 'blue')
console.log(colors) // [ 'red', 'blue' ]

colors = new Array(true)
console.log(colors) // [ true ]

colors = Array(5)
console.log(colors) // [ <5 empty items> ]

// 数组字面量表示法
colors = ['red', 'blue', 3]
colors = []

// Array.from()
console.log(Array.from('Matt')) // [ 'M', 'a', 't', 't' ]，字符串被拆分为单字符数组

console.log(Array.from(new Map().set(1, 2).set(3, 4))) // [ [ 1, 2 ], [ 3, 4 ] ]，集合和映射转换为数组
console.log(Array.from(new Set().add(1).add(2).add(3).add(4))) // [ 1, 2, 3, 4 ]，集合和映射转换为数组

const a1 = [1, 2, 3, 4]
const a2 = Array.from(a1) // 浅拷贝，a2与a1引用不同的基对象
console.log(a2) // [ 1, 2, 3, 4 ]
console.log(a1 === a2) // false
const a3 = a1 // a3与a1引用同一个基对象
console.log(a1 === a3) // true

const iter = {
  *[Symbol.iterator]() {
    yield 1
    yield 2
    yield 3
    yield 4
  },
}
console.log(Array.from(iter)) // [ 1, 2, 3, 4 ]，可迭代对象转换为数组

function getColors() {
  console.log(Array.prototype.slice.call(arguments)) // [ 'red', 'blue' ]，将argumens对象转换为数组
  console.log(Array.from(arguments)) // [ 'red', 'blue' ]，将argumens对象转换为数组
}
getColors('red', 'blue')

const arrayLikeObject = {
  0: 1,
  1: 2,
  2: 3,
  3: 4,
  length: 4,
}
console.log(Array.from(arrayLikeObject)) // [ 1, 2, 3, 4 ]，带有必要属性的自定义对象转换为数组

const a4 = Array.from(
  a1,
  (x) => x + 2 // 第二个可选参数：映射函数，增强数组
) // 增强新数组a4的值
console.log(a4) // [ 3, 4, 5, 6 ]

const a5 = Array.from(
  a1,
  function (x) {
    console.log(this) // { exponent: 2 }，第三个参数中指定this的值，此时不可用箭头函数
    return x ** this.exponent
  },
  { exponent: 2 } // 第三个可选参数：指定映射函数中this的值
)
console.log(a5) // [ 1, 4, 9, 16 ]

const a6 = Array.from(a1, (x) => x ** this.exponent, { exponent: 2 }) // 如用箭头函数
console.log(a6) // [ NaN, NaN, NaN, NaN ]
const a7 = Array.from(a1, (x) => this, { exponent: 2 }) // 因为用箭头函数，this的值是空对象
console.log(a7) // [ {}, {}, {}, {} ]

// Array.of()
console.log(Array.of(1, 2, 3, 4)) // [ 1, 2, 3, 4 ]，将参数转换为数组
console.log(Array.of(undefined, null)) // [ undefined, null ]，将参数转换为数组

/* 数组空位 */

/* 数组索引 */

/* 检测数组 */

/* 迭代器方法 */

/* 复制和填充方法 */

/* 转换方法 */

/* 栈方法 */

/* 队列方法 */

/* 排序方法 */

/* 操作方法 */

/* 搜索和位置方法 */

/* 迭代方法 */

/* 归并方法 */
