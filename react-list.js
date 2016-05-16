'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var findDOMNode = _reactDom2.default.findDOMNode;


var isEqualSubset = function isEqualSubset(a, b) {
  for (var key in a) {
    if (a[key] !== b[key]) return false;
  }return true;
};

var isEqual = function isEqual(a, b) {
  return isEqualSubset(a, b) && isEqualSubset(b, a);
};

var CLIENT_SIZE_KEYS = { x: 'clientWidth', y: 'clientHeight' };
var CLIENT_START_KEYS = { x: 'clientTop', y: 'clientLeft' };
var INNER_SIZE_KEYS = { x: 'innerWidth', y: 'innerHeight' };
var OFFSET_SIZE_KEYS = { x: 'offsetWidth', y: 'offsetHeight' };
var OFFSET_START_KEYS = { x: 'offsetLeft', y: 'offsetTop' };
var OVERFLOW_KEYS = { x: 'overflowX', y: 'overflowY' };
var SCROLL_SIZE_KEYS = { x: 'scrollWidth', y: 'scrollHeight' };
var SCROLL_START_KEYS = { x: 'scrollLeft', y: 'scrollTop' };
var SIZE_KEYS = { x: 'width', y: 'height' };

var NOOP = function NOOP() {};

var _class = function (_Component) {
  _inherits(_class, _Component);

  function _class(props) {
    _classCallCheck(this, _class);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, props));

    var _this$props = _this.props;
    var initialIndex = _this$props.initialIndex;
    var pageSize = _this$props.pageSize;

    var itemsPerRow = 1;

    var _this$constrain = _this.constrain(initialIndex, pageSize, itemsPerRow, _this.props);

    var from = _this$constrain.from;
    var size = _this$constrain.size;

    _this.state = { from: from, size: size, itemsPerRow: itemsPerRow };
    _this.cache = {};
    return _this;
  }

  _createClass(_class, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(next) {
      var _state = this.state;
      var from = _state.from;
      var size = _state.size;
      var itemsPerRow = _state.itemsPerRow;

      this.setState(this.constrain(from, size, itemsPerRow, next));
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.updateFrame = this.updateFrame.bind(this);
      window.addEventListener('resize', this.updateFrame);
      this.updateFrame(this.scrollTo.bind(this, this.props.initialIndex));
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(props, state) {
      return !isEqual(props, this.props) || !isEqual(state, this.state);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.updateFrame();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      window.removeEventListener('resize', this.updateFrame);
      this.scrollParent.removeEventListener('scroll', this.updateFrame);
      this.scrollParent.removeEventListener('mousewheel', NOOP);
    }
  }, {
    key: 'getOffset',
    value: function getOffset(el) {
      var axis = this.props.axis;

      var offset = el[CLIENT_START_KEYS[axis]] || 0;
      var offsetKey = OFFSET_START_KEYS[axis];
      do {
        offset += el[offsetKey] || 0;
      } while (el = el.offsetParent);
      return offset;
    }
  }, {
    key: 'getScrollParent',
    value: function getScrollParent() {
      var _props = this.props;
      var axis = _props.axis;
      var scrollParentGetter = _props.scrollParentGetter;

      if (scrollParentGetter) return scrollParentGetter();
      var el = findDOMNode(this);
      var overflowKey = OVERFLOW_KEYS[axis];
      while (el = el.parentElement) {
        switch (window.getComputedStyle(el)[overflowKey]) {
          case 'auto':case 'scroll':case 'overlay':
            return el;
        }
      }
      return window;
    }
  }, {
    key: 'getScroll',
    value: function getScroll() {
      var scrollParent = this.scrollParent;
      var axis = this.props.axis;

      var scrollKey = SCROLL_START_KEYS[axis];
      var actual = scrollParent === window ?
      // Firefox always returns document.body[scrollKey] as 0 and Chrome/Safari
      // always return document.documentElement[scrollKey] as 0, so take
      // whichever has a value.
      document.body[scrollKey] || document.documentElement[scrollKey] : scrollParent[scrollKey];
      var max = this.getScrollSize() - this.getViewportSize();
      var scroll = Math.max(0, Math.min(actual, max));
      var el = findDOMNode(this);
      return this.getOffset(scrollParent) + scroll - this.getOffset(el);
    }
  }, {
    key: 'setScroll',
    value: function setScroll(offset) {
      var scrollParent = this.scrollParent;
      var axis = this.props.axis;

      offset += this.getOffset(findDOMNode(this));
      if (scrollParent === window) return window.scrollTo(0, offset);

      offset -= this.getOffset(this.scrollParent);
      scrollParent[SCROLL_START_KEYS[axis]] = offset;
    }
  }, {
    key: 'getViewportSize',
    value: function getViewportSize() {
      var scrollParent = this.scrollParent;
      var axis = this.props.axis;

      return scrollParent === window ? window[INNER_SIZE_KEYS[axis]] : scrollParent[CLIENT_SIZE_KEYS[axis]];
    }
  }, {
    key: 'getScrollSize',
    value: function getScrollSize() {
      var scrollParent = this.scrollParent;
      var axis = this.props.axis;

      return scrollParent === window ? document.body[SCROLL_SIZE_KEYS[axis]] : scrollParent[SCROLL_SIZE_KEYS[axis]];
    }
  }, {
    key: 'hasDeterminateSize',
    value: function hasDeterminateSize() {
      var _props2 = this.props;
      var itemSizeGetter = _props2.itemSizeGetter;
      var type = _props2.type;

      return type === 'uniform' || itemSizeGetter;
    }
  }, {
    key: 'getStartAndEnd',
    value: function getStartAndEnd() {
      var threshold = arguments.length <= 0 || arguments[0] === undefined ? this.props.threshold : arguments[0];

      var scroll = this.getScroll();
      var start = Math.max(0, scroll - threshold);
      var end = scroll + this.getViewportSize() + threshold;
      if (this.hasDeterminateSize()) {
        end = Math.min(end, this.getSpaceBefore(this.props.length));
      }
      return { start: start, end: end };
    }
  }, {
    key: 'getItemSizeAndItemsPerRow',
    value: function getItemSizeAndItemsPerRow() {
      var itemEls = findDOMNode(this.items).children;
      if (!itemEls.length) return {};

      var firstEl = itemEls[0];

      // Firefox has a problem where it will return a *slightly* (less than
      // thousandths of a pixel) different size for the same element between
      // renders. This can cause an infinite render loop, so only change the
      // itemSize when it is significantly different.
      var itemSize = this.state.itemSize;
      var axis = this.props.axis;

      var firstElSize = firstEl[OFFSET_SIZE_KEYS[axis]];
      var delta = Math.abs(firstElSize - itemSize);
      if (isNaN(delta) || delta >= 1) itemSize = firstElSize;

      if (!itemSize) return {};

      var startKey = OFFSET_START_KEYS[axis];
      var firstStart = firstEl[startKey];
      var itemsPerRow = 1;
      for (var item = itemEls[itemsPerRow]; item && item[startKey] === firstStart; item = itemEls[itemsPerRow]) {
        ++itemsPerRow;
      }return { itemSize: itemSize, itemsPerRow: itemsPerRow };
    }
  }, {
    key: 'updateFrame',
    value: function updateFrame(cb) {
      var _this2 = this;

      setTimeout(function () {
        return _this2.doUpdateFrame(cb);
      }, 0);
    }
  }, {
    key: 'doUpdateFrame',
    value: function doUpdateFrame(cb) {
      this.updateScrollParent();
      if (typeof cb != 'function') cb = NOOP;
      switch (this.props.type) {
        case 'simple':
          return this.updateSimpleFrame(cb);
        case 'variable':
          return this.updateVariableFrame(cb);
        case 'uniform':
          return this.updateUniformFrame(cb);
      }
    }
  }, {
    key: 'updateScrollParent',
    value: function updateScrollParent() {
      var prev = this.scrollParent;
      this.scrollParent = this.getScrollParent();
      if (prev === this.scrollParent) return;
      if (prev) {
        prev.removeEventListener('scroll', this.updateFrame);
        prev.removeEventListener('mousewheel', NOOP);
      }
      this.scrollParent.addEventListener('scroll', this.updateFrame);
      this.scrollParent.addEventListener('mousewheel', NOOP);
    }
  }, {
    key: 'updateSimpleFrame',
    value: function updateSimpleFrame(cb) {
      var _getStartAndEnd = this.getStartAndEnd();

      var end = _getStartAndEnd.end;

      var itemEls = findDOMNode(this.items).children;
      var elEnd = 0;

      if (itemEls.length) {
        var axis = this.props.axis;

        var firstItemEl = itemEls[0];
        var lastItemEl = itemEls[itemEls.length - 1];
        elEnd = this.getOffset(lastItemEl) + lastItemEl[OFFSET_SIZE_KEYS[axis]] - this.getOffset(firstItemEl);
      }

      if (elEnd > end) return cb();

      var _props3 = this.props;
      var pageSize = _props3.pageSize;
      var length = _props3.length;

      this.setState({ size: Math.min(this.state.size + pageSize, length) }, cb);
    }
  }, {
    key: 'updateVariableFrame',
    value: function updateVariableFrame(cb) {
      if (!this.props.itemSizeGetter) this.cacheSizes();

      var _getStartAndEnd2 = this.getStartAndEnd();

      var start = _getStartAndEnd2.start;
      var end = _getStartAndEnd2.end;
      var _props4 = this.props;
      var length = _props4.length;
      var pageSize = _props4.pageSize;

      var space = 0;
      var from = 0;
      var size = 0;
      var maxFrom = length - 1;

      while (from < maxFrom) {
        var itemSize = this.getSizeOf(from);
        if (itemSize == null || space + itemSize > start) break;
        space += itemSize;
        ++from;
      }

      var maxSize = length - from;

      while (size < maxSize && space < end) {
        var _itemSize = this.getSizeOf(from + size);
        if (_itemSize == null) {
          size = Math.min(size + pageSize, maxSize);
          break;
        }
        space += _itemSize;
        ++size;
      }

      this.setState({ from: from, size: size }, cb);
    }
  }, {
    key: 'updateUniformFrame',
    value: function updateUniformFrame(cb) {
      var _getItemSizeAndItemsP = this.getItemSizeAndItemsPerRow();

      var itemSize = _getItemSizeAndItemsP.itemSize;
      var itemsPerRow = _getItemSizeAndItemsP.itemsPerRow;


      if (!itemSize || !itemsPerRow) return cb();

      var _getStartAndEnd3 = this.getStartAndEnd();

      var start = _getStartAndEnd3.start;
      var end = _getStartAndEnd3.end;

      var _constrain = this.constrain(Math.floor(start / itemSize) * itemsPerRow, (Math.ceil((end - start) / itemSize) + 1) * itemsPerRow, itemsPerRow, this.props);

      var from = _constrain.from;
      var size = _constrain.size;


      return this.setState({ itemsPerRow: itemsPerRow, from: from, itemSize: itemSize, size: size }, cb);
    }
  }, {
    key: 'getSpaceBefore',
    value: function getSpaceBefore(index) {
      var cache = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if (cache[index] != null) return cache[index];

      // Try the static itemSize.
      var _state2 = this.state;
      var itemSize = _state2.itemSize;
      var itemsPerRow = _state2.itemsPerRow;

      if (itemSize) {
        return cache[index] = Math.floor(index / itemsPerRow) * itemSize;
      }

      // Find the closest space to index there is a cached value for.
      var from = index;
      while (from > 0 && cache[--from] == null) {}

      // Finally, accumulate sizes of items from - index.
      var space = cache[from] || 0;
      for (var i = from; i < index; ++i) {
        cache[i] = space;
        var _itemSize2 = this.getSizeOf(i);
        if (_itemSize2 == null) break;
        space += _itemSize2;
      }

      return cache[index] = space;
    }
  }, {
    key: 'cacheSizes',
    value: function cacheSizes() {
      var cache = this.cache;
      var from = this.state.from;

      var itemEls = findDOMNode(this.items).children;
      var sizeKey = OFFSET_SIZE_KEYS[this.props.axis];
      for (var i = 0, l = itemEls.length; i < l; ++i) {
        cache[from + i] = itemEls[i][sizeKey];
      }
    }
  }, {
    key: 'getSizeOf',
    value: function getSizeOf(index) {
      var cache = this.cache;
      var items = this.items;
      var _props5 = this.props;
      var axis = _props5.axis;
      var itemSizeGetter = _props5.itemSizeGetter;
      var type = _props5.type;
      var _state3 = this.state;
      var from = _state3.from;
      var itemSize = _state3.itemSize;
      var size = _state3.size;

      // Try the static itemSize.

      if (itemSize) return itemSize;

      // Try the itemSizeGetter.
      if (itemSizeGetter) return itemSizeGetter(index);

      // Try the cache.
      if (index in cache) return cache[index];

      // Try the DOM.
      if (type === 'simple' && index >= from && index < from + size && items) {
        var itemEl = findDOMNode(items).children[index - from];
        if (itemEl) return itemEl[OFFSET_SIZE_KEYS[axis]];
      }
    }
  }, {
    key: 'constrain',
    value: function constrain(from, size, itemsPerRow, _ref) {
      var length = _ref.length;
      var pageSize = _ref.pageSize;
      var type = _ref.type;

      size = Math.max(size, pageSize);
      var mod = size % itemsPerRow;
      if (mod) size += itemsPerRow - mod;
      if (size > length) size = length;
      from = type === 'simple' || !from ? 0 : Math.max(Math.min(from, length - size), 0);

      if (mod = from % itemsPerRow) {
        from -= mod;
        size += mod;
      }

      return { from: from, size: size };
    }
  }, {
    key: 'scrollTo',
    value: function scrollTo(index) {
      if (index != null) this.setScroll(this.getSpaceBefore(index));
    }
  }, {
    key: 'scrollAround',
    value: function scrollAround(index) {
      var current = this.getScroll();
      var bottom = this.getSpaceBefore(index);
      var top = bottom - this.getViewportSize() + this.getSizeOf(index);
      var min = Math.min(top, bottom);
      var max = Math.max(top, bottom);
      if (current <= min) return this.setScroll(min);
      if (current > max) return this.setScroll(max);
    }
  }, {
    key: 'getVisibleRange',
    value: function getVisibleRange() {
      var _state4 = this.state;
      var from = _state4.from;
      var size = _state4.size;

      var _getStartAndEnd4 = this.getStartAndEnd(0);

      var start = _getStartAndEnd4.start;
      var end = _getStartAndEnd4.end;

      var cache = {};
      var first = void 0,
          last = void 0;
      for (var i = from; i < from + size; ++i) {
        var itemStart = this.getSpaceBefore(i, cache);
        var itemEnd = itemStart + this.getSizeOf(i);
        if (first == null && itemEnd > start) first = i;
        if (first != null && itemStart < end) last = i;
      }
      return [first, last];
    }
  }, {
    key: 'renderItems',
    value: function renderItems() {
      var _this3 = this;

      var _props6 = this.props;
      var itemRenderer = _props6.itemRenderer;
      var itemsRenderer = _props6.itemsRenderer;
      var _state5 = this.state;
      var from = _state5.from;
      var size = _state5.size;

      var items = [];
      for (var i = 0; i < size; ++i) {
        items.push(itemRenderer(from + i, i));
      }return itemsRenderer(items, function (c) {
        return _this3.items = c;
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _props7 = this.props;
      var axis = _props7.axis;
      var length = _props7.length;
      var type = _props7.type;
      var useTranslate3d = _props7.useTranslate3d;
      var _state6 = this.state;
      var from = _state6.from;
      var itemsPerRow = _state6.itemsPerRow;


      var items = this.renderItems();
      if (type === 'simple') return items;

      var style = { position: 'relative' };
      var cache = {};
      var bottom = Math.ceil(length / itemsPerRow) * itemsPerRow;
      var size = this.getSpaceBefore(bottom, cache);
      if (size) {
        style[SIZE_KEYS[axis]] = size;
        if (axis === 'x') style.overflowX = 'hidden';
      }
      var offset = this.getSpaceBefore(from, cache);
      var x = axis === 'x' ? offset : 0;
      var y = axis === 'y' ? offset : 0;
      var transform = useTranslate3d ? 'translate3d(' + x + 'px, ' + y + 'px, 0)' : 'translate(' + x + 'px, ' + y + 'px)';
      var listStyle = {
        msTransform: transform,
        WebkitTransform: transform,
        transform: transform
      };
      return _react2.default.createElement(
        'div',
        { style: style },
        _react2.default.createElement(
          'div',
          { style: listStyle },
          items
        )
      );
    }
  }]);

  return _class;
}(_react.Component);

_class.displayName = 'ReactList';
_class.propTypes = {
  axis: _react.PropTypes.oneOf(['x', 'y']),
  initialIndex: _react.PropTypes.number,
  itemSizeGetter: _react.PropTypes.func,
  itemRenderer: _react.PropTypes.func,
  itemsRenderer: _react.PropTypes.func,
  length: _react.PropTypes.number,
  pageSize: _react.PropTypes.number,
  scrollParentGetter: _react.PropTypes.func,
  threshold: _react.PropTypes.number,
  type: _react.PropTypes.oneOf(['simple', 'variable', 'uniform']),
  useTranslate3d: _react.PropTypes.bool
};
_class.defaultProps = {
  axis: 'y',
  initialIndex: null,
  itemSizeGetter: null,
  itemRenderer: function itemRenderer(index, key) {
    return _react2.default.createElement(
      'div',
      { key: key },
      index
    );
  },
  itemsRenderer: function itemsRenderer(items, ref) {
    return _react2.default.createElement(
      'div',
      { ref: ref },
      items
    );
  },
  length: 0,
  pageSize: 10,
  scrollParentGetter: null,
  threshold: 100,
  type: 'simple',
  useTranslate3d: false
};
exports.default = _class;