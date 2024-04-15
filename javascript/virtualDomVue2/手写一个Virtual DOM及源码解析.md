- `Virtual DOM`是当今主流框架普遍采用的**提高 web 页面性能**的方案，其原理是：
  - 1.把真实的 DOM 树转换成 js 对象（虚拟 DOM）
  - 2.数据更新时生成新的 js 对象（新的虚拟 DOM）
  - 3.二者比对后**仅对发生变化的数据进行更新**

<a href="https://github.com/simon9124/my_demos/tree/master/javascript/virtualDomVue2" target="_blank">完整代码参考 →</a>

## js 对象模拟 DOM 树

- 假设有如下 html 结构（见`index.html`）

```html
<div id="virtual-dom" style="color:red">
  <p>Virtual DOM</p>
  <ul id="list">
    <li class="item">Item 1</li>
    <li class="item">Item 2</li>
    <li class="item">Item 3</li>
  </ul>
  <div>Hello World</div>
</div>
```

- 用 js 对象表示该结构，标签作为`tagName`属性，`id、class`等作为`props`属性，标签内再嵌套的标签或文本均作为`children`

```js
const elNode = {
  tagName: "div",
  props: { id: "virtual-dom" },
  children: [
    { tagName: "p", children: ["Virtual DOM"] }, // 没有props
    {
      tagName: "ul",
      props: { id: "list" },
      children: [
        {
          tagName: "li",
          props: { class: "item" },
          children: ["Item 1"],
        },
        {
          tagName: "li",
          props: { class: "item" },
          children: ["Item 2"],
        },
        {
          tagName: "li",
          props: { class: "item" },
          children: ["Item 3"],
        },
      ],
    },
    { tagName: "div", props: {}, children: ["Hello World"] },
  ],
};
```

- 创建`VNode`类，用以将以上 js 结构转换成 VNode 节点对象（见`vnode.js`），并创建调用`Vnode`的方法`createElement`（见`create-element.js`）

```js
export default class VNode {
  constructor(tagName, props, children) {
    if (props instanceof Array) {
      // 第二个参数是数组，说明传的是children，即没有传props
      children = props; // 把props赋给原本应是子节点的第三个参数
      props = {}; // props被赋值为空对象
    }
    this.tagName = tagName;
    this.props = props;
    this.children = children;
  }
  // render 将virdual-dom 对象渲染为实际 DOM 元素
  render() {
    // console.log(this.tagName, this.props, this.children);
    let el = document.createElement(this.tagName);
    let props = this.props;
    // 设置节点的DOM属性
    for (let propName in props) {
      let propValue = props[propName];
      el.setAttribute(propName, propValue);
    }
    // 保存子节点
    let children = this.children || [];
    children.forEach((child) => {
      let childEl =
        child instanceof VNode
          ? child.render() // 如果子节点也是虚拟DOM，递归构建DOM节点
          : document.createTextNode(child); // 如果字符串，只构建文本节点
      el.appendChild(childEl); // 子节点dom
    });
    return el;
  }
}
```

```js
export function createElement(tagName, props, children) {
  return new VNode(tagName, props, children);
}
```

- 注掉页面原本的`html`结构并调用`createElement`方法（见`index.html`），可渲染同样的内容

```html
<!-- <div id="virtual-dom">
  <p>Virtual DOM</p>
  <ul id="list">
    <li class="item">Item 1</li>
    <li class="item">Item 2</li>
    <li class="item">Item 3</li>
  </ul>
  <div>Hello World</div>
</div> -->

<script type="module">
  import { createElement } from "./create-element.js";
  let elNode = createElement("div", { id: "virtual-dom", color: "red" }, [
    createElement("p", ["Virtual DOM"]), // 没有props
    createElement("ul", { id: "list" }, [
      createElement("li", { class: "item" }, ["Item 1"]),
      createElement("li", { class: "item" }, ["Item 2"]),
      createElement("li", { class: "item" }, ["Item 3"]),
    ]),
    createElement("div", ["Hello World"]),
  ]);

  let elRoot = elNode.render(); // 调用VNode原型上的render方法，创建相应节点
  document.body.appendChild(elRoot); // 页面可渲染与注掉相同的内容
</script>
```

