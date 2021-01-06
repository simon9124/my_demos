/* 函数声明 */
function functionName(arg0, arg1, arg2) {
  // 函数体
}
console.log(functionName.name) // functionName，只在Firefox、Safari、Chrome、Opera有效

// 函数声明提升
sayHi() // 'Hi'
function sayHi() {
  console.log('Hi')
}

/* 函数表达式 */
// sayHi2() // error：sayHi2 is not a function，函数表达式必须先赋值后使用
var sayHi2 = function () {
  console.log('Hi')
}

var condition = true
if (condition) {
  // 在块中，应避免使用函数声明
  function sayHi() {
    console.log('Hi')
  }
} else {
  // 在块中，应避免使用函数声明
  function sayHi() {
    console.log('Yo')
  }
}
sayHi() // 在ES5不同浏览器会有不同的返回结果，在ES6无问题但不建议

/* 递归 */
function factorial(num) {
  if (num <= 1) {
    return 1
  } else {
    return num * factorial(num - 1) // 通过名字调用自身
  }
}

var anotherFactorial = factorial // 访问函数指针，factorial和anotherFactorial指向同一个函数
factorial = null // factorial与函数断绝关系，anotherFactorial仍可正常调用
// console.log(anotherFactorial(4)) // error：factorial is not a function，anotherFactorial内部的factorial已经不是函数

// arguments.callee
function factorial2(num) {
  if (num <= 1) {
    return 1
  } else {
    return num * arguments.callee(num - 1) // arguments.callee是指针，指向正在执行的函数，代替函数内部的函数名
  }
}
anotherFactorial2 = factorial2
factorial2 = null
console.log(anotherFactorial2(4)) // 24

// 严格模式下，命名函数表达式代替使用arguments.callee
var factorial3 = function f(num) {
  if (num <= 1) {
    return 1
  } else {
    return num * f(num - 1)
  }
}
anotherFactorial3 = factorial3
factorial3 = null
console.log(anotherFactorial3(4)) // 24
