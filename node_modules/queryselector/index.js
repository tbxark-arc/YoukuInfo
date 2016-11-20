var map = require('wrap-map');

module.exports = query;
module.exports.all = queryAll;

function query (el, selector) {
  return select(el, selector);
}

function queryAll (el, selector) {
  return select(el, selector, true);
}

function select (el, selector, all) {
  var wrap = map[el.tagName.toLowerCase()] || map._default;
  var depth = wrap.depth;

  var container = document.createElement('div');
  container.innerHTML = wrap.prefix + wrap.suffix;

  while (depth--) container = container.childNodes[0];
  container.appendChild(el);

  return container[all
    ? 'querySelectorAll'
    : 'querySelector'](selector);
}
