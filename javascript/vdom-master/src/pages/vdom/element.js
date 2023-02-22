
var utils = require('./util');
/*
 * Virtual-dom element
 * @param {String} tagName
 * @param {Object} props - Element's properties(using object key-value pair)
 * @param {Array<Element|String} 元素的子节点，可能包括元素的实列 或 一个文本节点
*/
function Element(tagName, props, children) {
  if (!(this instanceof Element)) {
    // 判断子节点 children 是否为 undefined
    if (!utils.isArray(children) && children !== null) {
      children = utils.slice(arguments, 2).filter(utils.truthy);
    }
    return new Element(tagName, props, children);
  }
  // 如果没有属性的话，第二个参数是一个数组，说明第二个参数传的是子节点
  if (utils.isArray(props)) {
    children = props;
    props = {};
  }
  this.tagName = tagName;
  this.props = props || {};
  this.children = children || [];
  // 保存key键 如果有属性 保存key，否则返回undefined
  this.key = props ? props.key : void 0;
  var count = 0;
  
  utils.each(this.children, function(child, i) {
    // 如果是元素的实列的话
    if (child instanceof Element) {
      count += child.count;
    } else {
      // 如果是文本节点的话，直接赋值
      children[i] = '' + child;
    }
    count++;
  });
  this.count = count;
}
Element.prototype.render = function() {
  var el = document.createElement(this.tagName);
  var props = this.props;
  // 遍历子节点，依次设置子节点的属性
  for (var propName in props) {
    var propValue = props[propName];
    utils.setAttr(el, propName, propValue);
  }
  // 保存子节点
  var childrens = this.children || [];
  // 遍历子节点，使用递归的方式 渲染
  utils.each(childrens, function(child) {
    var childEl = (child instanceof Element) ? child.render() // 如果子节点也是虚拟DOM，递归构建DOM节点
      : document.createTextNode(child);    // 如果是字符串的话，只构建文本节点
    el.appendChild(childEl);
  });
  return el;
};
module.exports = Element;

