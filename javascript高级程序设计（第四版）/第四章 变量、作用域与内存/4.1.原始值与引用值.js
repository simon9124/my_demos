/* 动态属性 */
let personRefer = new Object() // 创建对象
personRefer.name = 'Nicholas' // 添加属性并赋值
console.log(personRefer.name) // 'Nicholas'

let namePrim = 'Nicholas' // 原始值
namePrim.age = 27 // 给原始值添加属性
console.log(namePrim.age) // undefined，不报错但无效

let name1 = 'Nicholas' // 原始类型
let name2 = new String('Matt') // 原始值包装类型
name1.age = 27
name2.age = 26
console.log(name1.age) // undefined，原始类型不能有属性
console.log(name2.age) // 26，引用类型可以有属性
console.log(typeof name1) // string，原始类型
console.log(typeof name2) // object，引用类型

/* 复制值 */

/* 传递参数 */

/* 确定类型 */
