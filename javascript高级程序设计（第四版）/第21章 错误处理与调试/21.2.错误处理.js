/* try/catch 语句 */
try {
  // 可能出错的代码
  const a = 3;
  a = 4;
} catch (error) {
  // 出错时执行的代码
  console.log("An error happened!"); // An error happened!
}

try {
  const a = 3;
  a = 4;
} catch (error) {
  console.log(error);
  /* 
    TypeError: Assignment to constant variable.
      at Object.<anonymous> (c:\Users\43577\Desktop\工作\my_project\my_demos\javascript高级程序设计（第四版）\第21章 错误处理与调试\21.2.错误处理.js:13:5)
      at Module._compile (internal/modules/cjs/loader.js:1085:14)
      at Object.Module._extensions..js (internal/modules/cjs/loader.js:1114:10)
      at Module.load (internal/modules/cjs/loader.js:950:32)
      at Function.Module._load (internal/modules/cjs/loader.js:790:12)
      at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:75:12)
      at internal/main/run_main_module.js:17:47
  */
  console.log(error.name); // TypeError（类型错误）
  console.log(error.message); // Assignment to constant variable.（常量被赋值）
}

// finally 子句
try {
  console.log(1); // 1，执行
} catch (error) {
  console.log(2); // 不执行
} finally {
  console.log(3); // 3，执行
}

try {
  const a = 3;
  a = 4;
} catch (error) {
  console.log(2); // 2，try出错执行catch
} finally {
  console.log(3); // 3，仍执行
}

console.log(
  (function testFinally() {
    try {
      console.log("try"); // try，非return语句不受影响
      return 1;
    } catch (error) {
      return 2;
    } finally {
      console.log("finally"); // finally
      return 3;
    }
  })()
); // 3，包含finally语句，try或catch中的return会被忽略

// 错误类型
// new Array(-1); // RangeError: Invalid array length
// let obj = x; // ReferenceError: x is not defined
// eval("1++2"); // SyntaxError: Invalid left-hand side expression in postfix operation
// console.log("a" in "abc"); // TypeError: Cannot use 'in' operator to search for 'a' in abc
// Function.prototype.toString().call("name"); // TypeError: Function.prototype.toString(...).call is not a function

try {
  const a = 3;
  a = 4;
} catch (error) {
  if (error instanceof TypeError) {
    console.log("TypeError!");
  }
} // TypeError!
try {
  new Array(-1);
} catch (error) {
  if (error instanceof RangeError) {
    console.log("RangeError!");
  }
} // RangeError!

/* 抛出错误 */

// throw 12345; // Uncaught 12345，后续代码停止
// throw "Hello world"; // Uncaught Hello world，后续代码停止
// throw true; // Uncaught true，后续代码停止
// throw { name: "JS" }; // Uncaught {name: 'JS'}，后续代码停止

try {
  throw 123;
} catch (error) {
  console.log(123);
} // 123
console.log(5); // 5，throw被try/catch捕获，后续代码照常

// throw new SyntaxError; //  Uncaught SyntaxError
// throw new InternalError; //  Uncaught InternalError
// throw new TypeError; //  Uncaught TypeError
// throw new RangeError; //  Uncaught RangeError
// throw new EvalError; //  Uncaught EvalError
// throw new URIError; //  Uncaught URIError
// throw new RefenceError; //  Uncaught RefenceError

class CustomError extends Error {
  constructor(message) {
    super(message); // super调用父类构造函数，手动给父类传参，并将返回值赋给子类中的this
    this.name = "CustomError";
    this.message = message;
  }
}
// throw new CustomError("My message"); // CustomError: My message

