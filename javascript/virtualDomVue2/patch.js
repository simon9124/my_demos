/* 对当前差异的节点数据进行DOM操作 */

import { utils } from "./util.js";

let REPLACE = 0; // 整体重置
let REORDER = 1; // 重新排序
let PROPS = 2; // 更新属性
let TEXT = 3; // 更新文字

export function patch(node, patches) {
  let walker = { index: 0 }; // 从key为0开始遍历patches
  deepWalk(node, walker, patches);
}

function deepWalk(node, walker, patches) {
  console.log(node, walker, patches);
  let currentPatches = patches[walker.index];
  let len = node.childNodes ? node.childNodes.length : 0; // node.childNodes返回包含指定节点的子节点的集合，包括HTML节点、所有属性、文本节点
  console.log(node.childNodes, len);
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

function applyPatches(node, currentPatches) {
  // console.log(node, currentPatches);
  utils.each(currentPatches, function (currentPatch) {
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

// 设置属性
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

// 对子节点进行排序
function reorderChildren(node, moves) {
  // console.log(node, moves);
  let staticNodeList = utils.toArray(node.childNodes);
  // console.log(staticNodeList);
  let maps = {};
  utils.each(staticNodeList, function (node) {
    // 如果是元素节点
    if (node.nodeType === 1) {
      let key = node.getAttribute("key");
      if (key) {
        maps[key] = node;
      }
    }
  });
  utils.each(moves, function (move) {
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

patch.REPLACE = REPLACE;
patch.REORDER = REORDER;
patch.PROPS = PROPS;
patch.TEXT = TEXT;

/* 核心方法
document.createTextNode(txt) // 创建文本节点
node.setAttribute(key, value) // 设置节点属性
node.removeAttribute(key) // 移除节点属性
parentNode.replaceChild(newNode, node) // 替换子节点
parentNode.removeChild(node) // 移除子节点
parentNode.insertBefore(node, existNode) // 追加子节点
*/
