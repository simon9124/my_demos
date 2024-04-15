import { utils } from "./util.js";

/**
 * VNode virdual-dom 对象定义
 * @param {String} tagName - dom 元素名称
 * @param {Object} props - dom 属性
 * @param {Array<VNode|String>} - 子节点
 */
export default class VNode {
  constructor(tagName, props, children) {
    if (!(this instanceof VNode)) {
      // 判断子节点 children 是否为 undefined
      if (!utils.isArray(children) && children !== null) {
        children = utils.slice(arguments, 2).filter(utils.truthy);
      }
      return new VNode(tagName, props, children);
    }

    if (utils.isArray(props)) {
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
    utils.each(this.children, function (child, i) {
      // console.log(child);
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
