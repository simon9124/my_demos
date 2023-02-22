/*
var el = require('./element');

var element = el('div', {id: 'container', class: 'container'}, [
  el('ul', {id: 'list'},[
    el('li', {class: 'item'}, ['111']),
    el('li', {class: 'item'}, ['222']),
    el('li', {class: 'item'}, ['333']),
  ]),
  el('button', {class: 'btn btn-blue'}, [
    el('em', {class: ''}, ['提交'])
  ])
]);

var elemRoot = element.render();
document.body.appendChild(elemRoot);
*/

var el = require('./element');
var diff = require('./diff');
var patch = require('./patch');

var count = 0;
function renderTree() {
  count++;
  var items = [];
  var color = (count % 2 === 0) ? 'blue' : 'red';
  for (var i = 0; i < count; i++) {
    items.push(el('li', ['Item #' + i]));
  }
  return el('div', {'id': 'container'}, [
    el('h1', {style: 'color: ' + color}, ['simple virtal dom']),
    el('p', ['the count is :' + count]),
    el('ul', items)
  ]);
}

var oldTree = renderTree()
var root = oldTree.render()
document.body.appendChild(root)
setInterval(function () {
  var newTree = renderTree()
  var patches = diff(oldTree, newTree)
  console.log(patches)
  patch(root, patches)
  oldTree = newTree;
}, 1000);
