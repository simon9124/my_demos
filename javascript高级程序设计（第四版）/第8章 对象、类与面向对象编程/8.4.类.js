/* 8.4 类 */

/* 8.4.1 类定义 */
class Person {} // 类声明
var animal = class {} // 类表达式

console.log(FunctionDeclaration) // [Function: FunctionDeclaration]，函数声明提前
function FunctionDeclaration() {}
// console.log(ClassDeclaration) // ReferenceError: Cannot access 'ClassDeclaration' before initialization，类没有声明提前
class ClassDeclaration {}

{
  function FunctionDeclaration2() {}
  class ClassDeclaration2 {}
}
console.log(FunctionDeclaration2) // [Function: FunctionDeclaration2]
// console.log(ClassDeclaration2) // ReferenceError: ClassDeclaration2 is not defined

/* 类的构成 */
class Foo {} // 空类定义
class Bar {
  constructor() {} // 构造函数
  get myBaz() {} // 获取函数
  static myQux() {} // 静态方法
}

var Person2 = class PersonName {
  identify() {
    console.log(PersonName) // 类表达式作用域内部，访问类表达式
    console.log(Person2.name, PersonName.name) // 类表达式作用域内部，访问类表达式的名称
    /* 
      [class PersonName]
      PersonName PersonName
    */
  }
}
var p = new Person2()
p.identify()
console.log(Person2.name) // PersonName
console.log(PersonName) // ReferenceError: PersonName is not defined，类表达式作用与外部，无法访问类表达式

/* 8.4.2 类构造函数 */

/* 8.4.3 实例、原型和类成员 */

/* 8.4.4 继承 */
