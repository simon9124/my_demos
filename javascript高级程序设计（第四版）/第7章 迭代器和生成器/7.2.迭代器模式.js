/* 可迭代协议 */

// 未实现迭代器工厂函数
let num = 1
let obj = {}
console.log(num[Symbol.iterator]) // undefined
console.log(obj[Symbol.iterator]) // undefined

// 实现了迭代器工厂函数
let str = 'abc'
let arr = ['a', 'b', 'c']
let map = new Map().set('a', 1).set('b', 2)
let set = new Set().add('a').add('b')
console.log(str[Symbol.iterator]) // ƒ [Symbol.iterator]() { [native code] }
console.log(arr[Symbol.iterator]) // ƒ values() { [native code] }
console.log(map[Symbol.iterator]) // ƒ entries() { [native code] }
console.log(set[Symbol.iterator]) // ƒ values() { [native code] }

// 调用迭代器工厂函数，生成新的迭代器
console.log(str[Symbol.iterator]()) // StringIterator {}
console.log(arr[Symbol.iterator]()) // ArrayIterator {}
console.log(map[Symbol.iterator]()) // MapIterator { "a" => 1, "b" => 2 }
console.log(set[Symbol.iterator]()) // StringIterator { "a", "b" }

// 不需要显示调用迭代器工厂函数
for (let el of arr) {
  console.log(el) // for-of循环
  /* 
    'a'
    'b'
    'c'
   */
}

let [a, b, c] = arr // 数组解构
console.log(a, b, c) // 'a' 'b' 'c'

let arr2 = [...arr] // 扩展操作符
console.log(arr2) // [ 'a', 'b', 'c' ]

let arr3 = Array.from(arr) // Array.from()
console.log(arr3) // [ 'a', 'b', 'c' ]

let set2 = new Set(arr)
console.log(set2) // Set(3) { 'a', 'b', 'c' }

let pairs = arr.map((x, i) => [x, i])
console.log(pairs) // [ [ 'a', 0 ], [ 'b', 1 ], [ 'c', 2 ] ]
let map2 = new Map(pairs)
console.log(map2) // Map(3) { 'a' => 0, 'b' => 1, 'c' => 2 }

// 父类实现了Iterable接口
class FooArray extends Array {}
let fooArr = new FooArray('foo', 'bar', 'baz')

for (let el of fooArr) {
  console.log(el)
  /* 
    foo
    bar
    baz
   */
}

/* 迭代器协议 */

// next()
let arr4 = ['foo', 'bar'] // 可迭代对象
console.log(arr4[Symbol.iterator]) // ƒ values() { [native code] }，迭代器工厂函数

let iter = arr4[Symbol.iterator]() // 迭代器
console.log(iter) // ArrayIterator {}

console.log(iter.next()) // { value: 'foo', done: false }，执行迭代
console.log(iter.next()) // { value: 'foo', done: false }，执行迭代
console.log(iter.next()) // { value: undefined, done: true }，执行迭代
console.log(iter.next()) // { value: undefined, done: true }，执行迭代

// 不同迭代器没有联系，每个迭代器独立地遍历可迭代对象
let iter2 = arr4[Symbol.iterator]() // 迭代器iter2，迭代可迭代对象arr4
let iter3 = arr4[Symbol.iterator]() // 迭代器iter2，迭代可迭代对象arr4

console.log(iter2.next()) // { value: 'foo', done: false }
console.log(iter3.next()) // { value: 'foo', done: false }
console.log(iter3.next()) // { value: 'bar', done: false }
console.log(iter2.next()) // { value: 'bar', done: false }

// 可迭代对象在迭代期间被修改
let arr5 = ['foo', 'baz']
let iter4 = arr5[Symbol.iterator]()
console.log(iter4.next()) // { value: 'foo', done: false }

arr5.splice(1, 0, 'bar') // 迭代期间，可迭代对象被修改
console.log(iter4.next()) // { value: 'bar', done: false }
console.log(iter4.next()) // { value: 'baz', done: false }
console.log(iter4.next()) // { value: undefined, done: true }

/* 自定义迭代器 */

// 对象实现Iterable接口，作为迭代器
class Counter {
  // 构造函数
  constructor(limit) {
    this.count = 1
    this.limit = limit
  }
  // Iterable 接口，实现自定义迭代
  [Symbol.iterator]() {
    return this
  }
  // 原型上的迭代方法
  next() {
    if (this.count <= this.limit) {
      return { value: this.count++, done: false }
    } else {
      return { value: undefined, done: true }
    }
  }
}