## 比较两颗虚拟 DOM 树

- 假设上文渲染的内容，想要变成如下 html 结构

```html
<div id="virtual-dom2">
  <p>New Virtual DOM</p>
  <ul id="list">
    <li class="item" style="height: 30px">Item 1</li>
    <li class="item">Item 2</li>
    <li class="item">Item 3</li>
    <li class="item">Item 4</li>
  </ul>
  <div>Hello World</div>
</div>
```

- 仍旧是先用虚拟 dom 表示该结构（见`index.html`）

```js
let elNodeNew = createElement("div", { id: "virtual-dom2" }, [
  createElement("p", { color: "red" }, ["New Virtual DOM"]),
  createElement("ul", { id: "list" }, [
    createElement("li", { class: "item", style: "height: 30px" }, ["Item 1"]),
    createElement("li", { class: "item" }, ["Item 2"]),
    createElement("li", { class: "item" }, ["Item 3"]),
    createElement("li", { class: "item" }, ["Item 4"]),
  ]),
  createElement("div", {}, ["Hello World"]),
]);
```

- `VNode`类追加`count`和`key`，`key`用作遍历时的唯一标识，`count`用作后续比对（见`vnode.js`）

```js
export default class VNode {
  constructor(tagName, props, children) {
    if (props instanceof Array) {
      // 第二个参数是数组，说明传的是children，即没有传props
      children = props; // 把props赋给原本应是子节点的第三个参数
      props = {}; // props被赋值为空对象
    }
    this.tagName = tagName;
    this.props = props;
    this.children = children;

    // 保存key键：如果有属性则保存key，否则返回undefined
    this.key = props ? props.key : void 0;

    let count = 0;
    this.children.forEach((child, i) => {
      // 如果是元素的实列的话
      if (child instanceof VNode) {
        count += child.count;
      } else {
        // 如果是文本节点的话，直接赋值
        children[i] = "" + child;
      }
      count++; // 每遍历children后，count都会+1
    });
    this.count = count;
  }
  render() {
    // ...
  }
}

/* elNode为例，追加后查看打印：
  VNode {
    tagName: 'div',
    props: { id: 'virtual-dom' },
    children: [
      VNode {  tagName: 'p', props: {}, children: ['Virtual DOM'], count: 1, key: undefined },
      VNode {
        tagName: 'ul',
        props: { id: 'list' },
        children: [
          VNode { tagName: 'li', props: { class: 'item' }, children: ['Item 1'], count: 1, key: undefined },
          VNode { tagName: 'li', props: { class: 'item' }, children: ['Item 2'], count: 1, key: undefined },
          VNode { tagName: 'li', props: { class: 'item' }, children: ['Item 3'], count: 1, key: undefined },
        ],
        count: 6,
        key: undefined
      },
      VNode { tagName: 'div', props: {}, children: ['Hello World'], count: 1, key: undefined }
    ],
    count: 11,
    key: undefined
  }
*/
```

### 比对`elNode`和`elNodeNew`

- 调用`diff()`方法（见`diff.js`）

```js
export function diff(oldTree, newTree) {
  let index = 0; // 当前节点的标志
  let patches = {}; // 用来记录每个节点差异的对象
  deepWalk(oldTree, newTree, index, patches);
  return patches;
}
```

- 核心方法`deepWalk()`，对两棵树进行深度优先遍历（见`diff.js`）：

  - 如果节点被删除，则无需操作
  - 如果替换文本（肯定无 children），则记录**更新文字**
  - 如果标签相同
    - 如果属性不同，则记录**更新属性**
    - 比较子节点（如果新节点有`ignore`属性，则不需要比较），调用`diffChildren()`方法，**比较子元素的变化**
  - 如果标签不同，则记录**整体重置**

  - 前置 1：在`patch.js`中设置不同的操作类型（`patch.js`）

  ```js
  let REPLACE = 0; // 整体重置
  let REORDER = 1; // 重新排序
  let PROPS = 2; // 更新属性
  let TEXT = 3; // 更新文字

  patch.REPLACE = REPLACE;
  patch.REORDER = REORDER;
  patch.PROPS = PROPS;
  patch.TEXT = TEXT;
  ```

  - 前置 2：判断新节点是否有`ignore`属性的方法`isIgnoreChildren()`

  ```js
  function isIgnoreChildren(node) {
    return node.props && node.props.hasOwnProperty("ignore");
  }
  ```

