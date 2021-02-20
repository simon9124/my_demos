// 模板字面量标签函数
let num = '20'
let photo = '100'

function tagFunction1(strings, val1, val2, val3) {
  console.log(strings) // [ '手机：', '价格：', '总价：', '' ]，原始字符串数组，最后1位是空字符串
  console.log(val1) // 100，对每个表达式求值的结果 - ${photo}
  console.log(val2) // 20，对每个表达式求值的结果 - ${num}
  console.log(val3) // 2000，对每个表达式求值的结果 - ${num * photo}
}
let tagResult1 = tagFunction1`手机：${photo}价格：${num}总价：${num * photo}`
console.log(tagResult1)

function tagFunction2(strings, ...expressions) {
  console.log(strings) // [ '手机：', '价格：', '总价：', '' ]
  for (const expression of expressions) {
    console.log(expression) // 100,20,2000
  }
}
let tagResult2 = tagFunction2`手机：${photo}价格：${num}总价：${num * photo}`
console.log(tagResult2)

function tagFunction3(strings, ...expressions) {
  return expressions
    .map((e, i) => {
      console.log(`<li>${strings[i]}${e}</li>`)
    })
    .join('')
}
let tagResult3 = tagFunction3`手机：${photo}价格：${num}总价：${num * photo}`
console.log(tagResult3)
