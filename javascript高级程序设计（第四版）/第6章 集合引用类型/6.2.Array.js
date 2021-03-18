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
let options = [, , , , ,] // 创建包含5个元素的数组
console.log(options.length) // 5
console.log(options) // [ <5 empty items> ]

options = [1, , , , 5]
console.log(options) // [ 1, <3 empty items>, 5 ]
for (const option of options) {
  console.log(option === undefined)
  /*
    false
    true
    true
    true
    false
  */
}
for (const [index, value] of options.entries()) {
  console.log(value)
  /*
    1
    undefined
    undefined
    undefined
    5
  */
}

console.log([, , ,]) // [ <3 empty items> ]
console.log(Array.from([, , ,])) // [ undefined, undefined, undefined ]
console.log(Array.of(...[, , ,])) // [(undefined, undefined, undefined)]

console.log(options.map(() => 6)) // [ 6, <3 empty items>, 6 ]，map会跳过空位置
console.log(options.join('-')) // '1----5'，join视空位置为空字符串

/* 数组索引 */
colors = ['red', 'blue', 'green']
console.log(colors[0]) // 'red'，数组第1项
colors[2] = 'black' // 设置数组第3项，重设数组原有的值
console.log(colors) // [ 'red', 'blue', 'black' ]
colors[3] = 'brown' // 设置数组第4项，扩展数组
console.log(colors) // [ 'red', 'blue', 'black', 'brown' ]

console.log(colors.length) // 4，数组的长度是4

colors.length = 3 // 将数组的长度设置为3，自动删除末尾'brown'
console.log(colors[3]) // undefined
colors.length = 5 // 将数组长度设置为5，新添加的元素以undefined填充
console.log(colors[5]) // undefined

colors = ['red', 'blue', 'green']
colors[colors.length] = 'black' // 向数组末尾添加'black'
colors[colors.length] = 'brown' // 向数组末尾添加'brown'
console.log(colors) // [ 'red', 'blue', 'green', 'black', 'brown' ]

/* 迭代器方法 */

colors = ['red', 'blue', 'green']
console.log(Array.from(colors.keys())) // [ 0, 1, 2 ]
console.log(Array.from(colors.values())) // [ 'red', 'blue', 'green' ]
console.log(Array.from(colors.entries())) // [ [ 0, 'red' ], [ 1, 'blue' ], [ 2, 'green' ] ]

for (const [i, el] of colors.entries()) {
  console.log(i)
  console.log(el)
  /* 
    0
    red
    1
    blue
    2
    green
  */
}

/* 复制和填充方法 */

// fill()
let zeros = [0, 0, 0, 0, 0]

zeros.fill(5) // 用5填充整个数组，省略了开始索引和结束索引
console.log(zeros) // [ 5, 5, 5, 5, 5 ]
zeros.fill(0) // 重置

zeros.fill(6, 3) // 用6填充索引大于等于3的元素，省略了结束索引
console.log(zeros) // [ 0, 0, 0, 6, 6 ]
zeros.fill(0) // 重置

zeros.fill(7, 1, 3) // 用7填充索引值大于等于1且小于3的元素
console.log(zeros) // [ 0, 7, 7, 0, 0 ]
zeros.fill(0) // 重置

zeros.fill(8, -4, 3) // 相当于zeros.fill(8, 5-4, 3)，用8填充索引值大于等于1且小于3的元素
console.log(zeros) // [ 0, 8, 8, 0, 0 ]
zeros.fill(0) // 重置

zeros.fill(1, -10, -6) // 相当于zeros.fill(1, 5-10, 5-6)，超出数组边界，忽略
console.log(zeros) // [ 0, 0, 0, 0, 0 ]
zeros.fill(0) // 重置

zeros.fill(1, 10, 15) // 超出数组边界，忽略
console.log(zeros) // [ 0, 0, 0, 0, 0 ]
zeros.fill(0) // 重置

zeros.fill(2, 4, 2) // 索引反向，忽略
console.log(zeros) // [ 0, 0, 0, 0, 0 ]
zeros.fill(0) // 重置