```js
import { patch } from "./patch.js";

function deepWalk(oldNode, newNode, index, patches) {
  // console.log(oldNode, newNode);
  let currentPatch = [];
  if (newNode === null) {
    // 节点被删除掉（真正的DOM节点时，将删除执行重新排序，所以不需要做任何事）
  } else if (typeof oldNode === "string" && typeof newNode === "string") {
    // 替换文本节点
    if (newNode !== oldNode) {
      currentPatch.push({ type: patch.TEXT, content: newNode }); // type为3，content为新节点文本内容
    }
  } else if (
    oldNode.tagName === newNode.tagName &&
    oldNode.key === newNode.key
  ) {
    // 相同的节点，但是新旧节点的属性不同的情况下 比较属性
    let propsPatches = diffProps(oldNode, newNode);
    if (propsPatches) {
      currentPatch.push({ type: patch.PROPS, props: propsPatches }); // type为2
    }
    // console.log(currentPatch);
    // 比较子节点，如果新节点有'ignore'属性，则不需要比较
    if (!isIgnoreChildren(newNode)) {
      diffChildren(
        oldNode.children,
        newNode.children,
        index,
        patches,
        currentPatch
      );
    }
  } else {
    // 不同的节点，那么新节点替换旧节点
    currentPatch.push({ type: patch.REPLACE, node: newNode }); // type为0
  }
  // console.log(currentPatch);
  if (currentPatch.length) {
    patches[index] = currentPatch; // 把对应的currentPatch存储到patches对象内中的对应项
  }
  // console.log(patches);
}
```

- `deepWalk()`对两颗树进行比对后，如果节点的标签相同，则还需调用`diffChildren()`比较子节点（见`diff.js`）
  - 新旧节点，采用`list-diff`算法（见`listDiff.js`），根据`key`做比对，返回如`{ moves: moves, children: children }`的数据结构（有关`list-diff`算法可参见<a href="https://github.com/simon9124/my_demos/blob/master/javascript/%E8%AF%A6%E8%A7%A3virtual-dom%E4%B8%AD%E7%9A%84list-diff%E7%AE%97%E6%B3%95.md" target="_blank">这篇详解 →</a>，本文不多做赘述）
  - `moves`为需要操作的步骤，遍历后记录为**重新排序**
  - **递归，子节点继续调用`deepWalk()`方法**

```js
function diffChildren(oldChildren, newChildren, index, patches, currentPatch) {
  // console.log(oldChildren, newChildren, index);
  let diffs = listDiff(oldChildren, newChildren, "key"); // 新旧节点按照字符串'key'来比较
  console.log(diffs);
  newChildren = diffs.children; // diffs.children同listDiff方法中的simulateList，即要操作的相似列表
  if (diffs.moves.length) {
    let recorderPatch = { type: patch.REORDER, moves: diffs.moves };
    currentPatch.push(recorderPatch);
  }
  let leftNode = null;
  let currentNodeIndex = index;
  oldChildren.forEach((child, i) => {
    let newChild = newChildren[i];
    currentNodeIndex =
      leftNode && leftNode.count
        ? currentNodeIndex + leftNode.count + 1 // 非首次遍历时，leftNode为上一次遍历的子节点
        : currentNodeIndex + 1; // 首次遍历时，leftNode为null，currentNodeIndex被赋值为1
    deepWalk(child, newChild, currentNodeIndex, patches); // 递归遍历，直至最内层
    leftNode = child;
  });
}
```

- 在页面中调用`diff()`方法，比对`elNode`和`elNodeNew`（见`index.html`），返回值即为从`elNode`变化到`elNodeNew`需要进行的完整操作

