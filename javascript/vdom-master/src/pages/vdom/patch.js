
var utils = require('./util');

var REPLACE = 0;
var REORDER = 1;
var PROPS = 2;
var TEXT = 3;

function patch(node, patches) {
  var walker = {index: 0};
  deepWalk(node, walker, patches);
}

function deepWalk(node, walker, patches) {
  var currentPatches = patches[walker.index];
  // node.childNodes 返回指定元素的子元素集合，包括HTML节点，所有属性，文本节点。
  var len = node.childNodes ? node.childNodes.length : 0;
  for (var i = 0; i < len; i++) {
    var child = node.childNodes[i];
    walker.index++;
    // 深度复制 递归遍历
    deepWalk(child, walker, patches);
  }
  if (currentPatches) {
    applyPatches(node, currentPatches);
  }
}

function applyPatches(node, currentPatches) {
  utils.each(currentPatches, function(currentPatch) {
    switch (currentPatch.type) {
      case REPLACE:
        var newNode = (typeof currentPatch.node === 'string') 
          ? document.createTextNode(currentPatch.node)
          : currentPatch.node.render();
        node.parentNode.replaceChild(newNode, node);
        break;
      case REORDER:
        reorderChildren(node, currentPatch.moves);
        break;
      case PROPS: 
        setProps(node, currentPatch.props);
        break;
      case TEXT:
        if(node.textContent) {
          node.textContent = currentPatch.content;
        } else {
          // ie bug
          node.nodeValue = currentPatch.content;
        }
        break;
      default:
        throw new Error('Unknow patch type' + currentPatch.type);
    }
  });
}

// 设置属性
function setProps(node, props) {
  for (var key in props) {
    if (props[key] === void 0) {
      node.removeAttribute(key);
    } else {
      var value = props[key];
      utils.setAttr(node, key, value);
    }
  }
}

// 对子节点进行排序
function reorderChildren(node, moves) {
  var staticNodeList = utils.toArray(node.childNodes);
  var maps = {};
  utils.each(staticNodeList, function(node) {
    // 如果是元素节点
    if (node.nodeType === 1) {
      var key = node.getAttribute('key');
      if (key) {
        maps[key] = node;
      }
    }
  })
  utils.each(moves, function(move) {
    var index = move.index;
    if (move.type === 0) {
      // remove Item
      if (staticNodeList[index] === node.childNodes[index]) {
        node.removeChild(node.childNodes[index]);
      }
      staticNodeList.splice(index, 1);
    } else if(move.type === 1) {
      // insert item
      var insertNode = maps[move.item.key] 
        ? maps[move.item.key].cloneNode(true)
        : (typeof move.item === 'object') ? move.item.render() : document.createTextNode(move.item);
      staticNodeList.splice(index, 0, insertNode);
      node.insertBefore(insertNode, node.childNodes[index] || null);
    }
  });
}
patch.REPLACE = REPLACE;
patch.REORDER = REORDER;
patch.PROPS = PROPS;
patch.TEXT = TEXT;

module.exports = patch;
