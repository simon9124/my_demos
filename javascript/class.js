/*
  用构造函数，生成对象实例：
  1. 使用构造函数， 并且new 构造函数(), 后台会隐式执行new Object() 创建对象
  2. 将构造函数的作用域给新对象，（ 即new Object() 创建出的对象）， 函数体内的this代表new Object() 出来的对象
  3. 执行构造函数的代码
  4. 返回新对象（ 后台直接返回）
*/
function Person1(name, age) {
  this.name = name
  this.age = age
}
Person1.prototype.say = function () {
  return "My name is " + this.name + ", I'm " + this.age + " years old."
}
var obj = new Person1("Simon", 28);
console.log(obj.say()); // My name is Simon, I'm 28 years old.


/*
  用class改写上述代码：
  1.通过class关键字定义类，使得在对象写法上更清晰， 让javascript更像一种面向对象的语言
  2.在类中声明方法的时， 不可给方法加function关键字
*/
class Person2 {
  // 用constructor构造方法接收参数
  constructor(name, age) {
    this.name = name; // this代表的是实例对象
    this.age = age;
  }
  // 类的方法，此处不能加function
  say() {
    return "My name is " + this.name + ", I'm " + this.age + " years old."
  }
}
var obj = new Person2("Coco", 26);
console.log(obj.say()); // My name is Coco, I'm 26 years old.

/* 
  1.ES6中的类，实质上就是一个函数
  2.类自身指向的就是构造函数
  3.类其实就是构造函数的另外一种写法
*/
console.log(typeof Person2); // function
console.log(Person1 === Person1.prototype.constructor); // true
console.log(Person2 === Person2.prototype.constructor); // true

/* 
  构造函数的prototype属性，在ES6的class中依然存在：
*/

// 构造1个与类同名的方法 -> 成功实现覆盖
Person2.prototype.say = function () {
  return "证明一下：My name is " + this.name + ", I'm " + this.age + " years old."
}
var obj = new Person2("Coco", 26);
console.log(obj.say()); // 证明一下：My name is Coco, I'm 26 years old.

// 通过prototype属性对类添加方法
Person2.prototype.addFn = function () {
  return "通过prototype新增加的方法addFn"
}
var obj = new Person2("Coco", 26);
console.log(obj.addFn()); // 通过prototype新增加的方法addFn

/* 
  通过Object.assign方法来为对象动态增加方法：
*/
Object.assign(Person2.prototype, {
  getName: function () {
    return this.name;
  },
  getAge: function () {
    return this.age;
  }
})
var obj = new Person2("Coco", 26);
console.log(obj.getName()); // Coco
console.log(obj.getAge()); // 26

/* 
  constructor方法是类的构造函数的默认方法 -> new生成对象实例时，自动调用该方法
*/
class Box {
  constructor() {
    console.log("自动调用constructor方法"); // 实例化对象时，该行代码自动执行
  }
}
var obj = new Box();

/* 
  若没有定义constructor方法，将隐式生成一个constructor方法：
  1.即使没有添加构造函数，构造函数也是存在的
  2.constructor方法默认返回实例对象this
  3.可以指定constructor方法返回一个全新的对象，让返回的实例对象不是该类的实例对象
*/
class Text1 {
  constructor() {
    this.text = "这是一段Text";
  }
}
class Text2 {
  constructor() {
    return new Text1(); // 返回一个全新的对象
  }
}
var obj = new Text2()
console.log(obj.text); // 这是一段Text

/* 
  实例属性：constructor中定义的属性，即定义在this对象上
  原型属性：constructor外声明的属性，即定义在class上
  1.hasOwnProperty() 函数，判断属性是否为实例属性 -> true or false
  2. in操作符， 判断对象能否访问给定属性 -> true or false（与该属性存在于实例/原型中无关）
*/
class Text3 {
  // 实例属性，定义在this对象上
  constructor(text1, text2) {
    this.text1 = text1
    this.text2 = text2
  }
  // 原型属性，定义在class上
  text3() {
    return text1 + text2
  }
}
var obj = new Text3('123', '234')
console.log(obj.hasOwnProperty("text1")); // true
console.log(obj.hasOwnProperty("text2")); // true
console.log(obj.hasOwnProperty("text3")); // false
console.log("text1" in obj); // true
console.log("text2" in obj); // true
console.log("text3" in obj); // true
console.log("text4" in obj); // false

/* 
  类的所有实例共享一个原型对象， 它们的原型都是Person.prototype， 所以proto属性是相等的
*/
class Text4 {
  constructor(text1, text2) {
    this.text1 = text1;
    this.text2 = text2;
  }
  text3() {
    return text1 + text1;
  }
}
// text1与text2都是Text4的实例 -> 它们的__proto__都指向Text4的prototype
var text1 = new Text4('1234', '5678');
var text2 = new Text4('4321', '8765');
console.log(text1.__proto__ === text2.__proto__); // true

/* 
  通过proto来为类增加方法：
  1.使用实例的proto属性改写原型
  2.会改变Class的原始定义，影响到所有实例，不推荐使用
*/
class Num {
  constructor(num1, num2) {
    this.num1 = num1;
    this.num2 = num2;
  }
  sum() {
    return num1 + num2;
  }
}
var num1 = new Num(20, 78);
var num2 = new Num(40, 96);
num1.__proto__.minus = function () {
  return this.num2 - this.num1;
}
console.log(num1.minus()); // 76 -> 改变了class的原始定义，为class新增原型属性minus
console.log(num2.minus()); // 20 -> num2和num1共享原型对象Num，可以调用原型对象的minus方法

/* 
  class不存在变量提升，必须先定义再使用：
  1.ES6不会把class的声明提升到代码头部2
  2.ES5存在变量提升, 可以先使用再定义
*/

//ES5可以先使用再定义，存在变量提升
new A()

function A() {}

//ES6不能先使用再定义,不存在变量提升（报错）
new B() // B is not defined
class B {}