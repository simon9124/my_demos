不断更新一些小demo：
======

CSS盒子模型：
------
<a href="http://blog.csdn.net/simon9124/article/details/78935788" target="_blank">5种方式实现CSS元素水平居中，实用又简单！</a><br>

var aTagArr = [].slice.apply(document.getElementsByTagName("a"));

aTagArr.forEach(function (e, i) {
  e.href.indexOf("_blank") > -1 ? e.target = "_blank" : null;
});