zeros.fill(4, 3, 10) // 索引部分可用，填充可用部分
console.log(zeros) // [ 0, 0, 0, 4, 4 ]
zeros.fill(0) // 重置

// coppWithin()
zeros = [1, 2, 3, 4, 5]

zeros.copyWithin(2) // 浅复制整个数组，从索引为2开始替换（直到数组边界），省略了开始索引和结束索引
console.log(zeros) // [ 1, 2, 1, 2, 3 ]
zeros = [1, 2, 3, 4, 5] // 重置

zeros.copyWithin(4, 3) // 浅复制索引大于等于3到数组结束的元素，从索引为4开始替换（直到数组边界），省略了结束索引
console.log(zeros) // [ 1, 2, 3, 4, 4 ]
zeros = [1, 2, 3, 4, 5] // 重置

zeros.copyWithin(3, 1, 3) // 浅复制索引大于等于1且小于3的元素，从索引为3开始替换（直到数组边界）
console.log(zeros) // [ 1, 2, 3, 2, 3 ]
zeros = [1, 2, 3, 4, 5] // 重置

zeros.copyWithin(2, -4, -1) // 相当于zeros.copyWithin(2, 5-4, 5-1)，浅复制索引大于等于1且小于4的元素，从索引为2开始替换（直到数组边界）
console.log(zeros) // [ 1, 2, 2, 3, 4 ]
zeros = [1, 2, 3, 4, 5] // 重置

zeros.copyWithin(2, -15, -12) // 相当于zeros.copyWithin(2, 5-15, 5-12)，超出数组边界，忽略
console.log(zeros) // [ 1, 2, 3, 4, 5 ]
zeros = [1, 2, 3, 4, 5] // 重置

zeros.copyWithin(2, 12, 15) // 超出数组边界，忽略
console.log(zeros) // [ 1, 2, 3, 4, 5 ]
zeros = [1, 2, 3, 4, 5] // 重置

zeros.copyWithin(2, 3, 1) // 索引反向，忽略
console.log(zeros) // [ 1, 2, 3, 4, 5 ]
zeros = [1, 2, 3, 4, 5] // 重置

zeros.copyWithin(2, 3, 6) // 索引部分可用，填充可用部分
console.log(zeros) // [ 1, 2, 4, 5, 5 ]
zeros = [1, 2, 3, 4, 5] // 重置

/* 转换方法 */
colors = ['red', 'blue', 'green']
console.log(colors) // [ 'red', 'blue', 'green' ]
console.log(colors.valueOf()) // [ 'red', 'blue', 'green' ]
console.log(colors.toString()) // red,blue,green
console.log(colors.toLocaleString()) // red,blue,green

// toLocaleString() vs toString()
let person1 = {
  toLocaleString() {
    return 'Nikalaos'
  },
  toString() {
    return 'Nicholas'
  },
}
let person2 = {
  toLocaleString() {
    return 'Grigorios'
  },
  toString() {
    return 'Greg'
  },
}
let people = [person1, person2]
console.log(people.toString()) // Nicholas,Greg
console.log(people.toLocaleString()) // Nikalaos,Grigorios

// join()
console.log(colors.join()) // red,blue,green，默认用逗号拼接
console.log(colors.join(undefined)) // red,blue,green，默认用逗号拼接
console.log(colors.join('|')) // red|blue|green
console.log([undefined, 1, 2].join()) // ,1,2

/* 栈方法 */

// push()
colors = new Array()
console.log(colors.push('red', 'blue')) //2，返回数组的长度

// pop()
console.log(colors.pop()) // 'blue'，返回被删除的项

/* 队列方法 */

// shift()
colors = new Array()
colors.push('red', 'blue')
console.log(colors.shift()) // 'red'，返回被删除的项

// unshift()
console.log(colors.unshift('green', 'black')) // 3，返回数组的长度
console.log(colors) // [ 'green', 'black', 'blue' ]

/* 排序方法 */

