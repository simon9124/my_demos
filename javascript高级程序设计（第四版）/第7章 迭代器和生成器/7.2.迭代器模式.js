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

/* 自定义迭代器 */

/* 提前终止迭代器 */
