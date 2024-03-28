import VNode from "./vnode.js"; // virdual-dom 对象定义

export function createElement(tagName, props, children) {
  return new VNode(tagName, props, children);
}