// reverse()
let values = [1, 2, 3, 4, 5]
values.reverse()
console.log(values) // [ 5, 4, 3, 2, 1 ]

// sort()
values = [10, 15, 0, 5, 1]
values.sort()
console.log(values) // [ 0, 1, 10, 15, 5 ]，比较字符串大小而不是数字大小

// 比较函数
function compareAsc(val1, val2) {
  if (val1 < val2) {
    return -1
  } else if (val1 > val2) {
    return 1
  } else {
    return 0
  }
}
values = [10, 15, 0, 5, 1]
values.sort(compareAsc) // 接收参数：正序比较函数
console.log(values) // [ 0, 1, 5, 10, 15 ]

function compareDesc(val1, val2) {
  if (val1 < val2) {
    return 1 // 降序
  } else if (val1 > val2) {
    return -1 // 降序
  } else {
    return 0
  }
}
values.sort(compareDesc) // 接收参数：降序比较函数
console.log(values) // [ 15, 10, 5, 1, 0 ]

values.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)) // 升序
console.log(values) // [ 0, 1, 5, 10, 15 ]

values.sort((a, b) => a - b) // 升序
console.log(values) // [ 0, 1, 5, 10, 15 ]
values.sort((a, b) => b - a) // 降序
console.log(values) // [ 15, 10, 5, 1, 0 ]

/* 操作方法 */

// concat()
colors = ['red', 'green', 'blue']
let colors2 = colors.concat('yellow', ['black', 'brown'])
console.log(colors) // [ 'red', 'green', 'blue' ]，不改变原数组
console.log(colors2) // [ 'red', 'green', 'blue', 'yellow', 'black', 'brown' ]
let colors3 = colors.concat('yellow', ['black', 'brown', ['orange']]) // [ 'red', 'green', 'blue', 'yellow', 'black', 'brown', [ 'orange' ] ]
console.log(colors3)

// Symbol.isConcatSpreadable
let newColors = ['black', 'brown'] // 数组
let moreNewColors = {
  // 类数组对象
  0: 'pink',
  1: 'cyan',
  length: 2,
}
console.log(colors.concat(newColors)) // [ 'red', 'green', 'blue', 'black', 'brown' ]，数组默认打平
console.log(colors.concat(moreNewColors)) // [ 'red', 'green', 'blue', { '0': 'pink', '1': 'cyan' } ]，类数组对象默认不打平

newColors[Symbol.isConcatSpreadable] = false // 阻止打平数组
moreNewColors[Symbol.isConcatSpreadable] = true // 强制打平类数组对象

console.log(colors.concat(newColors)) // [ 'red', 'green', 'blue',[ 'black', 'brown', [Symbol(Symbol.isConcatSpreadable)]: false] ]
console.log(colors.concat(moreNewColors)) // [ 'red', 'green', 'blue', 'pink', 'cyan' ]

// slice()
colors = ['red', 'green', 'blue', 'black', 'brown']
console.log(colors.slice(1)) // [ 'green', 'blue', 'black', 'brown' ]，索引大于等于1到末尾的元素
console.log(colors.slice(1, 4)) // [ 'green', 'blue', 'black' ]，索引大于等于1小于4的元素

// splice()
colors = ['red', 'green', 'blue']
let removed = colors.splice(0, 1) // 从索引0开始，删除1项
console.log(removed) // [ 'red' ]，返回被删除元素组成的数组
console.log(colors) // [ 'green', 'blue' ]，改变原数组

removed = colors.splice(1, 0, 'yellow', 'orange') // 从索引1开始，删除0项，插入'yellow'、'orange'
console.log(removed) // []，没有被删除的元素
console.log(colors) // [ 'green', 'yellow', 'orange', 'blue' ]

removed = colors.splice(1, 1, 'black', 'purple') // 从索引1开始，删除1项，插入'black'、'purple'
console.log(removed) // [ 'yellow' ]
console.log(colors) // [ 'green', 'black', 'purple', 'orange', 'blue' ]

/* 搜索和位置方法 */

/* 迭代方法 */

/* 归并方法 */