let counter = new Counter(5)
console.log(counter) // Counter { count: 1, limit: 5 }，构造函数
console.log(counter[Symbol.iterator]) // ƒ [Symbol.iterator]() { return this }，迭代器工厂函数

for (let i of counter) {
  console.log(i)
  /* 实现了自定义迭代器：
    1
    2
    3
    4
    5 
  */
}

for (let i of counter) {
  console.log(i)
  /* 只能迭代1次
    nothing nothing logged
  */
}

// 将计数器变量放到闭包里，实现同一个可迭代对象能够创建多个迭代器

class Counter2 {
  constructor(limit) {
    this.limit = limit
  }
  [Symbol.iterator]() {
    let count = 1 // 计数器变量放到闭包中
    let limit = this.limit
    return {
      next() {
        if (count <= limit) {
          return { value: count++, done: false }
        } else {
          return { value: undefined, done: true }
        }
      },
    }
  }
}
let counter2 = new Counter2(3)

for (let i of counter2) {
  console.log(i)
  /* 
    1
    2
    3
  */
}

for (let i of counter2) {
  console.log(i)
  /* 同一个可迭代对象，能够创建多个迭代器：
    1
    2
    3
  */
}

// Symbol.iterator 属性引用的工厂函数会返回相同的迭代器
let arr6 = ['foo', 'bar', 'baz']
let iter5 = arr6[Symbol.iterator]()
console.log(iter5) // ArrayIterator {}

let iter6 = iter5[Symbol.iterator]() // 迭代器再次调用工厂函数，生成新的迭代器
console.log(iter6) // // ArrayIterator {}
console.log(iter5 === iter6) // true

let iter7 = iter6[Symbol.iterator]() // 迭代器再次调用工厂函数，生成新的迭代器
console.log(iter7) // // ArrayIterator {}
console.log(iter6 === iter7) // true

for (let i of iter7) {
  console.log(i)
  /* 
    'foo'
    'bar'
    'baz'
  */
}

/* 提前终止迭代器 */

// return()
class Counter3 {
  constructor(limit) {
    this.limit = limit
  }
  [Symbol.iterator]() {
    let count = 1 // 计数器变量放到闭包中
    let limit = this.limit
    return {
      next() {
        if (count <= limit) {
          return { value: count++, done: false }
        } else {
          return { value: undefined, done: true }
        }
      },
      // 提前终止迭代器的方法
      return() {
        console.log('Exiting early')
        return { done: true }
      },
    }
  }
}

let counter3 = new Counter3(5)

for (let i of counter3) {
  if (i > 2) {
    break // 提前终止迭代器，调用迭代器的return()方法
  }
  console.log(i)
  /* 
    1
    2
    'Exiting early'
  */
}

try {
  for (let i of counter3) {
    if (i > 2) {
      throw 'err' // 提前终止迭代器，调用迭代器的return()方法
    }
    console.log(i)
    /* 
    1
    2
    'Exiting early'
  */
  }
} catch (e) {}

let [a2, b2, c2, d2, e2, f2] = counter3 // 解构操作，消费所有值
console.log(a2, b2, c2, d2, e2, f2) // 1 2 3 4 5 undefined
let [a3, b3, c3] = counter3 // 'Exiting early'，解构操作，未消费所有值

// 继续迭代
let arr7 = [1, 2, 3, 4, 5]
let iter8 = arr7[Symbol.iterator]()

for (let i of iter8) {
  console.log(i)
  if (i > 2) {
    break // 提前退出迭代器，但不关闭
  }
  /* 
    1
    2
    3
 */
}

for (let i of iter8) {
  console.log(i)
  /* 继续迭代
    4
    5
 */
}

// return属性
let arr8 = [1, 2, 3, 4, 5]
let iter9 = arr8[Symbol.iterator]()

console.log(iter9.return) // undefined，迭代器不可关闭

iter9.return = function () {
  // 追加return方法，但无法让迭代器变得可关闭
  console.log('Exiting early')
  return { done: true }
}

for (let i of iter9) {
  console.log(i)
  if (i > 2) {
    break // 提前退出迭代器
  }
  /* 
    1
    2
    3
    'Exiting early'，提前终止迭代器仍会调用return()方法
 */
}

for (let i of iter9) {
  console.log(i)
  /* 继续迭代
    4
    5
 */
}
