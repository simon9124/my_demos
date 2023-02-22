/* 比较新旧节点数据，如果有差异保存到一个对象里面去 */

var utils = require("./util");
var patch = require("./patch");
// var listDiff = require("list-diff2");

function diff(oldTree, newTree) {
  var index = 0; // 当前节点的标志
  var patches = {}; // 用来记录每个节点差异的对象
  deepWalk(oldTree, newTree, index, patches);
  return patches;
}

// 对两棵树进行深度优先遍历
function deepWalk(oldNode, newNode, index, patches) {
  var currentPatch = [];
  // 节点被删除掉
  if (newNode === null) {
    // 真正的DOM节点时，将删除执行重新排序，所以不需要做任何事
  } else if (utils.isString(oldNode) && utils.isString(newNode)) {
    // 替换文本节点
    if (newNode !== oldNode) {
      currentPatch.push({ type: patch.TEXT, content: newNode }); // type为3，content为新节点文本内容
    }
  } else if (
    oldNode.tagName === newNode.tagName &&
    oldNode.key === newNode.key
  ) {
    // 相同的节点，但是新旧节点的属性不同的情况下 比较属性
    var propsPatches = diffProps(oldNode, newNode);
    if (propsPatches) {
      currentPatch.push({ type: patch.PROPS, props: propsPatches }); // type为2
    }
    // 比较子节点，如果子节点有'ignore'属性，则不需要比较
    if (!isIgnoreChildren(newNode)) {
      // diffChildren(
      //   oldNode.children,
      //   newNode.children,
      //   index,
      //   patches,
      //   currentPatch
      // );
    }
  } else {
    // 不同的节点，那么新节点替换旧节点
    currentPatch.push({ type: patch.REPLACE, node: newNode }); // type为0
  }
  if (currentPatch.length) {
    patches[index] = currentPatch;
  }
}

// 顺序比较子元素的变化
function diffChildren(oldChildren, newChildren, index, patches, currentPatch) {
  var diffs = listDiff(oldChildren, newChildren, "key");
  newChildren = diffs.children;

  if (diffs.moves.length) {
    var recorderPatch = { type: patch.REORDER, moves: diffs.moves };
    currentPatch.push(recorderPatch);
  }

  var leftNode = null;
  var currentNodeIndex = index;
  utils.each(oldChildren, function (child, i) {
    var newChild = newChildren[i];
    currentNodeIndex =
      leftNode && leftNode.count
        ? currentNodeIndex + leftNode.count + 1
        : currentNodeIndex + 1;
    // 递归
    deepWalk(child, newChild, currentNodeIndex, patches);
    leftNode = child;
  });
}

// 比较属性的变化
function diffProps(oldNode, newNode) {
  var count = 0;
  var oldProps = oldNode.props;
  var newProps = newNode.props;
  var key, value;
  var propsPatches = {};
  // 找出不同的属性值
  for (key in oldProps) {
    value = oldProps[key];
    if (newProps[key] !== value) {
      count++;
      propsPatches[key] = newProps[key];
    }
  }
  // 找出新增属性
  for (key in newProps) {
    value = newProps[key];
    if (!oldProps.hasOwnProperty(key)) {
      count++;
      propsPatches[key] = newProps[key];
    }
  }
  // 如果所有的属性都是相同的话
  if (count === 0) {
    return null;
  }
  return propsPatches;
}

function isIgnoreChildren(node) {
  return node.props && node.props.hasOwnProperty("ignore");
}

module.exports = diff;
