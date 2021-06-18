/* 10.14 闭包 */
function arraySort(key, sort) {
  return function (a, b) {
    // 内部匿名函数，引用外部函数变量key和sort，形成闭包
    let va = a[key]
    let vb = b[key]
    if (sort === 'asc' || sort === undefined || sort === '') {
      // 正序：va > vb
      if (va > vb) return 1
      else if (va < vb) return -1
      else return 0
    } else if (sort === 'desc') {
      // 倒序：va < vb
      if (va < vb) return 1
      else if (va > vb) return -1
      else return 0
    }
  }
}
let compareNames = arraySort('name') // 执行函数并返回匿名函数，匿名函数的作用域链仍对arraySort的活动对象key和sort有引用，因此不会被销毁
let result = compareNames({ name: 'Nicholas' }, { name: 'Matt' }) // 执行匿名函数
compareNames = null // 解除匿名函数对arraySort活动对象的引用，释放内存

/* 10.14.1 this对象 */
global.identity = 'The Window' // vscode是node运行环境，无法识别全局对象window，测试时将window改为global
let object = {
  identity: 'My Object',
  getIdentityFunc() {
    return function () {
      return this.identity
    }
  },
}
console.log(object.getIdentityFunc()) // ƒ () { return this.identity }，返回匿名函数
console.log(object.getIdentityFunc()()) // 'The Window'，立即调用匿名函数返回this.identity，this指向全局对象

// 内部函数不能直接访问外部函数的this和arguments，若想访问需将其引用先保存到闭包能访问的另一个变量中
let object2 = {
  identity: 'My Object',
  getIdentityFunc() {
    let that = this // 外部函数的变量this保存在that中
    return function () {
      return that.identity // 闭包（匿名函数）中引用that，that指向getIdentityFunc()上下文的this（而非闭包内的this）
    }
  },
}
console.log(object2.getIdentityFunc()()) // 'My Object'，立即调用匿名函数返回that.identity，that指向闭包外部函数getIdentityFunc的this

// 一些特殊情况下的this值
let object3 = {
  identity: 'My Object',
  getIdentity() {
    return this.identity
  },
}
console.log(object3.getIdentity()) // 'My Object'
console.log(object3.getIdentity) // [Function: getIdentity]，函数getIdentity()
console.log((object3.getIdentity = object3.getIdentity)) // [Function: getIdentity]，函数getIdentity()赋值给object3.getIdentity
console.log((object3.getIdentity = object3.getIdentity)()) // 'The Window'，赋值后在全局调用，this指向全局对象
console.log((object3.funcA = object3.getIdentity)()) // 'The Window'，函数getIdentity()赋值给对象其他属性，结果相同
object3.funcB = object3.getIdentity
console.log(object3.funcB()) // 'My Object'，赋值后在object3调用，this指向object3

/* 10.14.2 内存泄漏 */
function assignHandler() {
  let element = document.getElementById('someElement')
  element.onclick = () => {
    console.log(element.id) // 引用外部函数的活动对象element，匿名函数一直存在因此element不会被销毁
  }
}

function assignHandler2() {
  let element = document.getElementById('someElement')
  let id = element.id // 保存element.id的变量id
  element.onclick = () => {
    console.log(id) // 不直接引用element，改为引用改为引用保存着element.id的变量id
  }
  element = null // 解除对element对象的引用，试放闭包内存
}

/* 10.15 立即调用的函数表达式 */
;(function () {
  // 块级作用域
})()

// ES5使用IIFE模拟块级作用域
;(function () {
  for (var i = 0; i < 3; i++) {
    console.log(i) // 0、1、2
  }
})()
// console.log(i) // ReferenceError: i is not defined，i在函数体作用域（模拟块级作用域）内

// ES6支持块级作用域，无须IIFE
{
  let i = 0
  for (i = 0; i < 3; i++) {
    console.log(i) // 0、1、2
  }
}
// console.log(i) // ReferenceError: i is not defined

for (let i = 0; i < 3; i++) {
  console.log(i) // 0、1、2
}
// console.log(i) // ReferenceError: i is not defined

// 执行单击处理程序时，用IIFE或块级作用域，锁定每次单击要显示的值
// let divs = document.querySelectorAll('div')
// for (var i = 0; i < divs.length; ++i) {
//   divs[i].addEventListener(
//     'click',

//     // 错误的写法：直接打印（单击处理程序迭代变量的值是循环结束时的最终值）
//     // function(){
//     //   console.log(i);
//     // }

//     // 正确的写法：立即执行的函数表达式，锁定每次要显示的值
//     (function (_i) {
//       return function () {
//         console.log(_i)
//       }
//     })(i) // 参数传入每次要显示的值
//   )
// }

// for (let i = 0; i < divs.length; ++i) {
//   // 用let关键字，在循环内部为每个循环创建独立的变量
//   divs[i].addEventListener('click', function () {
//     console.log(i)
//   })
// }

// 执行超时逻辑时，用IIFE或块级作用域，锁定每次要迭代的值
for (var i = 0; i < 5; i++) {
  // 超时逻辑在退出循环后执行，迭代变量保存的是导致循环退出的值5
  setTimeout(() => {
    console.log(i) // 5、5、5、5、5
  }, 0)
}

for (var i = 0; i < 5; i++) {
  // 用立即调用的函数表达式，传入每次循环的当前索引，锁定每次超时逻辑应该显示的索引值
  ;(function (_i) {
    setTimeout(() => {
      console.log(_i) // 0、1、2、3、4
    }, 0)
  })(i)
}

for (let i = 0; i < 5; i++) {
  // 使用let声明：为每个迭代循环声明新的迭代变量
  setTimeout(() => {
    console.log(i) // 0、1、2、3、4
  }, 0)
}

/* 10.16 私有变量 */
