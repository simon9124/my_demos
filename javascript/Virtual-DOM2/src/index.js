/* 1.使用javascript对象模拟DOM树 */
let createElement = require("./element");

`<div id="container" class="container">
<ul id="list">
<li class="item">111</li>
<li class="item">222</li>
<li class="item">333</li>
</ul>
<button class="btn btn-blue"><em>提交</em></button>
</div>`;

var element = createElement("div", { id: "container", class: "container" }, [
  createElement("p", {}, ["Virtual DOM"]),
  createElement("ul", { id: "list" }, [
    createElement("li", { class: "item" }, ["111"]),
    createElement("li", { class: "item" }, ["222"]),
    createElement("li", { class: "item" }, ["333"]),
  ]),
  createElement("button", { class: "btn btn-blue" }, [
    createElement("em", { class: "" }, ["提交"]),
  ]),
]);
console.log(element);
var elemRoot = element.render();
console.log(elemRoot);
document.body.appendChild(elemRoot);

/* 2.比较两颗虚拟DOM树的差异及差异的地方进行dom操作 */

`<div id="container">
        <h1 style="color: red;">simple virtal dom</h1>
        <p>the count is :1</p>
        <ul>
        <li>Item #0</li>
        </ul>
        </div>`;

`<div id="container">
        <h1 style="color: blue;">simple virtal dom</h1>
        <p>the count is :2</p>
        <ul>
        <li>Item #0</li>
        <li>Item #1</li>
        </ul>
        </div>`;

var diff = require("./diff");
var patch = require("./patch");

var ul1 = createElement("div", { id: "virtual-dom" }, [
  createElement("p", {}, ["Virtual DOM"]),
  createElement("ul", { id: "list" }, [
    createElement("li", { class: "item" }, ["Item 1"]),
    createElement("li", { class: "item" }, ["Item 2"]),
    createElement("li", { class: "item" }, ["Item 3"]),
  ]),
  createElement("div", {}, ["Hello World"]),
]);
var ul2 = createElement("div", { id: "virtual-dom2" }, [
  createElement("p", {}, ["Virtual DOM"]),
  createElement("ul", { id: "list" }, [
    createElement("li", { class: "item" }, ["Item 21"]),
    createElement("li", { class: "item" }, ["Item 23"]),
  ]),
  createElement("p", {}, ["Hello World"]),
]);
var patches = diff(ul1, ul2);
console.log("patches:", patches);

var count = 0;
function renderTree() {
  count++;
  var items = [];
  var color = count % 2 === 0 ? "blue" : "red";
  for (var i = 0; i < count; i++) {
    // items.push(createElement("li", ["Item #" + i]));
  }
  // return createElement("div", { id: "container" }, [
  //   createElement("h1", { style: "color: " + color }, [
  //     "simple virtal dom",
  //   ]),
  //   createElement("p", ["the count is :" + count]),
  //   createElement("ul", items),
  // ]);
}

var tree = renderTree();
// var root = tree.render();
// document.body.appendChild(root); // 渲染页面1

// setInterval(function () {
//   var newTree = renderTree();
//   var patches = diff(tree, newTree);
//   console.log(patches);
//   patch(root, patches);
//   tree = newTree;
// }, 1000);
