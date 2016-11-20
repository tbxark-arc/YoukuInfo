
# wrap-map

Wrap map from jQuery.

## Usage

```js
var map = require('wrap-map');

console.log(map);

/* =>
{ option:
   { depth: 1,
     prefix: '<select multiple="multiple">',
     suffix: '</select>' },
  optgroup:
   { depth: 1,
     prefix: '<select multiple="multiple">',
     suffix: '</select>' },
  legend:
   { depth: 1,
     prefix: '<fieldset>',
     suffix: '</fieldset>' },
  tr:
   { depth: 2,
     prefix: '<table><tbody>',
     suffix: '</tbody></table>' },
  col:
   { depth: 2,
     prefix: '<table><tbody></tbody><colgroup>',
     suffix: '</colgroup></table>' },
  _default:
   { depth: 0,
     prefix: '',
     suffix: '' },
  caption:
   { depth: 1,
     prefix: '<table>',
     suffix: '</table>' },
  colgroup:
   { depth: 1,
     prefix: '<table>',
     suffix: '</table>' },
  tfoot:
   { depth: 1,
     prefix: '<table>',
     suffix: '</table>' },
  tbody:
   { depth: 1,
     prefix: '<table>',
     suffix: '</table>' },
  thead:
   { depth: 1,
     prefix: '<table>',
     suffix: '</table>' },
  th:
   { depth: 3,
     prefix: '<table><tbody><tr>',
     suffix: '</tr></tbody></table>' },
  td:
   { depth: 3,
     prefix: '<table><tbody><tr>',
     suffix: '</tr></tbody></table>' } }
*/
```

## Installation

With [npm](http://npmjs.org) do

```bash
$ npm install wrap-map
```

With [component](http://component.io) do

```bash
$ component install juliangruber/wrap-map
```

## License

(MIT)

Copyright (c) 2013 Julian Gruber &lt;julian@juliangruber.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
