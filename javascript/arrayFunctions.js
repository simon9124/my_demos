/* 数组扁平化 */
const arr = [1, [2, [3, 4], 5], 6];
const flattenedArr = [];
while (arr.length) {
  const next = arr.shift();
  if (Array.isArray(next)) {
    arr.unshift(...next);
  } else {
    flattenedArr.push(next);
  }
}

/* 数组排序 */
function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }
  const pivotIndex = Math.floor(arr.length / 2);
  const pivot = arr[pivotIndex];
  const left = [];
  const right = [];
  for (let i = 0; i < arr.length; i++) {
    if (i === pivotIndex) {
      continue;
    }
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}

/* 斐波拉契数列：用JS递归 */
function fib(n) {
  if (n === 1 || n === 2) return n - 1;
  return fib(n - 1) + fib(n - 2);
}

/* 爬楼梯：n个台阶，每次可走1或2个，有几种走法，用JS递归*/
function climbStairs(n) {
  if (n == 1) return 1;
  if (n == 2) return 2;
  return climbStairs(n - 1) + climbStairs(n - 2);
}

/* 深拷贝：用JS递归 */
function clone(o) {
  var temp = {};
  for (var key in o) {
    if (typeof o[key] == "object") {
      temp[key] = clone(o[key]);
    } else {
      temp[key] = o[key];
    }
  }
  return temp;
}
