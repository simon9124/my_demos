/* 实例化元素组成json数据 且 提供render方法 渲染页面 */

/**
 * VNode virdual-dom 对象定义
 * @param {String} tagName - dom 元素名称
 * @param {Object} props - dom 属性
 * @param {Array<VNode|String>} - 子节点
 */
class VNode {
  constructor(tagName, props, children) {
    this.tagName = tagName;
    this.props = props;
    this.children = children;
    this.key = props ? props.key : void 0; // 保存key键 如果有属性 保存key，否则返回undefined
    var count = 0;
    children.forEach((child, i) => {
      //   console.log(child, child instanceof VNode);
      if (child instanceof VNode) {
        count += child.count;
      } else {
        children[i] = "" + child; // 转换成字符串
      }
      count++;
    });
    // 子元素个数
    this.count = count;
  }
}

/**
 * render 将virdual-dom 对象渲染为实际 DOM 元素
 */
VNode.prototype.render = function () {
  var el = document.createElement(this.tagName);
  var props = this.props;
  // 设置节点的DOM属性
  for (var propName in props) {
    var propValue = props[propName];
    el.setAttribute(propName, propValue);
  }
  // 保存子节点
  var children = this.children || [];
  // 遍历子节点，使用递归的方式渲染
  children.forEach(function (child) {
    var childEl =
      child instanceof VNode
        ? child.render() // 如果子节点也是虚拟DOM，递归构建DOM节点
        : document.createTextNode(child); // 如果是字符串，只构建文本节点
    el.appendChild(childEl);
  });
  return el;
};

module.exports = function (tagName, props, children) {
  return new VNode(tagName, props, children);
};