```html
<script type="module">
  import { createElement } from "./create-element.js";
  import { diff } from "./diff.js";
  // let elNode = ...
  // let elNodeNew = ...

  let elRoot = elNode.render(); // 调用VNode原型上的render方法，创建相应节点
  document.body.appendChild(elRoot); // 页面可渲染与注掉相同的内容

  setTimeout(() => {
    let patches = diff(elNode, elNodeNew);
    console.log(patches);
    /* 
      {
        0: [{ props: {id: 'virtual-dom2', style: undefined}, type: 2 }],
        1: [{ props: {color: 'red'}, type: 2 }],
        2: [{ type: 3, content: 'New Virtual DOM' }],
        3: [{ 
             moves: [{
               index: 3, 
               item: VNode{
                 children: ['Item 4'], 
                 count: 1, 
                 key: undefined, 
                 props: {class: 'item'}, 
                 tagName:  "li"
               }, 
               type: 1
             }],
             type: 1 
           }],
        4: [{ props: {id: 'virtual-dom2', style: undefined}, type: 2 }],
      }
    */
  }, 1000);
</script>
```

## 对发生变化的数据进行更新

- `patch()`方法，对`elRoot`（变化前的）和`patches`（调用`diff()`返回值）进行操作（见`patch.js`）

```js
export function patch(node, patches) {
  let walker = { index: 0 }; // 从key为0开始遍历patches
  deepWalk(node, walker, patches); // 调用patch.js里的deepWalk方法，不是diff.js里的
}
```

- 调用`deepWalk()`方法，对`elRoot`的全部子节点进行遍历和递归（见`patch.js`）
  - `walker.index`初始为 0，每次遍历加 1
  - 如果在`patches`中有对应`walker.index`属性的项，则调用`applyPatches()`针对当前节点进行相应操作
  - **重点**：`diff.js`的`index`和`patch.js`的`walker.index`，都是针对`elNode`的每个节点逐一遍历直至最内层，因此回文`patches`里的`key`与`walker.index`相对应，对当前遍历到的`node`执行`applyPatches()`即可

```js
function deepWalk(node, walker, patches) {
  // console.log(node, walker, patches);
  let currentPatches = patches[walker.index];
  let len = node.childNodes ? node.childNodes.length : 0; // node.childNodes返回包含指定节点的子节点的集合，包括HTML节点、所有属性、文本节点
  // console.log(node.childNodes, len);
  for (let i = 0; i < len; i++) {
    let child = node.childNodes[i];
    walker.index++;
    deepWalk(child, walker, patches); // 递归遍历，直至最内层（node.childNodes.length为0）
  }
  // console.log(currentPatches);
  if (currentPatches) {
    applyPatches(node, currentPatches); // 在patches中有对应的操作，则执行
  }
}
```

- `applyPatches()`方法会根据传入的`type`类型，对节点进行相应操作（见`patch.js`）

```js
function applyPatches(node, currentPatches) {
  // console.log(node, currentPatches);
  currentPatches.forEach((currentPatch) => {
    switch (currentPatch.type) {
      case REPLACE: // 整体重置
        let newNode =
          typeof currentPatch.node === "string"
            ? document.createTextNode(currentPatch.node) // 字符串节点
            : currentPatch.node.render(); // dom节点
        node.parentNode.replaceChild(newNode, node); // 替换子节点
        break;
      case REORDER: // 重新排序
        reorderChildren(node, currentPatch.moves);
        break;
      case PROPS: // 更新属性
        setProps(node, currentPatch.props);
        break;
      case TEXT: // 更新文字
        if (node.textContent) {
          node.textContent = currentPatch.content;
        } else {
          // ie bug
          node.nodeValue = currentPatch.content;
        }
        break;
      default:
        throw new Error("Unknow patch type" + currentPatch.type);
    }
  });
}
```

- `reorderChildren()`方法对子节点进行排序（见`patch.js`）

