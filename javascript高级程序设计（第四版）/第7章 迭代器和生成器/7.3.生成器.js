/* 生成器基础 */

function* generatorFn() {} // 生成器函数声明
let gfn = function* () {} // 生成器函数表达式
let foo = {
  *generatorFn() {}, // 生成器函数作为对象字面量方法
}
class Foo {
  *generatorFn() {} // 生成器函数作为类实例方法
}
class FooStatic {
  static *generatorFn() {} // 生成器函数作为类静态方法
}

// 生成器对象
const g = generatorFn() // 调用生成器函数，产生生成器对象
console.log(g) // generatorFn {<suspended>}，生成器对象
console.log(g.next) // 生成器对象具有next()方法

// next()
console.log(g.next()) // { value: undefined, done: true }，函数体为空

// 指定value
function* generatorFn2() {
  return 'foo'
}
const g2 = generatorFn2()
console.log(g2.next()) // { value: 'foo', done: true }
console.log(g2.next()) // { value: undefined, done: true }，耗尽

// 执行生成器函数
function* generatorFn3() {
  console.log('生成器函数开始执行')
}
const g3 = generatorFn3() // 调用生成器函数，产生生成器对象（生成器函数还未执行，不打印日志）
g3.next() // '生成器函数开始执行'，初次调用next()方法，生成器函数开始执行，打印日志

// 生成器对象的默认迭代器
function* generatorFn4() {}
console.log(generatorFn4) // ƒ* generatorFn4() {}，生成器函数

const g4 = generatorFn4()
console.log(g4) // generatorFn4 {<suspended>}，生成器对象

console.log(g4[Symbol.iterator]) // ƒ [Symbol.iterator]() { [native code] }，迭代器工厂函数
console.log(g4[Symbol.iterator]()) // generatorFn4 {<suspended>}，迭代器

console.log(g4 === g4[Symbol.iterator]()) // true，生成器对象的默认迭代器是自引用的

/* 通过 yield 中断执行 */

// yield
function* generatorFn5() {
  yield
}
let g5 = generatorFn5()
console.log(g5.next()) // { value: undefined, done: false }，yield生成的值
console.log(g5.next()) // { value: undefined, done: true }，恢复执行生成的值

// yield返回值
function* generatorFn6() {
  yield 'foo'
  yield 'bar'
  return 'baz'
}
let g6 = generatorFn6()
console.log(g6.next()) // { value: 'foo', done: false }，yield关键字退出
console.log(g6.next()) // { value: 'bar', done: false }，yield关键字退出
console.log(g6.next()) // { value: 'baz', done: true }，return关键字退出

// 同一个生成器函数，不同的生成器对象
let g7 = generatorFn6() // 生成器对象g7
let g8 = generatorFn6() // 生成器对象g8

console.log(g7.next()) // { value: 'foo', done: false }
console.log(g8.next()) // { value: 'foo', done: false }
console.log(g8.next()) // { value: 'bar', done: false }
console.log(g7.next()) // { value: 'bar', done: false }

// yield必须在生成器函数内部，直接位于生成器函数定义中使用
function* validGeneratorFn() {
  yield 'result'
}
// function* invalidGeneratorFnA() {
//   function a() {
//     yield 'result' // SyntaxError: Unexpected string
//   }
// }
// function* invalidGeneratorFnB() {
//   const b = () => {
//     yield 'result' // SyntaxError: Unexpected string
//   }
// }
// function* invalidGeneratorFnC() {
//   ;(() => {
//     yield 'result' // SyntaxError: Unexpected string
//   })()
// }

// 生成器对象作为可迭代对象
function* generatorFn7() {
  // 生成器函数
  yield 1
  yield 2
  yield 3
}
for (const x of generatorFn7()) {
  // 调用生成器函数generatorFn7，generatorFn7()是生成器对象
  console.log(x)
  /* 
    1
    2
    3
  */
}

function* nTimes(n) {
  while (n--) {
    console.log(n)
    yield
  }
}
for (let _ of nTimes(3)) {
  console.log(_)
  /* 
    2，第1次循环n
    undefined，第1次循环yield
    1，第2次循环n
    undefined，第2次循环yield
    0，第3次循环n
    undefined，第3次循环yield
  */
}

// 使用 yield 实现输入和输出

// yield作为函数的中间参数
function* generatorFn8() {
  console.log(yield)
  console.log(yield)
  console.log(yield)
}
let g9 = generatorFn8() // 调用生成器函数，产生生成器对象
g9.next('bar') // 第一次调用next()的值不会被使用，仅作为开始执行生成器函数
g9.next('baz') // 'baz'，调用next()传入baz，参数作为交给同一个yield的值
g9.next('qux') // 'qux'，调用next()传入qux，参数作为交给同一个yield的值

// yield同时用于输入和输出
function* generatorFn9() {
  return yield 'foo'
}
let g10 = generatorFn9()
console.log(g10.next()) // { value: 'foo', done: false }，next()没有参数，遇到yield关键字暂停执行，并计算要产生的值
console.log(g10.next('bar')) // { value: 'bar', done: true }，next()有参数，参数作为交给同一个yield的值，相当于return 'bar'

// yield多次使用
function* generatorFn10() {
  for (let i = 0; ; i++) {
    yield i
  }
}
let g11 = generatorFn10()
console.log(g11.next()) // { value: 0, done: false }
console.log(g11.next()) // { value: 1, done: false }
console.log(g11.next()) // { value: 2, done: false }
console.log(g11.next()) // { value: 3, done: false }

// yield根据迭代次数产生相应索引
function* nTimes(n) {
  let i = 0
  while (n--) {
    yield i++
  }
}
for (let x of nTimes(3)) {
  console.log(x)
  /* 
    0
    1
    2
  */
}

// 使用生成器实现范围
function* range(start, end) {
  while (end > start) {
    yield start++
  }
}
for (const x of range(4, 7)) {
  console.log(x)
  /* 
    4
    5
    6
  */
}

// 使用生成器填充数组
function* zeros(n) {
  while (n--) {
    yield 0
  }
}
console.log(zeros(8)) // zeros {<suspended>}，生成器对象
console.log(Array.from(zeros(8))) // [0, 0, 0, 0, 0, 0, 0, 0]，生成器对象作为可迭代对象

// 产生可迭代对象

// 使用 yield*实现递归算法

/* 生成器作为默认迭代器 */

/* 提前终止生成器 */
