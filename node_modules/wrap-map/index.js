
/**
 * Wrap map.
 */

var map = {
  option: {
    depth: 1,
    prefix: '<select multiple="multiple">',
    suffix: '</select>'
  },
  optgroup: {
    depth: 1,
    prefix: '<select multiple="multiple">',
    suffix: '</select>'
  },
  legend: {
    depth: 1,
    prefix: '<fieldset>',
    suffix: '</fieldset>'
  },
  tr: {
    depth: 2,
    prefix: '<table><tbody>',
    suffix: '</tbody></table>'
  },
  col: {
    depth: 2,
    prefix: '<table><tbody></tbody><colgroup>',
    suffix: '</colgroup></table>'
  },
  _default: {
    depth: 0,
    prefix: '',
    suffix: ''
  }
};

map.thead = map.tbody = map.tfoot = map.colgroup = map.caption = {
  depth: 1,
  prefix: '<table>',
  suffix: '</table>'
};

map.td = map.th = {
  depth: 3,
  prefix: '<table><tbody><tr>',
  suffix: '</tr></tbody></table>'
};

/**
 * Expose `map`.
 */

module.exports = map;