```js
function reorderChildren(node, moves) {
  // console.log(node, moves);
  let staticNodeList = Array.from(node.childNodes);
  // console.log(staticNodeList);
  let maps = {};
  staticNodeList.forEach((node) => {
    // 如果是元素节点
    if (node.nodeType === 1) {
      let key = node.getAttribute("key");
      if (key) {
        maps[key] = node;
      }
    }
  });
  moves.forEach((move) => {
    let index = move.index;
    if (move.type === 0) {
      // 移除项
      if (staticNodeList[index] === node.childNodes[index]) {
        node.removeChild(node.childNodes[index]); // 移除该子节点
      }
      staticNodeList.splice(index, 1); // 从staticNodeList数组中移除
    } else if (move.type === 1) {
      // 插入项
      let insertNode = maps[move.item.key]
        ? maps[move.item.key].cloneNode(true)
        : typeof move.item === "object" // 插入节点对象
        ? move.item.render() // 直接渲染
        : document.createTextNode(move.item); // 插入文本
      // console.log(insertNode);
      staticNodeList.splice(index, 0, insertNode); // 插入
      node.insertBefore(insertNode, node.childNodes[index] || null);
    }
  });
}
```

- `setProps()`方法设置属性（见`patch.js`）

```js
function setProps(node, props) {
  // console.log(node, props);
  for (let key in props) {
    if (props[key] === void 0) {
      node.removeAttribute(key); // 没有属性->移除属性
    } else {
      let value = props[key];
      utils.setAttr(node, key, value); // 有属性->重新赋值
    }
  }
}
```

- 给属性重新赋值时，需区分属性为`style`和`value`两种情况，属性为`value`时还需判断标签是否为文本框或文本域（见`utils.js`）
- `utils.js`为提供公用方法库，为方便阅读简化代码，本文解析时未使用源码中的其他方法，不影响效果

```js
let obj = {
  setAttr: function (node, key, value) {
    switch (key) {
      case "style":
        node.style.cssText = value; // 更新样式
        break;
      case "value":
        let tagName = node.tagName || "";
        tagName = tagName.toLowerCase();
        if (tagName === "input" || tagName === "textarea") {
          // 输入框 或 文本域
          node.value = value; // 更新绑定值
        } else {
          // 其余
          node.setAttribute(key, value); // 更新属性
        }
        break;
      default:
        node.setAttribute(key, value); // 更新属性
        break;
    }
  },
};

export { obj as utils };
```

## 效果实现

- 在页面中将`elRoot`和`patches`传给`patch()`并调用即可（见`index.html`）

```html
<script type="module">
  import { createElement } from "./create-element.js";
  import { diff } from "./diff.js";
  import { patch } from "./patch.js";

  let elNode = createElement("div", { id: "virtual-dom", style: "color:red" }, [
    createElement("p", ["Virtual DOM"]), // 没有props
    createElement("ul", { id: "list" }, [
      createElement("li", { class: "item" }, ["Item 1"]),
      createElement("li", { class: "item" }, ["Item 2"]),
      createElement("li", { class: "item" }, ["Item 3"]),
    ]),
    createElement("div", ["Hello World"]),
  ]);

  let elRoot = elNode.render(); // 调用VNode原型上的render方法，创建相应节点
  document.body.appendChild(elRoot);

  let elNodeNew = createElement("div", { id: "virtual-dom2" }, [
    createElement("p", { color: "red" }, ["New Virtual DOM"]),
    createElement("ul", { id: "list" }, [
      createElement("li", { class: "item", style: "height: 30px" }, ["Item 1"]),
      createElement("li", { class: "item" }, ["Item 2"]),
      createElement("li", { class: "item" }, ["Item 3"]),
      createElement("li", { class: "item" }, ["Item 4"]),
    ]),
    createElement("div", {}, ["Hello World"]),
  ]);

  setTimeout(() => {
    let patches = diff(elNode, elNodeNew);
    console.log(patches);
    patch(elRoot, patches); // 执行patch方法
  }, 1000); // 1秒后，由elNode变化成elNodeNew，elRoot本身没有重新挂载，实现虚拟dom更新
</script>
```

### 核心 dom 方法

- 虚拟 dom 只是节省了节点更新次数，但万变不离其宗，最终还是要更新真实 dom 的，大体涉及到的方法如下

```js
document.createTextNode(txt); // 创建文本节点
node.setAttribute(key, value); // 设置节点属性
node.removeAttribute(key); // 移除节点属性
parentNode.replaceChild(newNode, node); // 替换子节点
parentNode.removeChild(node); // 移除子节点
parentNode.insertBefore(node, existNode); // 追加子节点
```
