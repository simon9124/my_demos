/* 提供一些公用的方法 */

let obj = {
  type: function (obj) {
    return Object.prototype.toString.call(obj).replace(/\[object\s|\]/g, "");
  },
  isArray: function (list) {
    return this.type(list) === "Array";
  },
  slice: function (arrayLike, index) {
    return Array.prototype.slice.call(arrayLike, index);
  },
  truthy: function (value) {
    return !!value;
  },
  isString: function (list) {
    return this.type(list) === "String";
  },
  each: function (array, fn) {
    for (let i = 0, len = array.length; i < len; i++) {
      fn(array[i], i);
    }
  },
  toArray: function (arrayLike) {
    if (!arrayLike) {
      return [];
    }
    let newList = [];
    for (let i = 0, len = arrayLike.length; i < len; i++) {
      newList.push(arrayLike[i]);
    }
    return newList;
  },
  setAttr: function (node, key, value) {
    switch (key) {
      case "style":
        node.style.cssText = value;
        break;
      case "value":
        let tagName = node.tagName || "";
        tagName = tagName.toLowerCase();
        if (tagName === "input" || tagName === "textarea") {
          node.value = value;
        } else {
          node.setAttribute(key, value);
        }
        break;
      default:
        node.setAttribute(key, value);
        break;
    }
  },
};

export { obj as utils };
