
# queryselector

A version of `el.querySelector{All}` that also matches `el` itself.

[![build status](https://secure.travis-ci.org/juliangruber/queryselector.png)](http://travis-ci.org/juliangruber/queryselector)

## Usage

Create a `<div>` and a `<div>` inside that and match both with the selector
`div`.

```js
var query = require('queryselector');

var div = document.createElement('div');
var child = document.createElement('div');
div.appendChild(child);

var elements = query.all(div, 'div');

for (var i = 0; i < elements.length; i++) {
  console.log('found div');
};
```

And run it in a browser or with
[browser-run](https://github.com/juliangruber/browser-run):

```bash
$ browserify example/simple.js | browser-run
found div
found div
^C
```

## API

### query(el, selector)

Returns the first match of `selector` on `el` and its children.

### query.all(el, selector)

Returns all matches of `selector` on `el` and its children.

## Installation

With [npm](http://npmjs.org) do

```bash
$ npm install queryselector
```

Then bundle for the browser with
[browserify](https://github.com/substack/browserify).

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
