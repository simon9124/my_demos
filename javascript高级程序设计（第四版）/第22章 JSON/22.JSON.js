/* 解析与序列化 */

// JSON 对象

let book = {
  title: "Professional",
  authors: ["Nicholas", "Matt"],
  edition: 4,
  year: 2017,
};
let jsonText = JSON.stringify(book);
console.log(jsonText); // {"title":"Professional","authors":["Nicholas","Matt"],"edition":4,"year":2017}

let bookCopy = JSON.parse(jsonText);
console.log(bookCopy);
/* 
{
    title: 'Professional',
    authors: [ 'Nicholas', 'Matt' ],
    edition: 4,
    year: 2017
}
*/

let bookCopy2 = JSON.parse(JSON.stringify(book)); // 深拷贝
console.log(bookCopy2);
/* 
{
    title: 'Professional',
    authors: [ 'Nicholas', 'Matt' ],
    edition: 4,
    year: 2017
}
*/

let book2 = {
  title: "Professional",
  authors: ["Nicholas", "Matt"],
  edition: () => {}, // 序列化时会被省略
  year: undefined, // 序列化时会被省略
};
let jsonText2 = JSON.stringify(book2);
console.log(jsonText2); // {"title":"Professional","authors":["Nicholas","Matt"]}
let bookCopy3 = JSON.parse(jsonText2);
console.log(bookCopy3);
/* 
{ 
    title: 'Professional',
    authors: [ 'Nicholas', 'Matt' ]
}
*/

// 序列化选项
let jsonText3 = JSON.stringify(book, ["title", "edition"]); // 只返回包含title和edition属性
console.log(jsonText3); // {"title":"Professional","edition":4}

let jsonText4 = JSON.stringify(book, (key, value) => {
  switch (key) {
    case "authors":
      return value.join(","); // 将数值转换为字符串
    case "year":
      return 5000; // 返回5000
    case "edition":
      return undefined; // 忽略该属性
    default:
      return value; // 必须设置默认返回值
  }
});
console.log(jsonText4); // {"title":"Professional","authors":"Nicholas,Matt","year":5000}

let book3 = {
  title: "Professional",
  authors: ["Nicholas", "Matt"],
  edition: 4,
  year: 2017,
  book3: {
    title: "Professional2",
    authors: ["Nicholas", "Matt"],
    edition: 4,
    year: 2017,
  }, // 对book3做序列化时，内层的book3对象同样受影响
};
let jsonText5 = JSON.stringify(book3, (key, value) => {
  switch (key) {
    case "authors":
      return value.join(",");
    case "year":
      return 5000;
    case "edition":
      return undefined;
    default:
      return value;
  }
});
console.log(jsonText5); // {"title":"Professional","authors":"Nicholas,Matt","year":5000,"book3":{"title":"Professional2","authors":"Nicholas,Matt","year":5000}}

let jsonText6 = JSON.stringify(book, null, 4); // 每级缩进4个空格
console.log(jsonText6);
/* 
{
    "title": "Professional",
    "authors": [
        "Nicholas",
        "Matt"
    ],
    "edition": 4,
    "year": 2017
}
*/

let jsonText7 = JSON.stringify(book, null, "-"); // 使用'-'缩进
console.log(jsonText7);
/* 
{
-"title": "Professional",
-"authors": [
--"Nicholas",
--"Matt"
-],
-"edition": 4,
-"year": 2017
}
*/

let book4 = {
  title: "Professional",
  authors: ["Nicholas", "Matt"],
  edition: 4,
  year: 2017,
  toJSON: function () {
    return this.title; // 执行toJSON()，返回值直接return
  },
};
let jsonText8 = JSON.stringify(book4);
console.log(jsonText8); // "Professional"

let num = {
  toJSON: function () {
    return 123;
  },
};
let book5 = {
  title: "Professional",
  authors: ["Nicholas", "Matt"],
  edition: 4,
  year: 2017,
  num,
};
let jsonText9 = JSON.stringify(book5, ["title", "edition", "num"], 4); // JSON.stringify()时默认调用num的toJSON()方法
console.log(jsonText9);
/* 
{
    "title": "Professional",
    "edition": 4,
    "num": 123
}
*/

// 解析选项
let book6 = {
  title: "Professional",
  authors: ["Nicholas", "Matt"],
  edition: 4,
  year: 2017,
  num,
};
let jsonText10 = JSON.stringify(book6);
let bookCopy4 = JSON.parse(jsonText10, (key, value) =>
  key === "year" ? value + 1 : value
);
console.log(bookCopy4);
/* 
{
  title: 'Professional',
  authors: [ 'Nicholas', 'Matt' ],
  edition: 4,
  year: 2018,
  num: 123
}
*/

let bookCopy5 = JSON.parse(
  jsonText10,
  (key, value) => (key === "year" ? undefined : value) // 返回值为undefined的建将被忽略
);
console.log(bookCopy5);
/* 
{
  title: 'Professional',
  authors: [ 'Nicholas', 'Matt' ],
  edition: 4,
  num: 123
}
*/
