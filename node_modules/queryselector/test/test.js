var test = require('tape');
var query = require('../');

test('single element', function (t) {
  t.plan(3);

  var el = document.createElement('div');

  t.equal(query(el, 'div'), el);
  t.equal(query.all(el, 'div').length, 1);
  t.equal(query.all(el, 'div')[0], el);
});

test('nested elements', function (t) {
  t.plan(4);

  var container = document.createElement('div');

  var child1 = document.createElement('div');
  container.appendChild(child1);

  var child2 = document.createElement('div');
  container.appendChild(child2);

  var selection = query.all(container, 'div');

  t.equal(selection.length, 3);
  t.equal(selection[0], container);
  t.equal(selection[1], child1);
  t.equal(selection[2], child2);
});