// 何时抛出错误
function process(values) {
  if (!(values instanceof Array)) {
    throw new Error("process(): Argument must be an Array.");
  }
  values.sort(); // 如果values不是数组，则浏览器会报错。因此在此句之前判断参数类型且用自定义错误，可有效提高代码可维护性
  for (let value of values) {
    if (value > 100) {
      return value;
    }
  }
  return -1;
}
// process(1); // Error: process(): Argument must be an Array.
// process(1); // TypeError: values.sort is not a function（如果没有throw代码段的结果）

/* error 事件 */

// const image = new Image();
// image.addEventListener("load", (event) => {
//   console.log("Image loaded!");
// });
// image.addEventListener("error", (event) => {
//   console.log("Image not loaded!");
// });
// image.src = "a.jpg"; // Image not loaded!

/* 识别错误 */

// 类型转换错误

console.log(5 == "5"); // true
console.log(5 === "5"); // false，数据类型不同
console.log(1 == true); // true
console.log(1 === true); // false，数据类型不同

function concat(str1, str2, str3) {
  let result = str1 + str2;
  if (str3) {
    result += str3;
  }
  return result;
}
console.log(concat("1", "2", "0")); // '120'
console.log(concat("1", "2")); // '12'，str3是undifined，转化为false
console.log(concat("1", "2", 0)); // '12'，str3是数值0，转化为false，与预期不符

function concat(str1, str2, str3) {
  let result = str1 + str2;
  if (str3 !== undefined) {
    result += str3;
  }
  return result;
}
console.log(concat("1", "2", "03")); // '120'
console.log(concat("1", "2")); // '12'，str3是undifined，转化为false
console.log(concat("1", "2", 0)); // '120'，达到预期

// 数据类型错误

function getQueryString(url) {
  const pos = url.indexOf("?"); // indexOf是字符串才有的方法
  if (pos > 1) {
    console.log(url.substring(pos + 1)); // substring是字符串才有的方法
    return;
  }
  console.log("not has ?");
}
// getQueryString(123); // TypeError: url.indexOf is not a function

function getQueryString2(url) {
  if (typeof url === "string") {
    // 确保不会因为参数是非字符串值而报错
    const pos = url.indexOf("?");
    if (pos > 1) {
      console.log(url.substring(pos + 1));
      return;
    }
    console.log("not has ?");
  }
}
getQueryString2(123); // 不打印
getQueryString2("123"); // 'not has ?'
getQueryString2("https://www.baidu.com?keyWord=error"); // 'keyWord=error'

function reverseSort(values) {
  if (values) {
    // 不可取，values为true的情况很多
    values.sort();
    values.reverse();
  }
}
// reverseSort(1); // TypeError: values.sort is not a function

function reverseSort2(values) {
  if (values !== null) {
    // 不可取，values不为null的情况很多
    values.sort();
    values.reverse();
  }
}
// reverseSort2(1); // TypeError: values.sort is not a function

function reverseSort3(values) {
  if (typeof values.sort === "function") {
    // 不可取，假如values有sort()方法但不是数组则会报错
    values.sort();
    values.reverse();
  }
}
// reverseSort3({
//   sort: () => {
//     console.log("3");
//   },
// }); // 先values.sort()打印3，后报错TypeError: values.reverse is not a function

function reverseSort4(values) {
  if (values instanceof Array) {
    // 可取，确保values是Array的实例
    values.sort();
    values.reverse();
  }
}
let val1 = 1;
let val2 = [1, 2];
reverseSort4(val1);
reverseSort4(val2);
console.log(val1); // 1
console.log(val2); // [2,1]

let url = "https://www.baidu.com?keyWord=https://www.taobao.com"; // url格式不正确
function addQueryStringArg(url, name, value) {
  if (url.indexOf("?") === -1) {
    url += "?";
  } else {
    url += "&";
  }
  url += `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  return url;
}
let url2 = addQueryStringArg(
  "https://www.baidu.com",
  "keyWord",
  "https://www.taobao.com"
);
console.log(url2); // https://www.baidu.com?keyWord=https%3A%2F%2Fwww.taobao.com，与服务器通信的正确url格式
