var query = require('../');

var div = document.createElement('div');
var child = document.createElement('div');
div.appendChild(child);

var elements = query.all(div, 'div');

for (var i = 0; i < elements.length; i++) {
  console.log('found div');
};
