/* 访问函数指针 */
function sum(num1, num2) {
  return num1 + num2
}
console.log(sum(10, 10))

var anotherSum = sum // 使用不带圆括号的函数名是访问函数指针，而非调用函数
console.log(anotherSum(10, 10))

sum = null // sum与函数断绝关系
console.log(anotherSum(10, 10)) // 但anotherSum()仍可正常调用
// console.log(sum(10, 10)) // 会报错，sum is not a function

/* 没有重载 */
function addSomeNumber(num) {
  return num + 100
}
function addSomeNumber(num) {
  return num + 200
}
var result = addSomeNumber(100)
console.log(result)
