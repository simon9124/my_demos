// https://github.com/livoras/list-diff

/**
 * Diff two list in O(N).
 * @param {Array} oldList - Original List
 * @param {Array} newList - List After certain insertions, removes, or moves
 * @return {Object} - {moves: <Array>}
 *                  - moves is a list of actions that telling how to remove and insert
 */
function listDiff(oldList, newList, key) {
  let oldMap = makeKeyIndexAndFree(oldList, key); // { keyIndex: { a: 0, b: 1, c: 2, d: 3, e: 4 }, free: [{ key: 3 }] }
  let newMap = makeKeyIndexAndFree(newList, key); // { keyIndex: { c: 0, a: 1, b: 2, e: 3, f: 4 }, free: [{ value: 4 }] }
  let newFree = newMap.free;

  let oldKeyIndex = oldMap.keyIndex;
  let newKeyIndex = newMap.keyIndex;
  let moves = [];

  /* 1.获取simulateList：要操作的列表 */
  let children = [];
  let i = 0;
  let item;
  let itemKey;
  let freeIndex = 0;

  while (i < oldList.length) {
    item = oldList[i];
    itemKey = getItemKey(item, key);
    // console.log(itemKey);
    if (itemKey) {
      //   console.log(newKeyIndex.hasOwnProperty(itemKey));
      if (!newKeyIndex.hasOwnProperty(itemKey)) {
        // 新对象里没有旧对象的key
        children.push(null);
      } else {
        // 新对象里有旧对象的key
        let newItemIndex = newKeyIndex[itemKey]; // 获取该key在新对象中的index
        // console.log(itemKey, newItemIndex);
        children.push(newList[newItemIndex]);
      }
    } else {
      let freeItem = newFree[freeIndex++]; // { value: 4 }
      children.push(freeItem || null);
    }
    i++;
  }
  // console.log(children); // [{ id: 'a' },{ id: 'b' },{ id: 'c' },null,{ id: 'e' },{ value: 4 }]

  let simulateList = children.slice(0); // 同children

  i = 0;
  while (i < simulateList.length) {
    if (simulateList[i] === null) {
      remove(i); // 加入操作数组（要删除）
      removeSimulate(i); // 从 simulateList 中移除
    } else {
      i++;
    }
  }

  // console.log(simulateList); // [ { id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'e' }, { value: 4 } ]，已将null删除

  /* 2.比对newList和simulateList，进行相关操作 */
  let j = (i = 0);
  while (i < newList.length) {
    item = newList[i];
    itemKey = getItemKey(item, key);
    // console.log(itemKey);

    let simulateItem = simulateList[j];
    let simulateItemKey = getItemKey(simulateItem, key);
    // console.log(simulateItemKey);

    if (simulateItem) {
      if (itemKey === simulateItemKey) {
        // 新旧集合中 key-value 相等，而且位置相同
        // 或者是(undefined === undefined)新旧集合中都没有设置 key
        // 不做任何操作
        j++; // 跳过此项，newList的下一项与simulateList的下一项继续做比对
      } else {
        if (!oldKeyIndex.hasOwnProperty(itemKey)) {
          // 旧集合中没有该key
          insert(i, item); // 加入操作数组（要新增）
        } else {
          // 旧集合中有该key：newList当前项与simulateList下一项做比对
          let nextItemKey = getItemKey(simulateList[j + 1], key);
          if (nextItemKey === itemKey) {
            // 与simulateList下一项的key-value相等
            remove(i); // 把当前项加入操作数组（要删除）
            removeSimulate(j); // 把当前项从simulateList中移除
            // console.log(simulateList);
            j++; // newList下一项与simulateList下一项继续做比对
          } else {
            // 与simulateList下一项的key-value不等
            insert(i, item); // 加入操作数组（要新增）
          }
        }
      }
    } else {
      // simulateList被删除后，长度已不足newList（或原本的oldList为空，而newList不为空）
      insert(i, item); // 将剩余item（依次）加入操作数组（要新增）
    }
    i++;
  }

  // console.log(simulateList, i, j); // 6 4

  /* 3.移除simulateList中多余的元素 */
  let k = simulateList.length - j; // simulateList未循环元素的个数
  while (j++ < simulateList.length) {
    /* 循环未在simulateList中循环的元素，核心是计算要删除元素的下标：
      1.未循环的元素一定在simulateList的最后几位
      2.删除的是经过增/减项后的新数组的元素，而不是在simulateList里直接删除，因此需要结合newList的长度一并计算
    */
    k--;
    remove(k + i); // 加入操作数组（要删除）
  }

  function remove(index) {
    let move = { index: index, type: 0 }; // type为0是删除
    moves.push(move);
  }

  function insert(index, item) {
    let move = { index: index, item: item, type: 1 }; // type为1是新增
    moves.push(move);
  }

  function removeSimulate(index) {
    simulateList.splice(index, 1);
  }

  console.log(moves);
  /* 
  [
    { index: 3, type: 0 },
    { index: 0, item: { id: 'c' }, type: 1 },
    { index: 3, type: 0 },
    { index: 4, item: { id: 'f' }, type: 1 }
  ]
  */

  return {
    moves: moves,
    children: children,
  };
}

/**
 * Convert list to key-item keyIndex object.
 * @param {Array} list
 * @param {String|Function} key
 */
function makeKeyIndexAndFree(list, key) {
  let keyIndex = {};
  let free = [];
  for (let i = 0, len = list.length; i < len; i++) {
    let item = list[i];
    let itemKey = getItemKey(item, key);
    // console.log(itemKey);
    if (itemKey) {
      keyIndex[itemKey] = i;
    } else {
      free.push(item);
    }
  }

  return {
    keyIndex: keyIndex,
    free: free,
  };
}

function getItemKey(item, key) {
  if (!item || !key) return void 666;
  return typeof key === "string" ? item[key] : key(item);
}

let oldList = [
  { id: "a" },
  { id: "b" },
  { id: "c" },
  { id: "d" },
  { id: "e" },
  { key: 3 },
];
let newList = [
  { id: "c" },
  { id: "a" },
  { id: "b" },
  { id: "e" },
  { id: "f" },
  { value: 4 },
];
let key = "id";
listDiff(oldList, newList, key);
