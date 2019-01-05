'use babel';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('atom');

var Range = _require.Range;
var Point = _require.Point;

// [TODO] Need overhaul
//  - [ ] Make expandable by selection.getBufferRange().union(this.getRange(selection))
//  - [ ] Count support(priority low)?
var Base = require('./base');
var PairFinder = require('./pair-finder');

var TextObject = (function (_Base) {
  _inherits(TextObject, _Base);

  function TextObject() {
    _classCallCheck(this, TextObject);

    _get(Object.getPrototypeOf(TextObject.prototype), 'constructor', this).apply(this, arguments);

    this.operator = null;
    this.wise = 'characterwise';
    this.supportCount = false;
    this.selectOnce = false;
    this.selectSucceeded = false;
  }

  // Section: Word
  // =========================

  _createClass(TextObject, [{
    key: 'isInner',
    value: function isInner() {
      return this.inner;
    }
  }, {
    key: 'isA',
    value: function isA() {
      return !this.inner;
    }
  }, {
    key: 'isLinewise',
    value: function isLinewise() {
      return this.wise === 'linewise';
    }
  }, {
    key: 'isBlockwise',
    value: function isBlockwise() {
      return this.wise === 'blockwise';
    }
  }, {
    key: 'forceWise',
    value: function forceWise(wise) {
      return this.wise = wise; // FIXME currently not well supported
    }
  }, {
    key: 'resetState',
    value: function resetState() {
      this.selectSucceeded = false;
    }

    // execute: Called from Operator::selectTarget()
    //  - `v i p`, is `VisualModeSelect` operator with @target = `InnerParagraph`.
    //  - `d i p`, is `Delete` operator with @target = `InnerParagraph`.
  }, {
    key: 'execute',
    value: function execute() {
      // Whennever TextObject is executed, it has @operator
      if (!this.operator) throw new Error('in TextObject: Must not happen');
      this.select();
    }
  }, {
    key: 'select',
    value: function select() {
      var _this = this;

      if (this.isMode('visual', 'blockwise')) {
        this.swrap.normalize(this.editor);
      }

      this.countTimes(this.getCount(), function (_ref2) {
        var stop = _ref2.stop;

        if (!_this.supportCount) stop(); // quick-fix for #560

        for (var selection of _this.editor.getSelections()) {
          var oldRange = selection.getBufferRange();
          if (_this.selectTextObject(selection)) _this.selectSucceeded = true;
          if (selection.getBufferRange().isEqual(oldRange)) stop();
          if (_this.selectOnce) break;
        }
      });

      this.editor.mergeIntersectingSelections();
      // Some TextObject's wise is NOT deterministic. It has to be detected from selected range.
      if (this.wise == null) this.wise = this.swrap.detectWise(this.editor);

      if (this.operator['instanceof']('SelectBase')) {
        if (this.selectSucceeded) {
          if (this.wise === 'characterwise') {
            this.swrap.saveProperties(this.editor, { force: true });
          } else if (this.wise === 'linewise') {
            // When target is persistent-selection, new selection is added after selectTextObject.
            // So we have to assure all selection have selction property.
            // Maybe this logic can be moved to operation stack.
            for (var $selection of this.swrap.getSelections(this.editor)) {
              if (this.getConfig('stayOnSelectTextObject')) {
                if (!$selection.hasProperties()) {
                  $selection.saveProperties();
                }
              } else {
                $selection.saveProperties();
              }
              $selection.fixPropertyRowToRowRange();
            }
          }
        }

        if (this.submode === 'blockwise') {
          for (var $selection of this.swrap.getSelections(this.editor)) {
            $selection.normalize();
            $selection.applyWise('blockwise');
          }
        }
      }
    }

    // Return true or false
  }, {
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      var range = this.getRange(selection);
      if (range) {
        this.swrap(selection).setBufferRange(range);
        return true;
      } else {
        return false;
      }
    }

    // to override
  }, {
    key: 'getRange',
    value: function getRange(selection) {}
  }], [{
    key: 'deriveClass',
    value: function deriveClass(innerAndA, innerAndAForAllowForwarding) {
      this.command = false; // HACK: klass to derive child class is not command
      var store = {};
      if (innerAndA) {
        var klassA = this.generateClass(false);
        var klassI = this.generateClass(true);
        store[klassA.name] = klassA;
        store[klassI.name] = klassI;
      }
      if (innerAndAForAllowForwarding) {
        var klassA = this.generateClass(false, true);
        var klassI = this.generateClass(true, true);
        store[klassA.name] = klassA;
        store[klassI.name] = klassI;
      }
      return store;
    }
  }, {
    key: 'generateClass',
    value: function generateClass(inner, allowForwarding) {
      var name = (inner ? 'Inner' : 'A') + this.name;
      if (allowForwarding) {
        name += 'AllowForwarding';
      }

      return (function (_ref) {
        _inherits(_class, _ref);

        _createClass(_class, null, [{
          key: 'name',
          value: name,
          enumerable: true
        }]);

        function _class(vimState) {
          _classCallCheck(this, _class);

          _get(Object.getPrototypeOf(_class.prototype), 'constructor', this).call(this, vimState);
          this.inner = inner;
          if (allowForwarding != null) {
            this.allowForwarding = allowForwarding;
          }
        }

        return _class;
      })(this);
    }
  }, {
    key: 'operationKind',
    value: 'text-object',
    enumerable: true
  }, {
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return TextObject;
})(Base);

var Word = (function (_TextObject) {
  _inherits(Word, _TextObject);

  function Word() {
    _classCallCheck(this, Word);

    _get(Object.getPrototypeOf(Word.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Word, [{
    key: 'getRange',
    value: function getRange(selection) {
      var point = this.getCursorPositionForSelection(selection);

      var _getWordBufferRangeAndKindAtBufferPosition = this.getWordBufferRangeAndKindAtBufferPosition(point, { wordRegex: this.wordRegex });

      var range = _getWordBufferRangeAndKindAtBufferPosition.range;

      return this.isA() ? this.utils.expandRangeToWhiteSpaces(this.editor, range) : range;
    }
  }]);

  return Word;
})(TextObject);

var WholeWord = (function (_Word) {
  _inherits(WholeWord, _Word);

  function WholeWord() {
    _classCallCheck(this, WholeWord);

    _get(Object.getPrototypeOf(WholeWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /\S+/;
  }

  // Just include _, -
  return WholeWord;
})(Word);

var SmartWord = (function (_Word2) {
  _inherits(SmartWord, _Word2);

  function SmartWord() {
    _classCallCheck(this, SmartWord);

    _get(Object.getPrototypeOf(SmartWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /[\w-]+/;
  }

  // Just include _, -
  return SmartWord;
})(Word);

var Subword = (function (_Word3) {
  _inherits(Subword, _Word3);

  function Subword() {
    _classCallCheck(this, Subword);

    _get(Object.getPrototypeOf(Subword.prototype), 'constructor', this).apply(this, arguments);
  }

  // Section: Pair
  // =========================

  _createClass(Subword, [{
    key: 'getRange',
    value: function getRange(selection) {
      this.wordRegex = selection.cursor.subwordRegExp();
      return _get(Object.getPrototypeOf(Subword.prototype), 'getRange', this).call(this, selection);
    }
  }]);

  return Subword;
})(Word);

var Pair = (function (_TextObject2) {
  _inherits(Pair, _TextObject2);

  function Pair() {
    _classCallCheck(this, Pair);

    _get(Object.getPrototypeOf(Pair.prototype), 'constructor', this).apply(this, arguments);

    this.supportCount = true;
    this.allowNextLine = null;
    this.adjustInnerRange = true;
    this.pair = null;
    this.inclusive = true;
  }

  // Used by DeleteSurround

  _createClass(Pair, [{
    key: 'isAllowNextLine',
    value: function isAllowNextLine() {
      if (this.allowNextLine != null) {
        return this.allowNextLine;
      } else {
        return this.pair && this.pair[0] !== this.pair[1];
      }
    }
  }, {
    key: 'adjustRange',
    value: function adjustRange(_ref3) {
      var start = _ref3.start;
      var end = _ref3.end;

      // Dirty work to feel natural for human, to behave compatible with pure Vim.
      // Where this adjustment appear is in following situation.
      // op-1: `ci{` replace only 2nd line
      // op-2: `di{` delete only 2nd line.
      // text:
      //  {
      //    aaa
      //  }
      if (this.utils.pointIsAtEndOfLine(this.editor, start)) {
        start = start.traverse([1, 0]);
      }

      if (this.utils.getLineTextToBufferPosition(this.editor, end).match(/^\s*$/)) {
        if (this.mode === 'visual') {
          // This is slightly innconsistent with regular Vim
          // - regular Vim: select new line after EOL
          // - vim-mode-plus: select to EOL(before new line)
          // This is intentional since to make submode `characterwise` when auto-detect submode
          // innerEnd = new Point(innerEnd.row - 1, Infinity)
          end = new Point(end.row - 1, Infinity);
        } else {
          end = new Point(end.row, 0);
        }
      }
      return new Range(start, end);
    }
  }, {
    key: 'getFinder',
    value: function getFinder() {
      var finderName = this.pair[0] === this.pair[1] ? 'QuoteFinder' : 'BracketFinder';
      return new PairFinder[finderName](this.editor, {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding,
        pair: this.pair,
        inclusive: this.inclusive
      });
    }
  }, {
    key: 'getPairInfo',
    value: function getPairInfo(from) {
      var pairInfo = this.getFinder().find(from);
      if (pairInfo) {
        if (this.adjustInnerRange) {
          pairInfo.innerRange = this.adjustRange(pairInfo.innerRange);
        }
        pairInfo.targetRange = this.isInner() ? pairInfo.innerRange : pairInfo.aRange;
        return pairInfo;
      }
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var originalRange = selection.getBufferRange();
      var pairInfo = this.getPairInfo(this.getCursorPositionForSelection(selection));
      // When range was same, try to expand range
      if (pairInfo && pairInfo.targetRange.isEqual(originalRange)) {
        pairInfo = this.getPairInfo(pairInfo.aRange.end);
      }
      if (pairInfo) {
        return pairInfo.targetRange;
      }
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return Pair;
})(TextObject);

var APair = (function (_Pair) {
  _inherits(APair, _Pair);

  function APair() {
    _classCallCheck(this, APair);

    _get(Object.getPrototypeOf(APair.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(APair, null, [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return APair;
})(Pair);

var AnyPair = (function (_Pair2) {
  _inherits(AnyPair, _Pair2);

  function AnyPair() {
    _classCallCheck(this, AnyPair);

    _get(Object.getPrototypeOf(AnyPair.prototype), 'constructor', this).apply(this, arguments);

    this.allowForwarding = false;
    this.member = ['DoubleQuote', 'SingleQuote', 'BackTick', 'CurlyBracket', 'AngleBracket', 'SquareBracket', 'Parenthesis'];
  }

  _createClass(AnyPair, [{
    key: 'getRanges',
    value: function getRanges(selection) {
      var _this2 = this;

      var options = {
        inner: this.inner,
        allowForwarding: this.allowForwarding,
        inclusive: this.inclusive
      };
      var getRangeByMember = function getRangeByMember(member) {
        return _this2.getInstance(member, options).getRange(selection);
      };
      return this.member.map(getRangeByMember).filter(function (v) {
        return v;
      });
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      return this.utils.sortRanges(this.getRanges(selection)).pop();
    }
  }]);

  return AnyPair;
})(Pair);

var AnyPairAllowForwarding = (function (_AnyPair) {
  _inherits(AnyPairAllowForwarding, _AnyPair);

  function AnyPairAllowForwarding() {
    _classCallCheck(this, AnyPairAllowForwarding);

    _get(Object.getPrototypeOf(AnyPairAllowForwarding.prototype), 'constructor', this).apply(this, arguments);

    this.allowForwarding = true;
  }

  _createClass(AnyPairAllowForwarding, [{
    key: 'getRange',
    value: function getRange(selection) {
      var ranges = this.getRanges(selection);
      var from = selection.cursor.getBufferPosition();

      var _$partition = this._.partition(ranges, function (range) {
        return range.start.isGreaterThanOrEqual(from);
      });

      var _$partition2 = _slicedToArray(_$partition, 2);

      var forwardingRanges = _$partition2[0];
      var enclosingRanges = _$partition2[1];

      var enclosingRange = this.utils.sortRanges(enclosingRanges).pop();
      forwardingRanges = this.utils.sortRanges(forwardingRanges);

      // When enclosingRange is exists,
      // We don't go across enclosingRange.end.
      // So choose from ranges contained in enclosingRange.
      if (enclosingRange) {
        forwardingRanges = forwardingRanges.filter(function (range) {
          return enclosingRange.containsRange(range);
        });
      }

      return forwardingRanges[0] || enclosingRange;
    }
  }]);

  return AnyPairAllowForwarding;
})(AnyPair);

var AnyQuote = (function (_AnyPair2) {
  _inherits(AnyQuote, _AnyPair2);

  function AnyQuote() {
    _classCallCheck(this, AnyQuote);

    _get(Object.getPrototypeOf(AnyQuote.prototype), 'constructor', this).apply(this, arguments);

    this.allowForwarding = true;
    this.member = ['DoubleQuote', 'SingleQuote', 'BackTick'];
  }

  _createClass(AnyQuote, [{
    key: 'getRange',
    value: function getRange(selection) {
      // Pick range which end.colum is leftmost(mean, closed first)
      return this.getRanges(selection).sort(function (a, b) {
        return a.end.column - b.end.column;
      })[0];
    }
  }]);

  return AnyQuote;
})(AnyPair);

var Quote = (function (_Pair3) {
  _inherits(Quote, _Pair3);

  function Quote() {
    _classCallCheck(this, Quote);

    _get(Object.getPrototypeOf(Quote.prototype), 'constructor', this).apply(this, arguments);

    this.allowForwarding = true;
  }

  _createClass(Quote, null, [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return Quote;
})(Pair);

var DoubleQuote = (function (_Quote) {
  _inherits(DoubleQuote, _Quote);

  function DoubleQuote() {
    _classCallCheck(this, DoubleQuote);

    _get(Object.getPrototypeOf(DoubleQuote.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['"', '"'];
  }

  return DoubleQuote;
})(Quote);

var SingleQuote = (function (_Quote2) {
  _inherits(SingleQuote, _Quote2);

  function SingleQuote() {
    _classCallCheck(this, SingleQuote);

    _get(Object.getPrototypeOf(SingleQuote.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ["'", "'"];
  }

  return SingleQuote;
})(Quote);

var BackTick = (function (_Quote3) {
  _inherits(BackTick, _Quote3);

  function BackTick() {
    _classCallCheck(this, BackTick);

    _get(Object.getPrototypeOf(BackTick.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['`', '`'];
  }

  return BackTick;
})(Quote);

var CurlyBracket = (function (_Pair4) {
  _inherits(CurlyBracket, _Pair4);

  function CurlyBracket() {
    _classCallCheck(this, CurlyBracket);

    _get(Object.getPrototypeOf(CurlyBracket.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['{', '}'];
  }

  return CurlyBracket;
})(Pair);

var SquareBracket = (function (_Pair5) {
  _inherits(SquareBracket, _Pair5);

  function SquareBracket() {
    _classCallCheck(this, SquareBracket);

    _get(Object.getPrototypeOf(SquareBracket.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['[', ']'];
  }

  return SquareBracket;
})(Pair);

var Parenthesis = (function (_Pair6) {
  _inherits(Parenthesis, _Pair6);

  function Parenthesis() {
    _classCallCheck(this, Parenthesis);

    _get(Object.getPrototypeOf(Parenthesis.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['(', ')'];
  }

  return Parenthesis;
})(Pair);

var AngleBracket = (function (_Pair7) {
  _inherits(AngleBracket, _Pair7);

  function AngleBracket() {
    _classCallCheck(this, AngleBracket);

    _get(Object.getPrototypeOf(AngleBracket.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['<', '>'];
  }

  return AngleBracket;
})(Pair);

var Tag = (function (_Pair8) {
  _inherits(Tag, _Pair8);

  function Tag() {
    _classCallCheck(this, Tag);

    _get(Object.getPrototypeOf(Tag.prototype), 'constructor', this).apply(this, arguments);

    this.allowNextLine = true;
    this.allowForwarding = true;
    this.adjustInnerRange = false;
  }

  // Section: Paragraph
  // =========================
  // Paragraph is defined as consecutive (non-)blank-line.

  _createClass(Tag, [{
    key: 'getTagStartPoint',
    value: function getTagStartPoint(from) {
      var regex = PairFinder.TagFinder.pattern;
      var options = { from: [from.row, 0] };
      return this.findInEditor('forward', regex, options, function (_ref4) {
        var range = _ref4.range;
        return range.containsPoint(from, true) && range.start;
      });
    }
  }, {
    key: 'getFinder',
    value: function getFinder() {
      return new PairFinder.TagFinder(this.editor, {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding,
        inclusive: this.inclusive
      });
    }
  }, {
    key: 'getPairInfo',
    value: function getPairInfo(from) {
      return _get(Object.getPrototypeOf(Tag.prototype), 'getPairInfo', this).call(this, this.getTagStartPoint(from) || from);
    }
  }]);

  return Tag;
})(Pair);

var Paragraph = (function (_TextObject3) {
  _inherits(Paragraph, _TextObject3);

  function Paragraph() {
    _classCallCheck(this, Paragraph);

    _get(Object.getPrototypeOf(Paragraph.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.supportCount = true;
  }

  _createClass(Paragraph, [{
    key: 'findRow',
    value: function findRow(fromRow, direction, fn) {
      if (fn.reset) fn.reset();
      var foundRow = fromRow;
      for (var row of this.getBufferRows({ startRow: fromRow, direction: direction })) {
        if (!fn(row, direction)) break;
        foundRow = row;
      }
      return foundRow;
    }
  }, {
    key: 'findRowRangeBy',
    value: function findRowRangeBy(fromRow, fn) {
      var startRow = this.findRow(fromRow, 'previous', fn);
      var endRow = this.findRow(fromRow, 'next', fn);
      return [startRow, endRow];
    }
  }, {
    key: 'getPredictFunction',
    value: function getPredictFunction(fromRow, selection) {
      var _this3 = this;

      var fromRowResult = this.editor.isBufferRowBlank(fromRow);

      if (this.isInner()) {
        return function (row, direction) {
          return _this3.editor.isBufferRowBlank(row) === fromRowResult;
        };
      } else {
        var _ret = (function () {
          var directionToExtend = selection.isReversed() ? 'previous' : 'next';

          var flip = false;
          var predict = function predict(row, direction) {
            var result = _this3.editor.isBufferRowBlank(row) === fromRowResult;
            if (flip) {
              return !result;
            } else {
              if (!result && direction === directionToExtend) {
                return flip = true;
              }
              return result;
            }
          };
          predict.reset = function () {
            return flip = false;
          };
          return {
            v: predict
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      }
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var fromRow = this.getCursorPositionForSelection(selection).row;
      if (this.isMode('visual', 'linewise')) {
        if (selection.isReversed()) fromRow--;else fromRow++;
        fromRow = this.getValidVimBufferRow(fromRow);
      }
      var rowRange = this.findRowRangeBy(fromRow, this.getPredictFunction(fromRow, selection));
      return selection.getBufferRange().union(this.getBufferRangeForRowRange(rowRange));
    }
  }]);

  return Paragraph;
})(TextObject);

var Indentation = (function (_Paragraph) {
  _inherits(Indentation, _Paragraph);

  function Indentation() {
    _classCallCheck(this, Indentation);

    _get(Object.getPrototypeOf(Indentation.prototype), 'constructor', this).apply(this, arguments);
  }

  // Section: Comment
  // =========================

  _createClass(Indentation, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _this4 = this;

      var fromRow = this.getCursorPositionForSelection(selection).row;
      var baseIndentLevel = this.editor.indentationForBufferRow(fromRow);
      var rowRange = this.findRowRangeBy(fromRow, function (row) {
        if (_this4.editor.isBufferRowBlank(row)) {
          return _this4.isA();
        } else {
          return _this4.editor.indentationForBufferRow(row) >= baseIndentLevel;
        }
      });
      return this.getBufferRangeForRowRange(rowRange);
    }
  }]);

  return Indentation;
})(Paragraph);

var Comment = (function (_TextObject4) {
  _inherits(Comment, _TextObject4);

  function Comment() {
    _classCallCheck(this, Comment);

    _get(Object.getPrototypeOf(Comment.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(Comment, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _getCursorPositionForSelection = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection.row;

      var rowRange = this.utils.getRowRangeForCommentAtBufferRow(this.editor, row);
      if (rowRange) {
        return this.getBufferRangeForRowRange(rowRange);
      }
    }
  }]);

  return Comment;
})(TextObject);

var BlockComment = (function (_TextObject5) {
  _inherits(BlockComment, _TextObject5);

  function BlockComment() {
    _classCallCheck(this, BlockComment);

    _get(Object.getPrototypeOf(BlockComment.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'characterwise';
  }

  _createClass(BlockComment, [{
    key: 'getRange',
    value: function getRange(selection) {
      // Following one-column-right translation is necessary when cursor is "on" `/` char of beginning `/*`.
      var from = this.editor.clipBufferPosition(this.getCursorPositionForSelection(selection).translate([0, 1]));

      var range = this.getBlockCommentRangeForPoint(from);
      if (range) {
        range.start = this.getStartOfBlockComment(range.start);
        range.end = this.getEndOfBlockComment(range.end);
        var scanRange = range;

        if (this.isInner()) {
          this.scanEditor('forward', /\s+/, { scanRange: scanRange }, function (event) {
            range.start = event.range.end;
            event.stop();
          });
          this.scanEditor('backward', /\s+/, { scanRange: scanRange }, function (event) {
            range.end = event.range.start;
            event.stop();
          });
        }
        return range;
      }
    }
  }, {
    key: 'getStartOfBlockComment',
    value: function getStartOfBlockComment(start) {
      while (start.column === 0) {
        var range = this.getBlockCommentRangeForPoint(start.translate([-1, Infinity]));
        if (!range) break;
        start = range.start;
      }
      return start;
    }
  }, {
    key: 'getEndOfBlockComment',
    value: function getEndOfBlockComment(end) {
      while (this.utils.pointIsAtEndOfLine(this.editor, end)) {
        var range = this.getBlockCommentRangeForPoint([end.row + 1, 0]);
        if (!range) break;
        end = range.end;
      }
      return end;
    }
  }, {
    key: 'getBlockCommentRangeForPoint',
    value: function getBlockCommentRangeForPoint(point) {
      var scope = 'comment.block';
      return this.editor.bufferRangeForScopeAtPosition(scope, point);
    }
  }]);

  return BlockComment;
})(TextObject);

var CommentOrParagraph = (function (_TextObject6) {
  _inherits(CommentOrParagraph, _TextObject6);

  function CommentOrParagraph() {
    _classCallCheck(this, CommentOrParagraph);

    _get(Object.getPrototypeOf(CommentOrParagraph.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  // Section: Fold
  // =========================

  _createClass(CommentOrParagraph, [{
    key: 'getRange',
    value: function getRange(selection) {
      var inner = this.inner;

      for (var klass of ['Comment', 'Paragraph']) {
        var range = this.getInstance(klass, { inner: inner }).getRange(selection);
        if (range) {
          return range;
        }
      }
    }
  }]);

  return CommentOrParagraph;
})(TextObject);

var Fold = (function (_TextObject7) {
  _inherits(Fold, _TextObject7);

  function Fold() {
    _classCallCheck(this, Fold);

    _get(Object.getPrototypeOf(Fold.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(Fold, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _getCursorPositionForSelection2 = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection2.row;

      var selectedRange = selection.getBufferRange();
      var foldRanges = this.utils.getCodeFoldRanges(this.editor);
      var foldRangesContainsCursorRow = foldRanges.filter(function (range) {
        return range.start.row <= row && row <= range.end.row;
      });
      var useTreeSitter = this.utils.isUsingTreeSitter(selection.editor);

      for (var foldRange of foldRangesContainsCursorRow.reverse()) {
        if (this.isA()) {
          foldRange = unionConjoinedFoldRange(foldRange, foldRanges, { useTreeSitter: useTreeSitter });
        } else {
          if (this.utils.doesRangeStartAndEndWithSameIndentLevel(this.editor, foldRange)) {
            foldRange.end.row -= 1;
          }
          foldRange.start.row += 1;
        }
        foldRange = this.getBufferRangeForRowRange([foldRange.start.row, foldRange.end.row]);
        if (!selectedRange.containsRange(foldRange)) {
          return foldRange;
        }
      }
    }
  }]);

  return Fold;
})(TextObject);

function unionConjoinedFoldRange(foldRange, foldRanges, _ref5) {
  var useTreeSitter = _ref5.useTreeSitter;

  var index = foldRanges.findIndex(function (range) {
    return range === foldRange;
  });

  // Extend to downwards
  for (var i = index + 1; i < foldRanges.length; i++) {
    if (foldRange.end.column !== Infinity) break;
    var endRow = useTreeSitter ? foldRange.end.row + 1 : foldRange.end.row;
    if (foldRanges[i].start.isEqual([endRow, Infinity])) {
      foldRange = foldRange.union(foldRanges[i]);
    }
  }

  // Extend to upwards
  for (var i = index - 1; i >= 0; i--) {
    if (foldRange.start.column !== Infinity) break;
    var startRow = useTreeSitter ? foldRange.start.row - 1 : foldRange.start.row;
    if (foldRanges[i].end.isEqual([startRow, Infinity])) {
      foldRange = foldRange.union(foldRanges[i]);
    }
  }

  return foldRange;
}

var Function = (function (_TextObject8) {
  _inherits(Function, _TextObject8);

  function Function() {
    _classCallCheck(this, Function);

    _get(Object.getPrototypeOf(Function.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.scopeNamesOmittingClosingBrace = ['source.go', 'source.elixir'];
  }

  // Section: Other
  // =========================

  _createClass(Function, [{
    key: 'getFunctionBodyStartRegex',
    // language doesn't include closing `}` into fold.

    value: function getFunctionBodyStartRegex(_ref6) {
      var scopeName = _ref6.scopeName;

      if (scopeName === 'source.python') {
        return (/:$/
        );
      } else if (scopeName === 'source.coffee') {
        return (/-|=>$/
        );
      } else {
        return (/{$/
        );
      }
    }
  }, {
    key: 'isMultiLineParameterFunctionRange',
    value: function isMultiLineParameterFunctionRange(parameterRange, bodyRange, bodyStartRegex) {
      var _this5 = this;

      var isBodyStartRow = function isBodyStartRow(row) {
        return bodyStartRegex.test(_this5.editor.lineTextForBufferRow(row));
      };
      if (isBodyStartRow(parameterRange.start.row)) return false;
      if (isBodyStartRow(parameterRange.end.row)) return parameterRange.end.row === bodyRange.start.row;
      if (isBodyStartRow(parameterRange.end.row + 1)) return parameterRange.end.row + 1 === bodyRange.start.row;
      return false;
    }
  }, {
    key: 'getRangeWithTreeSitter',
    value: function getRangeWithTreeSitter(selection) {
      var editor = this.editor;
      var cursorPosition = this.getCursorPositionForSelection(selection);
      var firstCharacterPosition = this.utils.getFirstCharacterPositionForBufferRow(this.editor, cursorPosition.row);
      var searchStartPoint = Point.max(firstCharacterPosition, cursorPosition);
      var startNode = editor.languageMode.getSyntaxNodeAtPosition(searchStartPoint);

      var node = this.utils.findParentNodeForFunctionType(editor, startNode);
      if (node) {
        var range = node.range;

        if (!this.isA()) {
          var bodyNode = this.utils.findFunctionBodyNode(editor, node);
          if (bodyNode) {
            range = bodyNode.range;
          }

          var endRowTranslation = this.utils.doesRangeStartAndEndWithSameIndentLevel(editor, range) ? -1 : 0;
          range = range.translate([1, 0], [endRowTranslation, 0]);
        }
        if (range.end.column !== 0) {
          // The 'preproc_function_def' type used in C and C++ header's "#define" returns linewise range.
          // In this case, we shouldn't translate to linewise since it already contains ending newline.
          range = this.utils.getBufferRangeForRowRange(editor, [range.start.row, range.end.row]);
        }
        return range;
      }
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var _this6 = this;

      var useTreeSitter = this.utils.isUsingTreeSitter(selection.editor);
      if (useTreeSitter) {
        return this.getRangeWithTreeSitter(selection);
      }

      var editor = this.editor;
      var cursorRow = this.getCursorPositionForSelection(selection).row;
      var bodyStartRegex = this.getFunctionBodyStartRegex(editor.getGrammar());
      var isIncludeFunctionScopeForRow = function isIncludeFunctionScopeForRow(row) {
        return _this6.utils.isIncludeFunctionScopeForRow(editor, row);
      };

      var functionRanges = [];
      var saveFunctionRange = function saveFunctionRange(_ref7) {
        var aRange = _ref7.aRange;
        var innerRange = _ref7.innerRange;

        functionRanges.push({
          aRange: _this6.buildARange(aRange),
          innerRange: _this6.buildInnerRange(innerRange)
        });
      };

      var foldRanges = this.utils.getCodeFoldRanges(editor);
      while (foldRanges.length) {
        var range = foldRanges.shift();
        if (isIncludeFunctionScopeForRow(range.start.row)) {
          var nextRange = foldRanges[0];
          var nextFoldIsConnected = nextRange && nextRange.start.row <= range.end.row + 1;
          var maybeAFunctionRange = nextFoldIsConnected ? range.union(nextRange) : range;
          if (!maybeAFunctionRange.containsPoint([cursorRow, Infinity])) continue; // skip to avoid heavy computation
          if (nextFoldIsConnected && this.isMultiLineParameterFunctionRange(range, nextRange, bodyStartRegex)) {
            var bodyRange = foldRanges.shift();
            saveFunctionRange({ aRange: range.union(bodyRange), innerRange: bodyRange });
          } else {
            saveFunctionRange({ aRange: range, innerRange: range });
          }
        } else {
          var previousRow = range.start.row - 1;
          if (previousRow < 0) continue;
          if (editor.isFoldableAtBufferRow(previousRow)) continue;
          var maybeAFunctionRange = range.union(editor.bufferRangeForBufferRow(previousRow));
          if (!maybeAFunctionRange.containsPoint([cursorRow, Infinity])) continue; // skip to avoid heavy computation

          var isBodyStartOnlyRow = function isBodyStartOnlyRow(row) {
            return new RegExp('^\\s*' + bodyStartRegex.source).test(editor.lineTextForBufferRow(row));
          };
          if (isBodyStartOnlyRow(range.start.row) && isIncludeFunctionScopeForRow(previousRow)) {
            saveFunctionRange({ aRange: maybeAFunctionRange, innerRange: range });
          }
        }
      }

      for (var functionRange of functionRanges.reverse()) {
        var _ref8 = this.isA() ? functionRange.aRange : functionRange.innerRange;

        var start = _ref8.start;
        var end = _ref8.end;

        var range = this.getBufferRangeForRowRange([start.row, end.row]);
        if (!selection.getBufferRange().containsRange(range)) return range;
      }
    }
  }, {
    key: 'buildInnerRange',
    value: function buildInnerRange(range) {
      var endRowTranslation = this.utils.doesRangeStartAndEndWithSameIndentLevel(this.editor, range) ? -1 : 0;
      return range.translate([1, 0], [endRowTranslation, 0]);
    }
  }, {
    key: 'buildARange',
    value: function buildARange(range) {
      // NOTE: This adjustment shoud not be necessary if language-syntax is properly defined.
      var endRowTranslation = this.isGrammarDoesNotFoldClosingRow() ? +1 : 0;
      return range.translate([0, 0], [endRowTranslation, 0]);
    }
  }, {
    key: 'isGrammarDoesNotFoldClosingRow',
    value: function isGrammarDoesNotFoldClosingRow() {
      var _editor$getGrammar = this.editor.getGrammar();

      var scopeName = _editor$getGrammar.scopeName;
      var packageName = _editor$getGrammar.packageName;

      if (this.scopeNamesOmittingClosingBrace.includes(scopeName)) {
        return true;
      } else {
        // HACK: Rust have two package `language-rust` and `atom-language-rust`
        // language-rust don't fold ending `}`, but atom-language-rust does.
        return scopeName === 'source.rust' && packageName === 'language-rust';
      }
    }
  }]);

  return Function;
})(TextObject);

var Arguments = (function (_TextObject9) {
  _inherits(Arguments, _TextObject9);

  function Arguments() {
    _classCallCheck(this, Arguments);

    _get(Object.getPrototypeOf(Arguments.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Arguments, [{
    key: 'newArgInfo',
    value: function newArgInfo(argStart, arg, separator) {
      var argEnd = this.utils.traverseTextFromPoint(argStart, arg);
      var argRange = new Range(argStart, argEnd);

      var separatorEnd = this.utils.traverseTextFromPoint(argEnd, separator != null ? separator : '');
      var separatorRange = new Range(argEnd, separatorEnd);

      var innerRange = argRange;
      var aRange = argRange.union(separatorRange);
      return { argRange: argRange, separatorRange: separatorRange, innerRange: innerRange, aRange: aRange };
    }
  }, {
    key: 'getArgumentsRangeForSelection',
    value: function getArgumentsRangeForSelection(selection) {
      var options = {
        member: ['CurlyBracket', 'SquareBracket', 'Parenthesis'],
        inclusive: false
      };
      return this.getInstance('InnerAnyPair', options).getRange(selection);
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var _utils = this.utils;
      var splitArguments = _utils.splitArguments;
      var traverseTextFromPoint = _utils.traverseTextFromPoint;
      var getLast = _utils.getLast;

      var range = this.getArgumentsRangeForSelection(selection);
      var pairRangeFound = range != null;

      range = range || this.getInstance('InnerCurrentLine').getRange(selection); // fallback
      if (!range) return;

      range = this.trimBufferRange(range);

      var text = this.editor.getTextInBufferRange(range);
      var allTokens = splitArguments(text, pairRangeFound);

      var argInfos = [];
      var argStart = range.start;

      // Skip starting separator
      if (allTokens.length && allTokens[0].type === 'separator') {
        var token = allTokens.shift();
        argStart = traverseTextFromPoint(argStart, token.text);
      }

      while (allTokens.length) {
        var token = allTokens.shift();
        if (token.type === 'argument') {
          var nextToken = allTokens.shift();
          var separator = nextToken ? nextToken.text : undefined;
          var argInfo = this.newArgInfo(argStart, token.text, separator);

          if (allTokens.length === 0 && argInfos.length) {
            argInfo.aRange = argInfo.argRange.union(getLast(argInfos).separatorRange);
          }

          argStart = argInfo.aRange.end;
          argInfos.push(argInfo);
        } else {
          throw new Error('must not happen');
        }
      }

      var point = this.getCursorPositionForSelection(selection);
      for (var _ref92 of argInfos) {
        var innerRange = _ref92.innerRange;
        var aRange = _ref92.aRange;

        if (innerRange.end.isGreaterThanOrEqual(point)) {
          return this.isInner() ? innerRange : aRange;
        }
      }
    }
  }]);

  return Arguments;
})(TextObject);

var CurrentLine = (function (_TextObject10) {
  _inherits(CurrentLine, _TextObject10);

  function CurrentLine() {
    _classCallCheck(this, CurrentLine);

    _get(Object.getPrototypeOf(CurrentLine.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(CurrentLine, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _getCursorPositionForSelection3 = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection3.row;

      var range = this.editor.bufferRangeForBufferRow(row);
      return this.isA() ? range : this.trimBufferRange(range);
    }
  }]);

  return CurrentLine;
})(TextObject);

var Entire = (function (_TextObject11) {
  _inherits(Entire, _TextObject11);

  function Entire() {
    _classCallCheck(this, Entire);

    _get(Object.getPrototypeOf(Entire.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.selectOnce = true;
  }

  _createClass(Entire, [{
    key: 'getRange',
    value: function getRange(selection) {
      return this.editor.buffer.getRange();
    }
  }]);

  return Entire;
})(TextObject);

var Empty = (function (_TextObject12) {
  _inherits(Empty, _TextObject12);

  function Empty() {
    _classCallCheck(this, Empty);

    _get(Object.getPrototypeOf(Empty.prototype), 'constructor', this).apply(this, arguments);

    this.selectOnce = true;
  }

  _createClass(Empty, null, [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return Empty;
})(TextObject);

var LatestChange = (function (_TextObject13) {
  _inherits(LatestChange, _TextObject13);

  function LatestChange() {
    _classCallCheck(this, LatestChange);

    _get(Object.getPrototypeOf(LatestChange.prototype), 'constructor', this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(LatestChange, [{
    key: 'getRange',
    value: function getRange(selection) {
      var start = this.vimState.mark.get('[');
      var end = this.vimState.mark.get(']');
      if (start && end) {
        return new Range(start, end);
      }
    }
  }]);

  return LatestChange;
})(TextObject);

var SearchMatchForward = (function (_TextObject14) {
  _inherits(SearchMatchForward, _TextObject14);

  function SearchMatchForward() {
    _classCallCheck(this, SearchMatchForward);

    _get(Object.getPrototypeOf(SearchMatchForward.prototype), 'constructor', this).apply(this, arguments);

    this.backward = false;
  }

  _createClass(SearchMatchForward, [{
    key: 'findMatch',
    value: function findMatch(from, regex) {
      if (this.backward) {
        if (this.mode === 'visual') {
          from = this.utils.translatePointAndClip(this.editor, from, 'backward');
        }

        var options = { from: [from.row, Infinity] };
        return {
          range: this.findInEditor('backward', regex, options, function (_ref10) {
            var range = _ref10.range;
            return range.start.isLessThan(from) && range;
          }),
          whichIsHead: 'start'
        };
      } else {
        if (this.mode === 'visual') {
          from = this.utils.translatePointAndClip(this.editor, from, 'forward');
        }

        var options = { from: [from.row, 0] };
        return {
          range: this.findInEditor('forward', regex, options, function (_ref11) {
            var range = _ref11.range;
            return range.end.isGreaterThan(from) && range;
          }),
          whichIsHead: 'end'
        };
      }
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var pattern = this.globalState.get('lastSearchPattern');
      if (!pattern) return;

      var fromPoint = selection.getHeadBufferPosition();

      var _findMatch = this.findMatch(fromPoint, pattern);

      var range = _findMatch.range;
      var whichIsHead = _findMatch.whichIsHead;

      if (range) {
        return this.unionRangeAndDetermineReversedState(selection, range, whichIsHead);
      }
    }
  }, {
    key: 'unionRangeAndDetermineReversedState',
    value: function unionRangeAndDetermineReversedState(selection, range, whichIsHead) {
      if (selection.isEmpty()) return range;

      var head = range[whichIsHead];
      var tail = selection.getTailBufferPosition();

      if (this.backward) {
        if (tail.isLessThan(head)) head = this.utils.translatePointAndClip(this.editor, head, 'forward');
      } else {
        if (head.isLessThan(tail)) head = this.utils.translatePointAndClip(this.editor, head, 'backward');
      }

      this.reversed = head.isLessThan(tail);
      return new Range(tail, head).union(this.swrap(selection).getTailBufferRange());
    }
  }, {
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      var range = this.getRange(selection);
      if (range) {
        this.swrap(selection).setBufferRange(range, { reversed: this.reversed != null ? this.reversed : this.backward });
        return true;
      }
    }
  }]);

  return SearchMatchForward;
})(TextObject);

var SearchMatchBackward = (function (_SearchMatchForward) {
  _inherits(SearchMatchBackward, _SearchMatchForward);

  function SearchMatchBackward() {
    _classCallCheck(this, SearchMatchBackward);

    _get(Object.getPrototypeOf(SearchMatchBackward.prototype), 'constructor', this).apply(this, arguments);

    this.backward = true;
  }

  // [Limitation: won't fix]: Selected range is not submode aware. always characterwise.
  // So even if original selection was vL or vB, selected range by this text-object
  // is always vC range.
  return SearchMatchBackward;
})(SearchMatchForward);

var PreviousSelection = (function (_TextObject15) {
  _inherits(PreviousSelection, _TextObject15);

  function PreviousSelection() {
    _classCallCheck(this, PreviousSelection);

    _get(Object.getPrototypeOf(PreviousSelection.prototype), 'constructor', this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(PreviousSelection, [{
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      var _vimState$previousSelection = this.vimState.previousSelection;
      var properties = _vimState$previousSelection.properties;
      var submode = _vimState$previousSelection.submode;

      if (properties && submode) {
        this.wise = submode;
        this.swrap(this.editor.getLastSelection()).selectByProperties(properties);
        return true;
      }
    }
  }]);

  return PreviousSelection;
})(TextObject);

var PersistentSelection = (function (_TextObject16) {
  _inherits(PersistentSelection, _TextObject16);

  function PersistentSelection() {
    _classCallCheck(this, PersistentSelection);

    _get(Object.getPrototypeOf(PersistentSelection.prototype), 'constructor', this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  // Used only by ReplaceWithRegister and PutBefore and its' children.

  _createClass(PersistentSelection, [{
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      if (this.vimState.hasPersistentSelections()) {
        this.persistentSelection.setSelectedBufferRanges();
        return true;
      }
    }
  }]);

  return PersistentSelection;
})(TextObject);

var LastPastedRange = (function (_TextObject17) {
  _inherits(LastPastedRange, _TextObject17);

  function LastPastedRange() {
    _classCallCheck(this, LastPastedRange);

    _get(Object.getPrototypeOf(LastPastedRange.prototype), 'constructor', this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(LastPastedRange, [{
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      for (selection of this.editor.getSelections()) {
        var range = this.vimState.sequentialPasteManager.getPastedRangeForSelection(selection);
        selection.setBufferRange(range);
      }
      return true;
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return LastPastedRange;
})(TextObject);

var VisibleArea = (function (_TextObject18) {
  _inherits(VisibleArea, _TextObject18);

  function VisibleArea() {
    _classCallCheck(this, VisibleArea);

    _get(Object.getPrototypeOf(VisibleArea.prototype), 'constructor', this).apply(this, arguments);

    this.selectOnce = true;
  }

  _createClass(VisibleArea, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _editor$getVisibleRowRange = this.editor.getVisibleRowRange();

      var _editor$getVisibleRowRange2 = _slicedToArray(_editor$getVisibleRowRange, 2);

      var startRow = _editor$getVisibleRowRange2[0];
      var endRow = _editor$getVisibleRowRange2[1];

      return this.editor.bufferRangeForScreenRange([[startRow, 0], [endRow, Infinity]]);
    }
  }]);

  return VisibleArea;
})(TextObject);

var DiffHunk = (function (_TextObject19) {
  _inherits(DiffHunk, _TextObject19);

  function DiffHunk() {
    _classCallCheck(this, DiffHunk);

    _get(Object.getPrototypeOf(DiffHunk.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.selectOnce = true;
  }

  _createClass(DiffHunk, [{
    key: 'getRange',
    value: function getRange(selection) {
      var row = this.getCursorPositionForSelection(selection).row;
      return this.utils.getHunkRangeAtBufferRow(this.editor, row);
    }
  }]);

  return DiffHunk;
})(TextObject);

module.exports = Object.assign({
  TextObject: TextObject,
  Word: Word,
  WholeWord: WholeWord,
  SmartWord: SmartWord,
  Subword: Subword,
  Pair: Pair,
  APair: APair,
  AnyPair: AnyPair,
  AnyPairAllowForwarding: AnyPairAllowForwarding,
  AnyQuote: AnyQuote,
  Quote: Quote,
  DoubleQuote: DoubleQuote,
  SingleQuote: SingleQuote,
  BackTick: BackTick,
  CurlyBracket: CurlyBracket,
  SquareBracket: SquareBracket,
  Parenthesis: Parenthesis,
  AngleBracket: AngleBracket,
  Tag: Tag,
  Paragraph: Paragraph,
  Indentation: Indentation,
  Comment: Comment,
  CommentOrParagraph: CommentOrParagraph,
  Fold: Fold,
  Function: Function,
  Arguments: Arguments,
  CurrentLine: CurrentLine,
  Entire: Entire,
  Empty: Empty,
  LatestChange: LatestChange,
  SearchMatchForward: SearchMatchForward,
  SearchMatchBackward: SearchMatchBackward,
  PreviousSelection: PreviousSelection,
  PersistentSelection: PersistentSelection,
  LastPastedRange: LastPastedRange,
  VisibleArea: VisibleArea
}, Word.deriveClass(true), WholeWord.deriveClass(true), SmartWord.deriveClass(true), Subword.deriveClass(true), AnyPair.deriveClass(true), AnyPairAllowForwarding.deriveClass(true), AnyQuote.deriveClass(true), DoubleQuote.deriveClass(true), SingleQuote.deriveClass(true), BackTick.deriveClass(true), CurlyBracket.deriveClass(true, true), SquareBracket.deriveClass(true, true), Parenthesis.deriveClass(true, true), AngleBracket.deriveClass(true, true), Tag.deriveClass(true), Paragraph.deriveClass(true), Indentation.deriveClass(true), Comment.deriveClass(true), BlockComment.deriveClass(true), CommentOrParagraph.deriveClass(true), Fold.deriveClass(true), Function.deriveClass(true), Arguments.deriveClass(true), CurrentLine.deriveClass(true), Entire.deriveClass(true), LatestChange.deriveClass(true), PersistentSelection.deriveClass(true), VisibleArea.deriveClass(true), DiffHunk.deriveClass(true));
// FIXME #472, #66
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3hjZi8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi90ZXh0LW9iamVjdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7OztlQUVZLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQS9CLEtBQUssWUFBTCxLQUFLO0lBQUUsS0FBSyxZQUFMLEtBQUs7Ozs7O0FBS25CLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM5QixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7O0lBRXJDLFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7U0FJZCxRQUFRLEdBQUcsSUFBSTtTQUNmLElBQUksR0FBRyxlQUFlO1NBQ3RCLFlBQVksR0FBRyxLQUFLO1NBQ3BCLFVBQVUsR0FBRyxLQUFLO1NBQ2xCLGVBQWUsR0FBRyxLQUFLOzs7Ozs7ZUFSbkIsVUFBVTs7V0E4Q04sbUJBQUc7QUFDVCxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7S0FDbEI7OztXQUVHLGVBQUc7QUFDTCxhQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQTtLQUNuQjs7O1dBRVUsc0JBQUc7QUFDWixhQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFBO0tBQ2hDOzs7V0FFVyx1QkFBRztBQUNiLGFBQU8sSUFBSSxDQUFDLElBQUksS0FBSyxXQUFXLENBQUE7S0FDakM7OztXQUVTLG1CQUFDLElBQUksRUFBRTtBQUNmLGFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7S0FDMUI7OztXQUVVLHNCQUFHO0FBQ1osVUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUE7S0FDN0I7Ozs7Ozs7V0FLTyxtQkFBRzs7QUFFVCxVQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxDQUFD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QUMsSUFBSSxDQUFDLEVBQ3JDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQzdCLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQzNCLENBQUEiLCJmaWxlIjoiL2hvbWUveGNmLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3RleHQtb2JqZWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuY29uc3Qge1JhbmdlLCBQb2ludH0gPSByZXF1aXJlKCdhdG9tJylcblxuLy8gW1RPRE9dIE5lZWQgb3ZlcmhhdWxcbi8vICAtIFsgXSBNYWtlIGV4cGFuZGFibGUgYnkgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkudW5pb24odGhpcy5nZXRSYW5nZShzZWxlY3Rpb24pKVxuLy8gIC0gWyBdIENvdW50IHN1cHBvcnQocHJpb3JpdHkgbG93KT9cbmNvbnN0IEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKVxuY29uc3QgUGFpckZpbmRlciA9IHJlcXVpcmUoJy4vcGFpci1maW5kZXInKVxuXG5jbGFzcyBUZXh0T2JqZWN0IGV4dGVuZHMgQmFzZSB7XG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gJ3RleHQtb2JqZWN0J1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG5cbiAgb3BlcmF0b3IgPSBudWxsXG4gIHdpc2UgPSAnY2hhcmFjdGVyd2lzZSdcbiAgc3VwcG9ydENvdW50ID0gZmFsc2UgLy8gRklYTUUgIzQ3MiwgIzY2XG4gIHNlbGVjdE9uY2UgPSBmYWxzZVxuICBzZWxlY3RTdWNjZWVkZWQgPSBmYWxzZVxuXG4gIHN0YXRpYyBkZXJpdmVDbGFzcyAoaW5uZXJBbmRBLCBpbm5lckFuZEFGb3JBbGxvd0ZvcndhcmRpbmcpIHtcbiAgICB0aGlzLmNvbW1hbmQgPSBmYWxzZSAvLyBIQUNLOiBrbGFzcyB0byBkZXJpdmUgY2hpbGQgY2xhc3MgaXMgbm90IGNvbW1hbmRcbiAgICBjb25zdCBzdG9yZSA9IHt9XG4gICAgaWYgKGlubmVyQW5kQSkge1xuICAgICAgY29uc3Qga2xhc3NBID0gdGhpcy5nZW5lcmF0ZUNsYXNzKGZhbHNlKVxuICAgICAgY29uc3Qga2xhc3NJID0gdGhpcy5nZW5lcmF0ZUNsYXNzKHRydWUpXG4gICAgICBzdG9yZVtrbGFzc0EubmFtZV0gPSBrbGFzc0FcbiAgICAgIHN0b3JlW2tsYXNzSS5uYW1lXSA9IGtsYXNzSVxuICAgIH1cbiAgICBpZiAoaW5uZXJBbmRBRm9yQWxsb3dGb3J3YXJkaW5nKSB7XG4gICAgICBjb25zdCBrbGFzc0EgPSB0aGlzLmdlbmVyYXRlQ2xhc3MoZmFsc2UsIHRydWUpXG4gICAgICBjb25zdCBrbGFzc0kgPSB0aGlzLmdlbmVyYXRlQ2xhc3ModHJ1ZSwgdHJ1ZSlcbiAgICAgIHN0b3JlW2tsYXNzQS5uYW1lXSA9IGtsYXNzQVxuICAgICAgc3RvcmVba2xhc3NJLm5hbWVdID0ga2xhc3NJXG4gICAgfVxuICAgIHJldHVybiBzdG9yZVxuICB9XG5cbiAgc3RhdGljIGdlbmVyYXRlQ2xhc3MgKGlubmVyLCBhbGxvd0ZvcndhcmRpbmcpIHtcbiAgICBsZXQgbmFtZSA9IChpbm5lciA/ICdJbm5lcicgOiAnQScpICsgdGhpcy5uYW1lXG4gICAgaWYgKGFsbG93Rm9yd2FyZGluZykge1xuICAgICAgbmFtZSArPSAnQWxsb3dGb3J3YXJkaW5nJ1xuICAgIH1cblxuICAgIHJldHVybiBjbGFzcyBleHRlbmRzIHRoaXMge1xuICAgICAgc3RhdGljIG5hbWUgPSBuYW1lXG4gICAgICBjb25zdHJ1Y3RvciAodmltU3RhdGUpIHtcbiAgICAgICAgc3VwZXIodmltU3RhdGUpXG4gICAgICAgIHRoaXMuaW5uZXIgPSBpbm5lclxuICAgICAgICBpZiAoYWxsb3dGb3J3YXJkaW5nICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLmFsbG93Rm9yd2FyZGluZyA9IGFsbG93Rm9yd2FyZGluZ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaXNJbm5lciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXJcbiAgfVxuXG4gIGlzQSAoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlubmVyXG4gIH1cblxuICBpc0xpbmV3aXNlICgpIHtcbiAgICByZXR1cm4gdGhpcy53aXNlID09PSAnbGluZXdpc2UnXG4gIH1cblxuICBpc0Jsb2Nrd2lzZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMud2lzZSA9PT0gJ2Jsb2Nrd2lzZSdcbiAgfVxuXG4gIGZvcmNlV2lzZSAod2lzZSkge1xuICAgIHJldHVybiAodGhpcy53aXNlID0gd2lzZSkgLy8gRklYTUUgY3VycmVudGx5IG5vdCB3ZWxsIHN1cHBvcnRlZFxuICB9XG5cbiAgcmVzZXRTdGF0ZSAoKSB7XG4gICAgdGhpcy5zZWxlY3RTdWNjZWVkZWQgPSBmYWxzZVxuICB9XG5cbiAgLy8gZXhlY3V0ZTogQ2FsbGVkIGZyb20gT3BlcmF0b3I6OnNlbGVjdFRhcmdldCgpXG4gIC8vICAtIGB2IGkgcGAsIGlzIGBWaXN1YWxNb2RlU2VsZWN0YCBvcGVyYXRvciB3aXRoIEB0YXJnZXQgPSBgSW5uZXJQYXJhZ3JhcGhgLlxuICAvLyAgLSBgZCBpIHBgLCBpcyBgRGVsZXRlYCBvcGVyYXRvciB3aXRoIEB0YXJnZXQgPSBgSW5uZXJQYXJhZ3JhcGhgLlxuICBleGVjdXRlICgpIHtcbiAgICAvLyBXaGVubmV2ZXIgVGV4dE9iamVjdCBpcyBleGVjdXRlZCwgaXQgaGFzIEBvcGVyYXRvclxuICAgIGlmICghdGhpcy5vcGVyYXRvcikgdGhyb3cgbmV3IEVycm9yKCdpbiBUZXh0T2JqZWN0OiBNdXN0IG5vdCBoYXBwZW4nKVxuICAgIHRoaXMuc2VsZWN0KClcbiAgfVxuXG4gIHNlbGVjdCAoKSB7XG4gICAgaWYgKHRoaXMuaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJykpIHtcbiAgICAgIHRoaXMuc3dyYXAubm9ybWFsaXplKHRoaXMuZWRpdG9yKVxuICAgIH1cblxuICAgIHRoaXMuY291bnRUaW1lcyh0aGlzLmdldENvdW50KCksICh7c3RvcH0pID0+IHtcbiAgICAgIGlmICghdGhpcy5zdXBwb3J0Q291bnQpIHN0b3AoKSAvLyBxdWljay1maXggZm9yICM1NjBcblxuICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgIGNvbnN0IG9sZFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0VGV4dE9iamVjdChzZWxlY3Rpb24pKSB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IHRydWVcbiAgICAgICAgaWYgKHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmlzRXF1YWwob2xkUmFuZ2UpKSBzdG9wKClcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0T25jZSkgYnJlYWtcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5lZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICAvLyBTb21lIFRleHRPYmplY3QncyB3aXNlIGlzIE5PVCBkZXRlcm1pbmlzdGljLiBJdCBoYXMgdG8gYmUgZGV0ZWN0ZWQgZnJvbSBzZWxlY3RlZCByYW5nZS5cbiAgICBpZiAodGhpcy53aXNlID09IG51bGwpIHRoaXMud2lzZSA9IHRoaXMuc3dyYXAuZGV0ZWN0V2lzZSh0aGlzLmVkaXRvcilcblxuICAgIGlmICh0aGlzLm9wZXJhdG9yLmluc3RhbmNlb2YoJ1NlbGVjdEJhc2UnKSkge1xuICAgICAgaWYgKHRoaXMuc2VsZWN0U3VjY2VlZGVkKSB7XG4gICAgICAgIGlmICh0aGlzLndpc2UgPT09ICdjaGFyYWN0ZXJ3aXNlJykge1xuICAgICAgICAgIHRoaXMuc3dyYXAuc2F2ZVByb3BlcnRpZXModGhpcy5lZGl0b3IsIHtmb3JjZTogdHJ1ZX0pXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy53aXNlID09PSAnbGluZXdpc2UnKSB7XG4gICAgICAgICAgLy8gV2hlbiB0YXJnZXQgaXMgcGVyc2lzdGVudC1zZWxlY3Rpb24sIG5ldyBzZWxlY3Rpb24gaXMgYWRkZWQgYWZ0ZXIgc2VsZWN0VGV4dE9iamVjdC5cbiAgICAgICAgICAvLyBTbyB3ZSBoYXZlIHRvIGFzc3VyZSBhbGwgc2VsZWN0aW9uIGhhdmUgc2VsY3Rpb24gcHJvcGVydHkuXG4gICAgICAgICAgLy8gTWF5YmUgdGhpcyBsb2dpYyBjYW4gYmUgbW92ZWQgdG8gb3BlcmF0aW9uIHN0YWNrLlxuICAgICAgICAgIGZvciAoY29uc3QgJHNlbGVjdGlvbiBvZiB0aGlzLnN3cmFwLmdldFNlbGVjdGlvbnModGhpcy5lZGl0b3IpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5nZXRDb25maWcoJ3N0YXlPblNlbGVjdFRleHRPYmplY3QnKSkge1xuICAgICAgICAgICAgICBpZiAoISRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpKSB7XG4gICAgICAgICAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNlbGVjdGlvbi5maXhQcm9wZXJ0eVJvd1RvUm93UmFuZ2UoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5zdWJtb2RlID09PSAnYmxvY2t3aXNlJykge1xuICAgICAgICBmb3IgKGNvbnN0ICRzZWxlY3Rpb24gb2YgdGhpcy5zd3JhcC5nZXRTZWxlY3Rpb25zKHRoaXMuZWRpdG9yKSkge1xuICAgICAgICAgICRzZWxlY3Rpb24ubm9ybWFsaXplKClcbiAgICAgICAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZSgnYmxvY2t3aXNlJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFJldHVybiB0cnVlIG9yIGZhbHNlXG4gIHNlbGVjdFRleHRPYmplY3QgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHJhbmdlID0gdGhpcy5nZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICB0aGlzLnN3cmFwKHNlbGVjdGlvbikuc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICAvLyB0byBvdmVycmlkZVxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7fVxufVxuXG4vLyBTZWN0aW9uOiBXb3JkXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBXb3JkIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHtyYW5nZX0gPSB0aGlzLmdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7d29yZFJlZ2V4OiB0aGlzLndvcmRSZWdleH0pXG4gICAgcmV0dXJuIHRoaXMuaXNBKCkgPyB0aGlzLnV0aWxzLmV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlcyh0aGlzLmVkaXRvciwgcmFuZ2UpIDogcmFuZ2VcbiAgfVxufVxuXG5jbGFzcyBXaG9sZVdvcmQgZXh0ZW5kcyBXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcUysvXG59XG5cbi8vIEp1c3QgaW5jbHVkZSBfLCAtXG5jbGFzcyBTbWFydFdvcmQgZXh0ZW5kcyBXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvXG59XG5cbi8vIEp1c3QgaW5jbHVkZSBfLCAtXG5jbGFzcyBTdWJ3b3JkIGV4dGVuZHMgV29yZCB7XG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICB0aGlzLndvcmRSZWdleCA9IHNlbGVjdGlvbi5jdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgcmV0dXJuIHN1cGVyLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgfVxufVxuXG4vLyBTZWN0aW9uOiBQYWlyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBQYWlyIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgc3VwcG9ydENvdW50ID0gdHJ1ZVxuICBhbGxvd05leHRMaW5lID0gbnVsbFxuICBhZGp1c3RJbm5lclJhbmdlID0gdHJ1ZVxuICBwYWlyID0gbnVsbFxuICBpbmNsdXNpdmUgPSB0cnVlXG5cbiAgaXNBbGxvd05leHRMaW5lICgpIHtcbiAgICBpZiAodGhpcy5hbGxvd05leHRMaW5lICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmFsbG93TmV4dExpbmVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucGFpciAmJiB0aGlzLnBhaXJbMF0gIT09IHRoaXMucGFpclsxXVxuICAgIH1cbiAgfVxuXG4gIGFkanVzdFJhbmdlICh7c3RhcnQsIGVuZH0pIHtcbiAgICAvLyBEaXJ0eSB3b3JrIHRvIGZlZWwgbmF0dXJhbCBmb3IgaHVtYW4sIHRvIGJlaGF2ZSBjb21wYXRpYmxlIHdpdGggcHVyZSBWaW0uXG4gICAgLy8gV2hlcmUgdGhpcyBhZGp1c3RtZW50IGFwcGVhciBpcyBpbiBmb2xsb3dpbmcgc2l0dWF0aW9uLlxuICAgIC8vIG9wLTE6IGBjaXtgIHJlcGxhY2Ugb25seSAybmQgbGluZVxuICAgIC8vIG9wLTI6IGBkaXtgIGRlbGV0ZSBvbmx5IDJuZCBsaW5lLlxuICAgIC8vIHRleHQ6XG4gICAgLy8gIHtcbiAgICAvLyAgICBhYWFcbiAgICAvLyAgfVxuICAgIGlmICh0aGlzLnV0aWxzLnBvaW50SXNBdEVuZE9mTGluZSh0aGlzLmVkaXRvciwgc3RhcnQpKSB7XG4gICAgICBzdGFydCA9IHN0YXJ0LnRyYXZlcnNlKFsxLCAwXSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy51dGlscy5nZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIGVuZCkubWF0Y2goL15cXHMqJC8pKSB7XG4gICAgICBpZiAodGhpcy5tb2RlID09PSAndmlzdWFsJykge1xuICAgICAgICAvLyBUaGlzIGlzIHNsaWdodGx5IGlubmNvbnNpc3RlbnQgd2l0aCByZWd1bGFyIFZpbVxuICAgICAgICAvLyAtIHJlZ3VsYXIgVmltOiBzZWxlY3QgbmV3IGxpbmUgYWZ0ZXIgRU9MXG4gICAgICAgIC8vIC0gdmltLW1vZGUtcGx1czogc2VsZWN0IHRvIEVPTChiZWZvcmUgbmV3IGxpbmUpXG4gICAgICAgIC8vIFRoaXMgaXMgaW50ZW50aW9uYWwgc2luY2UgdG8gbWFrZSBzdWJtb2RlIGBjaGFyYWN0ZXJ3aXNlYCB3aGVuIGF1dG8tZGV0ZWN0IHN1Ym1vZGVcbiAgICAgICAgLy8gaW5uZXJFbmQgPSBuZXcgUG9pbnQoaW5uZXJFbmQucm93IC0gMSwgSW5maW5pdHkpXG4gICAgICAgIGVuZCA9IG5ldyBQb2ludChlbmQucm93IC0gMSwgSW5maW5pdHkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdywgMClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuICB9XG5cbiAgZ2V0RmluZGVyICgpIHtcbiAgICBjb25zdCBmaW5kZXJOYW1lID0gdGhpcy5wYWlyWzBdID09PSB0aGlzLnBhaXJbMV0gPyAnUXVvdGVGaW5kZXInIDogJ0JyYWNrZXRGaW5kZXInXG4gICAgcmV0dXJuIG5ldyBQYWlyRmluZGVyW2ZpbmRlck5hbWVdKHRoaXMuZWRpdG9yLCB7XG4gICAgICBhbGxvd05leHRMaW5lOiB0aGlzLmlzQWxsb3dOZXh0TGluZSgpLFxuICAgICAgYWxsb3dGb3J3YXJkaW5nOiB0aGlzLmFsbG93Rm9yd2FyZGluZyxcbiAgICAgIHBhaXI6IHRoaXMucGFpcixcbiAgICAgIGluY2x1c2l2ZTogdGhpcy5pbmNsdXNpdmVcbiAgICB9KVxuICB9XG5cbiAgZ2V0UGFpckluZm8gKGZyb20pIHtcbiAgICBjb25zdCBwYWlySW5mbyA9IHRoaXMuZ2V0RmluZGVyKCkuZmluZChmcm9tKVxuICAgIGlmIChwYWlySW5mbykge1xuICAgICAgaWYgKHRoaXMuYWRqdXN0SW5uZXJSYW5nZSkge1xuICAgICAgICBwYWlySW5mby5pbm5lclJhbmdlID0gdGhpcy5hZGp1c3RSYW5nZShwYWlySW5mby5pbm5lclJhbmdlKVxuICAgICAgfVxuICAgICAgcGFpckluZm8udGFyZ2V0UmFuZ2UgPSB0aGlzLmlzSW5uZXIoKSA/IHBhaXJJbmZvLmlubmVyUmFuZ2UgOiBwYWlySW5mby5hUmFuZ2VcbiAgICAgIHJldHVybiBwYWlySW5mb1xuICAgIH1cbiAgfVxuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBvcmlnaW5hbFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBsZXQgcGFpckluZm8gPSB0aGlzLmdldFBhaXJJbmZvKHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKSlcbiAgICAvLyBXaGVuIHJhbmdlIHdhcyBzYW1lLCB0cnkgdG8gZXhwYW5kIHJhbmdlXG4gICAgaWYgKHBhaXJJbmZvICYmIHBhaXJJbmZvLnRhcmdldFJhbmdlLmlzRXF1YWwob3JpZ2luYWxSYW5nZSkpIHtcbiAgICAgIHBhaXJJbmZvID0gdGhpcy5nZXRQYWlySW5mbyhwYWlySW5mby5hUmFuZ2UuZW5kKVxuICAgIH1cbiAgICBpZiAocGFpckluZm8pIHtcbiAgICAgIHJldHVybiBwYWlySW5mby50YXJnZXRSYW5nZVxuICAgIH1cbiAgfVxufVxuXG4vLyBVc2VkIGJ5IERlbGV0ZVN1cnJvdW5kXG5jbGFzcyBBUGFpciBleHRlbmRzIFBhaXIge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG59XG5cbmNsYXNzIEFueVBhaXIgZXh0ZW5kcyBQYWlyIHtcbiAgYWxsb3dGb3J3YXJkaW5nID0gZmFsc2VcbiAgbWVtYmVyID0gWydEb3VibGVRdW90ZScsICdTaW5nbGVRdW90ZScsICdCYWNrVGljaycsICdDdXJseUJyYWNrZXQnLCAnQW5nbGVCcmFja2V0JywgJ1NxdWFyZUJyYWNrZXQnLCAnUGFyZW50aGVzaXMnXVxuXG4gIGdldFJhbmdlcyAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGlubmVyOiB0aGlzLmlubmVyLFxuICAgICAgYWxsb3dGb3J3YXJkaW5nOiB0aGlzLmFsbG93Rm9yd2FyZGluZyxcbiAgICAgIGluY2x1c2l2ZTogdGhpcy5pbmNsdXNpdmVcbiAgICB9XG4gICAgY29uc3QgZ2V0UmFuZ2VCeU1lbWJlciA9IG1lbWJlciA9PiB0aGlzLmdldEluc3RhbmNlKG1lbWJlciwgb3B0aW9ucykuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICAgIHJldHVybiB0aGlzLm1lbWJlci5tYXAoZ2V0UmFuZ2VCeU1lbWJlcikuZmlsdGVyKHYgPT4gdilcbiAgfVxuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5zb3J0UmFuZ2VzKHRoaXMuZ2V0UmFuZ2VzKHNlbGVjdGlvbikpLnBvcCgpXG4gIH1cbn1cblxuY2xhc3MgQW55UGFpckFsbG93Rm9yd2FyZGluZyBleHRlbmRzIEFueVBhaXIge1xuICBhbGxvd0ZvcndhcmRpbmcgPSB0cnVlXG5cbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMuZ2V0UmFuZ2VzKHNlbGVjdGlvbilcbiAgICBjb25zdCBmcm9tID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgbGV0IFtmb3J3YXJkaW5nUmFuZ2VzLCBlbmNsb3NpbmdSYW5nZXNdID0gdGhpcy5fLnBhcnRpdGlvbihyYW5nZXMsIHJhbmdlID0+IHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW5PckVxdWFsKGZyb20pKVxuICAgIGNvbnN0IGVuY2xvc2luZ1JhbmdlID0gdGhpcy51dGlscy5zb3J0UmFuZ2VzKGVuY2xvc2luZ1JhbmdlcykucG9wKClcbiAgICBmb3J3YXJkaW5nUmFuZ2VzID0gdGhpcy51dGlscy5zb3J0UmFuZ2VzKGZvcndhcmRpbmdSYW5nZXMpXG5cbiAgICAvLyBXaGVuIGVuY2xvc2luZ1JhbmdlIGlzIGV4aXN0cyxcbiAgICAvLyBXZSBkb24ndCBnbyBhY3Jvc3MgZW5jbG9zaW5nUmFuZ2UuZW5kLlxuICAgIC8vIFNvIGNob29zZSBmcm9tIHJhbmdlcyBjb250YWluZWQgaW4gZW5jbG9zaW5nUmFuZ2UuXG4gICAgaWYgKGVuY2xvc2luZ1JhbmdlKSB7XG4gICAgICBmb3J3YXJkaW5nUmFuZ2VzID0gZm9yd2FyZGluZ1Jhbmdlcy5maWx0ZXIocmFuZ2UgPT4gZW5jbG9zaW5nUmFuZ2UuY29udGFpbnNSYW5nZShyYW5nZSkpXG4gICAgfVxuXG4gICAgcmV0dXJuIGZvcndhcmRpbmdSYW5nZXNbMF0gfHwgZW5jbG9zaW5nUmFuZ2VcbiAgfVxufVxuXG5jbGFzcyBBbnlRdW90ZSBleHRlbmRzIEFueVBhaXIge1xuICBhbGxvd0ZvcndhcmRpbmcgPSB0cnVlXG4gIG1lbWJlciA9IFsnRG91YmxlUXVvdGUnLCAnU2luZ2xlUXVvdGUnLCAnQmFja1RpY2snXVxuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICAvLyBQaWNrIHJhbmdlIHdoaWNoIGVuZC5jb2x1bSBpcyBsZWZ0bW9zdChtZWFuLCBjbG9zZWQgZmlyc3QpXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmFuZ2VzKHNlbGVjdGlvbikuc29ydCgoYSwgYikgPT4gYS5lbmQuY29sdW1uIC0gYi5lbmQuY29sdW1uKVswXVxuICB9XG59XG5cbmNsYXNzIFF1b3RlIGV4dGVuZHMgUGFpciB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgYWxsb3dGb3J3YXJkaW5nID0gdHJ1ZVxufVxuXG5jbGFzcyBEb3VibGVRdW90ZSBleHRlbmRzIFF1b3RlIHtcbiAgcGFpciA9IFsnXCInLCAnXCInXVxufVxuXG5jbGFzcyBTaW5nbGVRdW90ZSBleHRlbmRzIFF1b3RlIHtcbiAgcGFpciA9IFtcIidcIiwgXCInXCJdXG59XG5cbmNsYXNzIEJhY2tUaWNrIGV4dGVuZHMgUXVvdGUge1xuICBwYWlyID0gWydgJywgJ2AnXVxufVxuXG5jbGFzcyBDdXJseUJyYWNrZXQgZXh0ZW5kcyBQYWlyIHtcbiAgcGFpciA9IFsneycsICd9J11cbn1cblxuY2xhc3MgU3F1YXJlQnJhY2tldCBleHRlbmRzIFBhaXIge1xuICBwYWlyID0gWydbJywgJ10nXVxufVxuXG5jbGFzcyBQYXJlbnRoZXNpcyBleHRlbmRzIFBhaXIge1xuICBwYWlyID0gWycoJywgJyknXVxufVxuXG5jbGFzcyBBbmdsZUJyYWNrZXQgZXh0ZW5kcyBQYWlyIHtcbiAgcGFpciA9IFsnPCcsICc+J11cbn1cblxuY2xhc3MgVGFnIGV4dGVuZHMgUGFpciB7XG4gIGFsbG93TmV4dExpbmUgPSB0cnVlXG4gIGFsbG93Rm9yd2FyZGluZyA9IHRydWVcbiAgYWRqdXN0SW5uZXJSYW5nZSA9IGZhbHNlXG5cbiAgZ2V0VGFnU3RhcnRQb2ludCAoZnJvbSkge1xuICAgIGNvbnN0IHJlZ2V4ID0gUGFpckZpbmRlci5UYWdGaW5kZXIucGF0dGVyblxuICAgIGNvbnN0IG9wdGlvbnMgPSB7ZnJvbTogW2Zyb20ucm93LCAwXX1cbiAgICByZXR1cm4gdGhpcy5maW5kSW5FZGl0b3IoJ2ZvcndhcmQnLCByZWdleCwgb3B0aW9ucywgKHtyYW5nZX0pID0+IHJhbmdlLmNvbnRhaW5zUG9pbnQoZnJvbSwgdHJ1ZSkgJiYgcmFuZ2Uuc3RhcnQpXG4gIH1cblxuICBnZXRGaW5kZXIgKCkge1xuICAgIHJldHVybiBuZXcgUGFpckZpbmRlci5UYWdGaW5kZXIodGhpcy5lZGl0b3IsIHtcbiAgICAgIGFsbG93TmV4dExpbmU6IHRoaXMuaXNBbGxvd05leHRMaW5lKCksXG4gICAgICBhbGxvd0ZvcndhcmRpbmc6IHRoaXMuYWxsb3dGb3J3YXJkaW5nLFxuICAgICAgaW5jbHVzaXZlOiB0aGlzLmluY2x1c2l2ZVxuICAgIH0pXG4gIH1cblxuICBnZXRQYWlySW5mbyAoZnJvbSkge1xuICAgIHJldHVybiBzdXBlci5nZXRQYWlySW5mbyh0aGlzLmdldFRhZ1N0YXJ0UG9pbnQoZnJvbSkgfHwgZnJvbSlcbiAgfVxufVxuXG4vLyBTZWN0aW9uOiBQYXJhZ3JhcGhcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFBhcmFncmFwaCBpcyBkZWZpbmVkIGFzIGNvbnNlY3V0aXZlIChub24tKWJsYW5rLWxpbmUuXG5jbGFzcyBQYXJhZ3JhcGggZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9ICdsaW5ld2lzZSdcbiAgc3VwcG9ydENvdW50ID0gdHJ1ZVxuXG4gIGZpbmRSb3cgKGZyb21Sb3csIGRpcmVjdGlvbiwgZm4pIHtcbiAgICBpZiAoZm4ucmVzZXQpIGZuLnJlc2V0KClcbiAgICBsZXQgZm91bmRSb3cgPSBmcm9tUm93XG4gICAgZm9yIChjb25zdCByb3cgb2YgdGhpcy5nZXRCdWZmZXJSb3dzKHtzdGFydFJvdzogZnJvbVJvdywgZGlyZWN0aW9ufSkpIHtcbiAgICAgIGlmICghZm4ocm93LCBkaXJlY3Rpb24pKSBicmVha1xuICAgICAgZm91bmRSb3cgPSByb3dcbiAgICB9XG4gICAgcmV0dXJuIGZvdW5kUm93XG4gIH1cblxuICBmaW5kUm93UmFuZ2VCeSAoZnJvbVJvdywgZm4pIHtcbiAgICBjb25zdCBzdGFydFJvdyA9IHRoaXMuZmluZFJvdyhmcm9tUm93LCAncHJldmlvdXMnLCBmbilcbiAgICBjb25zdCBlbmRSb3cgPSB0aGlzLmZpbmRSb3coZnJvbVJvdywgJ25leHQnLCBmbilcbiAgICByZXR1cm4gW3N0YXJ0Um93LCBlbmRSb3ddXG4gIH1cblxuICBnZXRQcmVkaWN0RnVuY3Rpb24gKGZyb21Sb3csIHNlbGVjdGlvbikge1xuICAgIGNvbnN0IGZyb21Sb3dSZXN1bHQgPSB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKGZyb21Sb3cpXG5cbiAgICBpZiAodGhpcy5pc0lubmVyKCkpIHtcbiAgICAgIHJldHVybiAocm93LCBkaXJlY3Rpb24pID0+IHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KSA9PT0gZnJvbVJvd1Jlc3VsdFxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkaXJlY3Rpb25Ub0V4dGVuZCA9IHNlbGVjdGlvbi5pc1JldmVyc2VkKCkgPyAncHJldmlvdXMnIDogJ25leHQnXG5cbiAgICAgIGxldCBmbGlwID0gZmFsc2VcbiAgICAgIGNvbnN0IHByZWRpY3QgPSAocm93LCBkaXJlY3Rpb24pID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpID09PSBmcm9tUm93UmVzdWx0XG4gICAgICAgIGlmIChmbGlwKSB7XG4gICAgICAgICAgcmV0dXJuICFyZXN1bHRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIXJlc3VsdCAmJiBkaXJlY3Rpb24gPT09IGRpcmVjdGlvblRvRXh0ZW5kKSB7XG4gICAgICAgICAgICByZXR1cm4gKGZsaXAgPSB0cnVlKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHByZWRpY3QucmVzZXQgPSAoKSA9PiAoZmxpcCA9IGZhbHNlKVxuICAgICAgcmV0dXJuIHByZWRpY3RcbiAgICB9XG4gIH1cblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgbGV0IGZyb21Sb3cgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG4gICAgaWYgKHRoaXMuaXNNb2RlKCd2aXN1YWwnLCAnbGluZXdpc2UnKSkge1xuICAgICAgaWYgKHNlbGVjdGlvbi5pc1JldmVyc2VkKCkpIGZyb21Sb3ctLVxuICAgICAgZWxzZSBmcm9tUm93KytcbiAgICAgIGZyb21Sb3cgPSB0aGlzLmdldFZhbGlkVmltQnVmZmVyUm93KGZyb21Sb3cpXG4gICAgfVxuICAgIGNvbnN0IHJvd1JhbmdlID0gdGhpcy5maW5kUm93UmFuZ2VCeShmcm9tUm93LCB0aGlzLmdldFByZWRpY3RGdW5jdGlvbihmcm9tUm93LCBzZWxlY3Rpb24pKVxuICAgIHJldHVybiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS51bmlvbih0aGlzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpKVxuICB9XG59XG5cbmNsYXNzIEluZGVudGF0aW9uIGV4dGVuZHMgUGFyYWdyYXBoIHtcbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IGZyb21Sb3cgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG4gICAgY29uc3QgYmFzZUluZGVudExldmVsID0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coZnJvbVJvdylcbiAgICBjb25zdCByb3dSYW5nZSA9IHRoaXMuZmluZFJvd1JhbmdlQnkoZnJvbVJvdywgcm93ID0+IHtcbiAgICAgIGlmICh0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdykpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNBKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpID49IGJhc2VJbmRlbnRMZXZlbFxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSlcbiAgfVxufVxuXG4vLyBTZWN0aW9uOiBDb21tZW50XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21tZW50IGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG5cbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtyb3d9ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3Qgcm93UmFuZ2UgPSB0aGlzLnV0aWxzLmdldFJvd1JhbmdlRm9yQ29tbWVudEF0QnVmZmVyUm93KHRoaXMuZWRpdG9yLCByb3cpXG4gICAgaWYgKHJvd1JhbmdlKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHJvd1JhbmdlKVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBCbG9ja0NvbW1lbnQgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9ICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICAvLyBGb2xsb3dpbmcgb25lLWNvbHVtbi1yaWdodCB0cmFuc2xhdGlvbiBpcyBuZWNlc3Nhcnkgd2hlbiBjdXJzb3IgaXMgXCJvblwiIGAvYCBjaGFyIG9mIGJlZ2lubmluZyBgLypgLlxuICAgIGNvbnN0IGZyb20gPSB0aGlzLmVkaXRvci5jbGlwQnVmZmVyUG9zaXRpb24odGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnRyYW5zbGF0ZShbMCwgMV0pKVxuXG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldEJsb2NrQ29tbWVudFJhbmdlRm9yUG9pbnQoZnJvbSlcbiAgICBpZiAocmFuZ2UpIHtcbiAgICAgIHJhbmdlLnN0YXJ0ID0gdGhpcy5nZXRTdGFydE9mQmxvY2tDb21tZW50KHJhbmdlLnN0YXJ0KVxuICAgICAgcmFuZ2UuZW5kID0gdGhpcy5nZXRFbmRPZkJsb2NrQ29tbWVudChyYW5nZS5lbmQpXG4gICAgICBjb25zdCBzY2FuUmFuZ2UgPSByYW5nZVxuXG4gICAgICBpZiAodGhpcy5pc0lubmVyKCkpIHtcbiAgICAgICAgdGhpcy5zY2FuRWRpdG9yKCdmb3J3YXJkJywgL1xccysvLCB7c2NhblJhbmdlfSwgZXZlbnQgPT4ge1xuICAgICAgICAgIHJhbmdlLnN0YXJ0ID0gZXZlbnQucmFuZ2UuZW5kXG4gICAgICAgICAgZXZlbnQuc3RvcCgpXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuc2NhbkVkaXRvcignYmFja3dhcmQnLCAvXFxzKy8sIHtzY2FuUmFuZ2V9LCBldmVudCA9PiB7XG4gICAgICAgICAgcmFuZ2UuZW5kID0gZXZlbnQucmFuZ2Uuc3RhcnRcbiAgICAgICAgICBldmVudC5zdG9wKClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHJldHVybiByYW5nZVxuICAgIH1cbiAgfVxuXG4gIGdldFN0YXJ0T2ZCbG9ja0NvbW1lbnQgKHN0YXJ0KSB7XG4gICAgd2hpbGUgKHN0YXJ0LmNvbHVtbiA9PT0gMCkge1xuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldEJsb2NrQ29tbWVudFJhbmdlRm9yUG9pbnQoc3RhcnQudHJhbnNsYXRlKFstMSwgSW5maW5pdHldKSlcbiAgICAgIGlmICghcmFuZ2UpIGJyZWFrXG4gICAgICBzdGFydCA9IHJhbmdlLnN0YXJ0XG4gICAgfVxuICAgIHJldHVybiBzdGFydFxuICB9XG5cbiAgZ2V0RW5kT2ZCbG9ja0NvbW1lbnQgKGVuZCkge1xuICAgIHdoaWxlICh0aGlzLnV0aWxzLnBvaW50SXNBdEVuZE9mTGluZSh0aGlzLmVkaXRvciwgZW5kKSkge1xuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldEJsb2NrQ29tbWVudFJhbmdlRm9yUG9pbnQoW2VuZC5yb3cgKyAxLCAwXSlcbiAgICAgIGlmICghcmFuZ2UpIGJyZWFrXG4gICAgICBlbmQgPSByYW5nZS5lbmRcbiAgICB9XG4gICAgcmV0dXJuIGVuZFxuICB9XG5cbiAgZ2V0QmxvY2tDb21tZW50UmFuZ2VGb3JQb2ludCAocG9pbnQpIHtcbiAgICBjb25zdCBzY29wZSA9ICdjb21tZW50LmJsb2NrJ1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5idWZmZXJSYW5nZUZvclNjb3BlQXRQb3NpdGlvbihzY29wZSwgcG9pbnQpXG4gIH1cbn1cblxuY2xhc3MgQ29tbWVudE9yUGFyYWdyYXBoIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG5cbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtpbm5lcn0gPSB0aGlzXG4gICAgZm9yIChjb25zdCBrbGFzcyBvZiBbJ0NvbW1lbnQnLCAnUGFyYWdyYXBoJ10pIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5nZXRJbnN0YW5jZShrbGFzcywge2lubmVyfSkuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICAgICAgaWYgKHJhbmdlKSB7XG4gICAgICAgIHJldHVybiByYW5nZVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyBTZWN0aW9uOiBGb2xkXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBGb2xkIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG5cbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtyb3d9ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3Qgc2VsZWN0ZWRSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgY29uc3QgZm9sZFJhbmdlcyA9IHRoaXMudXRpbHMuZ2V0Q29kZUZvbGRSYW5nZXModGhpcy5lZGl0b3IpXG4gICAgY29uc3QgZm9sZFJhbmdlc0NvbnRhaW5zQ3Vyc29yUm93ID0gZm9sZFJhbmdlcy5maWx0ZXIocmFuZ2UgPT4gcmFuZ2Uuc3RhcnQucm93IDw9IHJvdyAmJiByb3cgPD0gcmFuZ2UuZW5kLnJvdylcbiAgICBjb25zdCB1c2VUcmVlU2l0dGVyID0gdGhpcy51dGlscy5pc1VzaW5nVHJlZVNpdHRlcihzZWxlY3Rpb24uZWRpdG9yKVxuXG4gICAgZm9yIChsZXQgZm9sZFJhbmdlIG9mIGZvbGRSYW5nZXNDb250YWluc0N1cnNvclJvdy5yZXZlcnNlKCkpIHtcbiAgICAgIGlmICh0aGlzLmlzQSgpKSB7XG4gICAgICAgIGZvbGRSYW5nZSA9IHVuaW9uQ29uam9pbmVkRm9sZFJhbmdlKGZvbGRSYW5nZSwgZm9sZFJhbmdlcywge3VzZVRyZWVTaXR0ZXJ9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMudXRpbHMuZG9lc1JhbmdlU3RhcnRBbmRFbmRXaXRoU2FtZUluZGVudExldmVsKHRoaXMuZWRpdG9yLCBmb2xkUmFuZ2UpKSB7XG4gICAgICAgICAgZm9sZFJhbmdlLmVuZC5yb3cgLT0gMVxuICAgICAgICB9XG4gICAgICAgIGZvbGRSYW5nZS5zdGFydC5yb3cgKz0gMVxuICAgICAgfVxuICAgICAgZm9sZFJhbmdlID0gdGhpcy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKFtmb2xkUmFuZ2Uuc3RhcnQucm93LCBmb2xkUmFuZ2UuZW5kLnJvd10pXG4gICAgICBpZiAoIXNlbGVjdGVkUmFuZ2UuY29udGFpbnNSYW5nZShmb2xkUmFuZ2UpKSB7XG4gICAgICAgIHJldHVybiBmb2xkUmFuZ2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdW5pb25Db25qb2luZWRGb2xkUmFuZ2UgKGZvbGRSYW5nZSwgZm9sZFJhbmdlcywge3VzZVRyZWVTaXR0ZXJ9KSB7XG4gIGNvbnN0IGluZGV4ID0gZm9sZFJhbmdlcy5maW5kSW5kZXgocmFuZ2UgPT4gcmFuZ2UgPT09IGZvbGRSYW5nZSlcblxuICAvLyBFeHRlbmQgdG8gZG93bndhcmRzXG4gIGZvciAobGV0IGkgPSBpbmRleCArIDE7IGkgPCBmb2xkUmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGZvbGRSYW5nZS5lbmQuY29sdW1uICE9PSBJbmZpbml0eSkgYnJlYWtcbiAgICBjb25zdCBlbmRSb3cgPSB1c2VUcmVlU2l0dGVyID8gZm9sZFJhbmdlLmVuZC5yb3cgKyAxIDogZm9sZFJhbmdlLmVuZC5yb3dcbiAgICBpZiAoZm9sZFJhbmdlc1tpXS5zdGFydC5pc0VxdWFsKFtlbmRSb3csIEluZmluaXR5XSkpIHtcbiAgICAgIGZvbGRSYW5nZSA9IGZvbGRSYW5nZS51bmlvbihmb2xkUmFuZ2VzW2ldKVxuICAgIH1cbiAgfVxuXG4gIC8vIEV4dGVuZCB0byB1cHdhcmRzXG4gIGZvciAobGV0IGkgPSBpbmRleCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGZvbGRSYW5nZS5zdGFydC5jb2x1bW4gIT09IEluZmluaXR5KSBicmVha1xuICAgIGNvbnN0IHN0YXJ0Um93ID0gdXNlVHJlZVNpdHRlciA/IGZvbGRSYW5nZS5zdGFydC5yb3cgLSAxIDogZm9sZFJhbmdlLnN0YXJ0LnJvd1xuICAgIGlmIChmb2xkUmFuZ2VzW2ldLmVuZC5pc0VxdWFsKFtzdGFydFJvdywgSW5maW5pdHldKSkge1xuICAgICAgZm9sZFJhbmdlID0gZm9sZFJhbmdlLnVuaW9uKGZvbGRSYW5nZXNbaV0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZvbGRSYW5nZVxufVxuXG5jbGFzcyBGdW5jdGlvbiBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gJ2xpbmV3aXNlJ1xuICBzY29wZU5hbWVzT21pdHRpbmdDbG9zaW5nQnJhY2UgPSBbJ3NvdXJjZS5nbycsICdzb3VyY2UuZWxpeGlyJ10gLy8gbGFuZ3VhZ2UgZG9lc24ndCBpbmNsdWRlIGNsb3NpbmcgYH1gIGludG8gZm9sZC5cblxuICBnZXRGdW5jdGlvbkJvZHlTdGFydFJlZ2V4ICh7c2NvcGVOYW1lfSkge1xuICAgIGlmIChzY29wZU5hbWUgPT09ICdzb3VyY2UucHl0aG9uJykge1xuICAgICAgcmV0dXJuIC86JC9cbiAgICB9IGVsc2UgaWYgKHNjb3BlTmFtZSA9PT0gJ3NvdXJjZS5jb2ZmZWUnKSB7XG4gICAgICByZXR1cm4gLy18PT4kL1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gL3skL1xuICAgIH1cbiAgfVxuXG4gIGlzTXVsdGlMaW5lUGFyYW1ldGVyRnVuY3Rpb25SYW5nZSAocGFyYW1ldGVyUmFuZ2UsIGJvZHlSYW5nZSwgYm9keVN0YXJ0UmVnZXgpIHtcbiAgICBjb25zdCBpc0JvZHlTdGFydFJvdyA9IHJvdyA9PiBib2R5U3RhcnRSZWdleC50ZXN0KHRoaXMuZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdykpXG4gICAgaWYgKGlzQm9keVN0YXJ0Um93KHBhcmFtZXRlclJhbmdlLnN0YXJ0LnJvdykpIHJldHVybiBmYWxzZVxuICAgIGlmIChpc0JvZHlTdGFydFJvdyhwYXJhbWV0ZXJSYW5nZS5lbmQucm93KSkgcmV0dXJuIHBhcmFtZXRlclJhbmdlLmVuZC5yb3cgPT09IGJvZHlSYW5nZS5zdGFydC5yb3dcbiAgICBpZiAoaXNCb2R5U3RhcnRSb3cocGFyYW1ldGVyUmFuZ2UuZW5kLnJvdyArIDEpKSByZXR1cm4gcGFyYW1ldGVyUmFuZ2UuZW5kLnJvdyArIDEgPT09IGJvZHlSYW5nZS5zdGFydC5yb3dcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGdldFJhbmdlV2l0aFRyZWVTaXR0ZXIgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IGVkaXRvciA9IHRoaXMuZWRpdG9yXG4gICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBjb25zdCBmaXJzdENoYXJhY3RlclBvc2l0aW9uID0gdGhpcy51dGlscy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHRoaXMuZWRpdG9yLCBjdXJzb3JQb3NpdGlvbi5yb3cpXG4gICAgY29uc3Qgc2VhcmNoU3RhcnRQb2ludCA9IFBvaW50Lm1heChmaXJzdENoYXJhY3RlclBvc2l0aW9uLCBjdXJzb3JQb3NpdGlvbilcbiAgICBjb25zdCBzdGFydE5vZGUgPSBlZGl0b3IubGFuZ3VhZ2VNb2RlLmdldFN5bnRheE5vZGVBdFBvc2l0aW9uKHNlYXJjaFN0YXJ0UG9pbnQpXG5cbiAgICBjb25zdCBub2RlID0gdGhpcy51dGlscy5maW5kUGFyZW50Tm9kZUZvckZ1bmN0aW9uVHlwZShlZGl0b3IsIHN0YXJ0Tm9kZSlcbiAgICBpZiAobm9kZSkge1xuICAgICAgbGV0IHJhbmdlID0gbm9kZS5yYW5nZVxuXG4gICAgICBpZiAoIXRoaXMuaXNBKCkpIHtcbiAgICAgICAgY29uc3QgYm9keU5vZGUgPSB0aGlzLnV0aWxzLmZpbmRGdW5jdGlvbkJvZHlOb2RlKGVkaXRvciwgbm9kZSlcbiAgICAgICAgaWYgKGJvZHlOb2RlKSB7XG4gICAgICAgICAgcmFuZ2UgPSBib2R5Tm9kZS5yYW5nZVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW5kUm93VHJhbnNsYXRpb24gPSB0aGlzLnV0aWxzLmRvZXNSYW5nZVN0YXJ0QW5kRW5kV2l0aFNhbWVJbmRlbnRMZXZlbChlZGl0b3IsIHJhbmdlKSA/IC0xIDogMFxuICAgICAgICByYW5nZSA9IHJhbmdlLnRyYW5zbGF0ZShbMSwgMF0sIFtlbmRSb3dUcmFuc2xhdGlvbiwgMF0pXG4gICAgICB9XG4gICAgICBpZiAocmFuZ2UuZW5kLmNvbHVtbiAhPT0gMCkge1xuICAgICAgICAvLyBUaGUgJ3ByZXByb2NfZnVuY3Rpb25fZGVmJyB0eXBlIHVzZWQgaW4gQyBhbmQgQysrIGhlYWRlcidzIFwiI2RlZmluZVwiIHJldHVybnMgbGluZXdpc2UgcmFuZ2UuXG4gICAgICAgIC8vIEluIHRoaXMgY2FzZSwgd2Ugc2hvdWxkbid0IHRyYW5zbGF0ZSB0byBsaW5ld2lzZSBzaW5jZSBpdCBhbHJlYWR5IGNvbnRhaW5zIGVuZGluZyBuZXdsaW5lLlxuICAgICAgICByYW5nZSA9IHRoaXMudXRpbHMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShlZGl0b3IsIFtyYW5nZS5zdGFydC5yb3csIHJhbmdlLmVuZC5yb3ddKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJhbmdlXG4gICAgfVxuICB9XG5cbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHVzZVRyZWVTaXR0ZXIgPSB0aGlzLnV0aWxzLmlzVXNpbmdUcmVlU2l0dGVyKHNlbGVjdGlvbi5lZGl0b3IpXG4gICAgaWYgKHVzZVRyZWVTaXR0ZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFJhbmdlV2l0aFRyZWVTaXR0ZXIoc2VsZWN0aW9uKVxuICAgIH1cblxuICAgIGNvbnN0IGVkaXRvciA9IHRoaXMuZWRpdG9yXG4gICAgY29uc3QgY3Vyc29yUm93ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIGNvbnN0IGJvZHlTdGFydFJlZ2V4ID0gdGhpcy5nZXRGdW5jdGlvbkJvZHlTdGFydFJlZ2V4KGVkaXRvci5nZXRHcmFtbWFyKCkpXG4gICAgY29uc3QgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyA9IHJvdyA9PiB0aGlzLnV0aWxzLmlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3coZWRpdG9yLCByb3cpXG5cbiAgICBjb25zdCBmdW5jdGlvblJhbmdlcyA9IFtdXG4gICAgY29uc3Qgc2F2ZUZ1bmN0aW9uUmFuZ2UgPSAoe2FSYW5nZSwgaW5uZXJSYW5nZX0pID0+IHtcbiAgICAgIGZ1bmN0aW9uUmFuZ2VzLnB1c2goe1xuICAgICAgICBhUmFuZ2U6IHRoaXMuYnVpbGRBUmFuZ2UoYVJhbmdlKSxcbiAgICAgICAgaW5uZXJSYW5nZTogdGhpcy5idWlsZElubmVyUmFuZ2UoaW5uZXJSYW5nZSlcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY29uc3QgZm9sZFJhbmdlcyA9IHRoaXMudXRpbHMuZ2V0Q29kZUZvbGRSYW5nZXMoZWRpdG9yKVxuICAgIHdoaWxlIChmb2xkUmFuZ2VzLmxlbmd0aCkge1xuICAgICAgY29uc3QgcmFuZ2UgPSBmb2xkUmFuZ2VzLnNoaWZ0KClcbiAgICAgIGlmIChpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93KHJhbmdlLnN0YXJ0LnJvdykpIHtcbiAgICAgICAgY29uc3QgbmV4dFJhbmdlID0gZm9sZFJhbmdlc1swXVxuICAgICAgICBjb25zdCBuZXh0Rm9sZElzQ29ubmVjdGVkID0gbmV4dFJhbmdlICYmIG5leHRSYW5nZS5zdGFydC5yb3cgPD0gcmFuZ2UuZW5kLnJvdyArIDFcbiAgICAgICAgY29uc3QgbWF5YmVBRnVuY3Rpb25SYW5nZSA9IG5leHRGb2xkSXNDb25uZWN0ZWQgPyByYW5nZS51bmlvbihuZXh0UmFuZ2UpIDogcmFuZ2VcbiAgICAgICAgaWYgKCFtYXliZUFGdW5jdGlvblJhbmdlLmNvbnRhaW5zUG9pbnQoW2N1cnNvclJvdywgSW5maW5pdHldKSkgY29udGludWUgLy8gc2tpcCB0byBhdm9pZCBoZWF2eSBjb21wdXRhdGlvblxuICAgICAgICBpZiAobmV4dEZvbGRJc0Nvbm5lY3RlZCAmJiB0aGlzLmlzTXVsdGlMaW5lUGFyYW1ldGVyRnVuY3Rpb25SYW5nZShyYW5nZSwgbmV4dFJhbmdlLCBib2R5U3RhcnRSZWdleCkpIHtcbiAgICAgICAgICBjb25zdCBib2R5UmFuZ2UgPSBmb2xkUmFuZ2VzLnNoaWZ0KClcbiAgICAgICAgICBzYXZlRnVuY3Rpb25SYW5nZSh7YVJhbmdlOiByYW5nZS51bmlvbihib2R5UmFuZ2UpLCBpbm5lclJhbmdlOiBib2R5UmFuZ2V9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNhdmVGdW5jdGlvblJhbmdlKHthUmFuZ2U6IHJhbmdlLCBpbm5lclJhbmdlOiByYW5nZX0pXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHByZXZpb3VzUm93ID0gcmFuZ2Uuc3RhcnQucm93IC0gMVxuICAgICAgICBpZiAocHJldmlvdXNSb3cgPCAwKSBjb250aW51ZVxuICAgICAgICBpZiAoZWRpdG9yLmlzRm9sZGFibGVBdEJ1ZmZlclJvdyhwcmV2aW91c1JvdykpIGNvbnRpbnVlXG4gICAgICAgIGNvbnN0IG1heWJlQUZ1bmN0aW9uUmFuZ2UgPSByYW5nZS51bmlvbihlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocHJldmlvdXNSb3cpKVxuICAgICAgICBpZiAoIW1heWJlQUZ1bmN0aW9uUmFuZ2UuY29udGFpbnNQb2ludChbY3Vyc29yUm93LCBJbmZpbml0eV0pKSBjb250aW51ZSAvLyBza2lwIHRvIGF2b2lkIGhlYXZ5IGNvbXB1dGF0aW9uXG5cbiAgICAgICAgY29uc3QgaXNCb2R5U3RhcnRPbmx5Um93ID0gcm93ID0+XG4gICAgICAgICAgbmV3IFJlZ0V4cCgnXlxcXFxzKicgKyBib2R5U3RhcnRSZWdleC5zb3VyY2UpLnRlc3QoZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdykpXG4gICAgICAgIGlmIChpc0JvZHlTdGFydE9ubHlSb3cocmFuZ2Uuc3RhcnQucm93KSAmJiBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93KHByZXZpb3VzUm93KSkge1xuICAgICAgICAgIHNhdmVGdW5jdGlvblJhbmdlKHthUmFuZ2U6IG1heWJlQUZ1bmN0aW9uUmFuZ2UsIGlubmVyUmFuZ2U6IHJhbmdlfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgZnVuY3Rpb25SYW5nZSBvZiBmdW5jdGlvblJhbmdlcy5yZXZlcnNlKCkpIHtcbiAgICAgIGNvbnN0IHtzdGFydCwgZW5kfSA9IHRoaXMuaXNBKCkgPyBmdW5jdGlvblJhbmdlLmFSYW5nZSA6IGZ1bmN0aW9uUmFuZ2UuaW5uZXJSYW5nZVxuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UoW3N0YXJ0LnJvdywgZW5kLnJvd10pXG4gICAgICBpZiAoIXNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmNvbnRhaW5zUmFuZ2UocmFuZ2UpKSByZXR1cm4gcmFuZ2VcbiAgICB9XG4gIH1cblxuICBidWlsZElubmVyUmFuZ2UgKHJhbmdlKSB7XG4gICAgY29uc3QgZW5kUm93VHJhbnNsYXRpb24gPSB0aGlzLnV0aWxzLmRvZXNSYW5nZVN0YXJ0QW5kRW5kV2l0aFNhbWVJbmRlbnRMZXZlbCh0aGlzLmVkaXRvciwgcmFuZ2UpID8gLTEgOiAwXG4gICAgcmV0dXJuIHJhbmdlLnRyYW5zbGF0ZShbMSwgMF0sIFtlbmRSb3dUcmFuc2xhdGlvbiwgMF0pXG4gIH1cblxuICBidWlsZEFSYW5nZSAocmFuZ2UpIHtcbiAgICAvLyBOT1RFOiBUaGlzIGFkanVzdG1lbnQgc2hvdWQgbm90IGJlIG5lY2Vzc2FyeSBpZiBsYW5ndWFnZS1zeW50YXggaXMgcHJvcGVybHkgZGVmaW5lZC5cbiAgICBjb25zdCBlbmRSb3dUcmFuc2xhdGlvbiA9IHRoaXMuaXNHcmFtbWFyRG9lc05vdEZvbGRDbG9zaW5nUm93KCkgPyArMSA6IDBcbiAgICByZXR1cm4gcmFuZ2UudHJhbnNsYXRlKFswLCAwXSwgW2VuZFJvd1RyYW5zbGF0aW9uLCAwXSlcbiAgfVxuXG4gIGlzR3JhbW1hckRvZXNOb3RGb2xkQ2xvc2luZ1JvdyAoKSB7XG4gICAgY29uc3Qge3Njb3BlTmFtZSwgcGFja2FnZU5hbWV9ID0gdGhpcy5lZGl0b3IuZ2V0R3JhbW1hcigpXG4gICAgaWYgKHRoaXMuc2NvcGVOYW1lc09taXR0aW5nQ2xvc2luZ0JyYWNlLmluY2x1ZGVzKHNjb3BlTmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEhBQ0s6IFJ1c3QgaGF2ZSB0d28gcGFja2FnZSBgbGFuZ3VhZ2UtcnVzdGAgYW5kIGBhdG9tLWxhbmd1YWdlLXJ1c3RgXG4gICAgICAvLyBsYW5ndWFnZS1ydXN0IGRvbid0IGZvbGQgZW5kaW5nIGB9YCwgYnV0IGF0b20tbGFuZ3VhZ2UtcnVzdCBkb2VzLlxuICAgICAgcmV0dXJuIHNjb3BlTmFtZSA9PT0gJ3NvdXJjZS5ydXN0JyAmJiBwYWNrYWdlTmFtZSA9PT0gJ2xhbmd1YWdlLXJ1c3QnXG4gICAgfVxuICB9XG59XG5cbi8vIFNlY3Rpb246IE90aGVyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBBcmd1bWVudHMgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgbmV3QXJnSW5mbyAoYXJnU3RhcnQsIGFyZywgc2VwYXJhdG9yKSB7XG4gICAgY29uc3QgYXJnRW5kID0gdGhpcy51dGlscy50cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnU3RhcnQsIGFyZylcbiAgICBjb25zdCBhcmdSYW5nZSA9IG5ldyBSYW5nZShhcmdTdGFydCwgYXJnRW5kKVxuXG4gICAgY29uc3Qgc2VwYXJhdG9yRW5kID0gdGhpcy51dGlscy50cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnRW5kLCBzZXBhcmF0b3IgIT0gbnVsbCA/IHNlcGFyYXRvciA6ICcnKVxuICAgIGNvbnN0IHNlcGFyYXRvclJhbmdlID0gbmV3IFJhbmdlKGFyZ0VuZCwgc2VwYXJhdG9yRW5kKVxuXG4gICAgY29uc3QgaW5uZXJSYW5nZSA9IGFyZ1JhbmdlXG4gICAgY29uc3QgYVJhbmdlID0gYXJnUmFuZ2UudW5pb24oc2VwYXJhdG9yUmFuZ2UpXG4gICAgcmV0dXJuIHthcmdSYW5nZSwgc2VwYXJhdG9yUmFuZ2UsIGlubmVyUmFuZ2UsIGFSYW5nZX1cbiAgfVxuXG4gIGdldEFyZ3VtZW50c1JhbmdlRm9yU2VsZWN0aW9uIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgbWVtYmVyOiBbJ0N1cmx5QnJhY2tldCcsICdTcXVhcmVCcmFja2V0JywgJ1BhcmVudGhlc2lzJ10sXG4gICAgICBpbmNsdXNpdmU6IGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldEluc3RhbmNlKCdJbm5lckFueVBhaXInLCBvcHRpb25zKS5nZXRSYW5nZShzZWxlY3Rpb24pXG4gIH1cblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qge3NwbGl0QXJndW1lbnRzLCB0cmF2ZXJzZVRleHRGcm9tUG9pbnQsIGdldExhc3R9ID0gdGhpcy51dGlsc1xuICAgIGxldCByYW5nZSA9IHRoaXMuZ2V0QXJndW1lbnRzUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHBhaXJSYW5nZUZvdW5kID0gcmFuZ2UgIT0gbnVsbFxuXG4gICAgcmFuZ2UgPSByYW5nZSB8fCB0aGlzLmdldEluc3RhbmNlKCdJbm5lckN1cnJlbnRMaW5lJykuZ2V0UmFuZ2Uoc2VsZWN0aW9uKSAvLyBmYWxsYmFja1xuICAgIGlmICghcmFuZ2UpIHJldHVyblxuXG4gICAgcmFuZ2UgPSB0aGlzLnRyaW1CdWZmZXJSYW5nZShyYW5nZSlcblxuICAgIGNvbnN0IHRleHQgPSB0aGlzLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICBjb25zdCBhbGxUb2tlbnMgPSBzcGxpdEFyZ3VtZW50cyh0ZXh0LCBwYWlyUmFuZ2VGb3VuZClcblxuICAgIGNvbnN0IGFyZ0luZm9zID0gW11cbiAgICBsZXQgYXJnU3RhcnQgPSByYW5nZS5zdGFydFxuXG4gICAgLy8gU2tpcCBzdGFydGluZyBzZXBhcmF0b3JcbiAgICBpZiAoYWxsVG9rZW5zLmxlbmd0aCAmJiBhbGxUb2tlbnNbMF0udHlwZSA9PT0gJ3NlcGFyYXRvcicpIHtcbiAgICAgIGNvbnN0IHRva2VuID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIGFyZ1N0YXJ0ID0gdHJhdmVyc2VUZXh0RnJvbVBvaW50KGFyZ1N0YXJ0LCB0b2tlbi50ZXh0KVxuICAgIH1cblxuICAgIHdoaWxlIChhbGxUb2tlbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCB0b2tlbiA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ2FyZ3VtZW50Jykge1xuICAgICAgICBjb25zdCBuZXh0VG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgICBjb25zdCBzZXBhcmF0b3IgPSBuZXh0VG9rZW4gPyBuZXh0VG9rZW4udGV4dCA6IHVuZGVmaW5lZFxuICAgICAgICBjb25zdCBhcmdJbmZvID0gdGhpcy5uZXdBcmdJbmZvKGFyZ1N0YXJ0LCB0b2tlbi50ZXh0LCBzZXBhcmF0b3IpXG5cbiAgICAgICAgaWYgKGFsbFRva2Vucy5sZW5ndGggPT09IDAgJiYgYXJnSW5mb3MubGVuZ3RoKSB7XG4gICAgICAgICAgYXJnSW5mby5hUmFuZ2UgPSBhcmdJbmZvLmFyZ1JhbmdlLnVuaW9uKGdldExhc3QoYXJnSW5mb3MpLnNlcGFyYXRvclJhbmdlKVxuICAgICAgICB9XG5cbiAgICAgICAgYXJnU3RhcnQgPSBhcmdJbmZvLmFSYW5nZS5lbmRcbiAgICAgICAgYXJnSW5mb3MucHVzaChhcmdJbmZvKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdtdXN0IG5vdCBoYXBwZW4nKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgZm9yIChjb25zdCB7aW5uZXJSYW5nZSwgYVJhbmdlfSBvZiBhcmdJbmZvcykge1xuICAgICAgaWYgKGlubmVyUmFuZ2UuZW5kLmlzR3JlYXRlclRoYW5PckVxdWFsKHBvaW50KSkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0lubmVyKCkgPyBpbm5lclJhbmdlIDogYVJhbmdlXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIEN1cnJlbnRMaW5lIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7cm93fSA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHJhbmdlID0gdGhpcy5lZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KVxuICAgIHJldHVybiB0aGlzLmlzQSgpID8gcmFuZ2UgOiB0aGlzLnRyaW1CdWZmZXJSYW5nZShyYW5nZSlcbiAgfVxufVxuXG5jbGFzcyBFbnRpcmUgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9ICdsaW5ld2lzZSdcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmJ1ZmZlci5nZXRSYW5nZSgpXG4gIH1cbn1cblxuY2xhc3MgRW1wdHkgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBzZWxlY3RPbmNlID0gdHJ1ZVxufVxuXG5jbGFzcyBMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IG51bGxcbiAgc2VsZWN0T25jZSA9IHRydWVcbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy52aW1TdGF0ZS5tYXJrLmdldCgnWycpXG4gICAgY29uc3QgZW5kID0gdGhpcy52aW1TdGF0ZS5tYXJrLmdldCgnXScpXG4gICAgaWYgKHN0YXJ0ICYmIGVuZCkge1xuICAgICAgcmV0dXJuIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBTZWFyY2hNYXRjaEZvcndhcmQgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgYmFja3dhcmQgPSBmYWxzZVxuXG4gIGZpbmRNYXRjaCAoZnJvbSwgcmVnZXgpIHtcbiAgICBpZiAodGhpcy5iYWNrd2FyZCkge1xuICAgICAgaWYgKHRoaXMubW9kZSA9PT0gJ3Zpc3VhbCcpIHtcbiAgICAgICAgZnJvbSA9IHRoaXMudXRpbHMudHJhbnNsYXRlUG9pbnRBbmRDbGlwKHRoaXMuZWRpdG9yLCBmcm9tLCAnYmFja3dhcmQnKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBvcHRpb25zID0ge2Zyb206IFtmcm9tLnJvdywgSW5maW5pdHldfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmFuZ2U6IHRoaXMuZmluZEluRWRpdG9yKCdiYWNrd2FyZCcsIHJlZ2V4LCBvcHRpb25zLCAoe3JhbmdlfSkgPT4gcmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihmcm9tKSAmJiByYW5nZSksXG4gICAgICAgIHdoaWNoSXNIZWFkOiAnc3RhcnQnXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09ICd2aXN1YWwnKSB7XG4gICAgICAgIGZyb20gPSB0aGlzLnV0aWxzLnRyYW5zbGF0ZVBvaW50QW5kQ2xpcCh0aGlzLmVkaXRvciwgZnJvbSwgJ2ZvcndhcmQnKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBvcHRpb25zID0ge2Zyb206IFtmcm9tLnJvdywgMF19XG4gICAgICByZXR1cm4ge1xuICAgICAgICByYW5nZTogdGhpcy5maW5kSW5FZGl0b3IoJ2ZvcndhcmQnLCByZWdleCwgb3B0aW9ucywgKHtyYW5nZX0pID0+IHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKGZyb20pICYmIHJhbmdlKSxcbiAgICAgICAgd2hpY2hJc0hlYWQ6ICdlbmQnXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHBhdHRlcm4gPSB0aGlzLmdsb2JhbFN0YXRlLmdldCgnbGFzdFNlYXJjaFBhdHRlcm4nKVxuICAgIGlmICghcGF0dGVybikgcmV0dXJuXG5cbiAgICBjb25zdCBmcm9tUG9pbnQgPSBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICBjb25zdCB7cmFuZ2UsIHdoaWNoSXNIZWFkfSA9IHRoaXMuZmluZE1hdGNoKGZyb21Qb2ludCwgcGF0dGVybilcbiAgICBpZiAocmFuZ2UpIHtcbiAgICAgIHJldHVybiB0aGlzLnVuaW9uUmFuZ2VBbmREZXRlcm1pbmVSZXZlcnNlZFN0YXRlKHNlbGVjdGlvbiwgcmFuZ2UsIHdoaWNoSXNIZWFkKVxuICAgIH1cbiAgfVxuXG4gIHVuaW9uUmFuZ2VBbmREZXRlcm1pbmVSZXZlcnNlZFN0YXRlIChzZWxlY3Rpb24sIHJhbmdlLCB3aGljaElzSGVhZCkge1xuICAgIGlmIChzZWxlY3Rpb24uaXNFbXB0eSgpKSByZXR1cm4gcmFuZ2VcblxuICAgIGxldCBoZWFkID0gcmFuZ2Vbd2hpY2hJc0hlYWRdXG4gICAgY29uc3QgdGFpbCA9IHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgaWYgKHRoaXMuYmFja3dhcmQpIHtcbiAgICAgIGlmICh0YWlsLmlzTGVzc1RoYW4oaGVhZCkpIGhlYWQgPSB0aGlzLnV0aWxzLnRyYW5zbGF0ZVBvaW50QW5kQ2xpcCh0aGlzLmVkaXRvciwgaGVhZCwgJ2ZvcndhcmQnKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaGVhZC5pc0xlc3NUaGFuKHRhaWwpKSBoZWFkID0gdGhpcy51dGlscy50cmFuc2xhdGVQb2ludEFuZENsaXAodGhpcy5lZGl0b3IsIGhlYWQsICdiYWNrd2FyZCcpXG4gICAgfVxuXG4gICAgdGhpcy5yZXZlcnNlZCA9IGhlYWQuaXNMZXNzVGhhbih0YWlsKVxuICAgIHJldHVybiBuZXcgUmFuZ2UodGFpbCwgaGVhZCkudW5pb24odGhpcy5zd3JhcChzZWxlY3Rpb24pLmdldFRhaWxCdWZmZXJSYW5nZSgpKVxuICB9XG5cbiAgc2VsZWN0VGV4dE9iamVjdCAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICBpZiAocmFuZ2UpIHtcbiAgICAgIHRoaXMuc3dyYXAoc2VsZWN0aW9uKS5zZXRCdWZmZXJSYW5nZShyYW5nZSwge3JldmVyc2VkOiB0aGlzLnJldmVyc2VkICE9IG51bGwgPyB0aGlzLnJldmVyc2VkIDogdGhpcy5iYWNrd2FyZH0pXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBTZWFyY2hNYXRjaEJhY2t3YXJkIGV4dGVuZHMgU2VhcmNoTWF0Y2hGb3J3YXJkIHtcbiAgYmFja3dhcmQgPSB0cnVlXG59XG5cbi8vIFtMaW1pdGF0aW9uOiB3b24ndCBmaXhdOiBTZWxlY3RlZCByYW5nZSBpcyBub3Qgc3VibW9kZSBhd2FyZS4gYWx3YXlzIGNoYXJhY3Rlcndpc2UuXG4vLyBTbyBldmVuIGlmIG9yaWdpbmFsIHNlbGVjdGlvbiB3YXMgdkwgb3IgdkIsIHNlbGVjdGVkIHJhbmdlIGJ5IHRoaXMgdGV4dC1vYmplY3Rcbi8vIGlzIGFsd2F5cyB2QyByYW5nZS5cbmNsYXNzIFByZXZpb3VzU2VsZWN0aW9uIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSBudWxsXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG5cbiAgc2VsZWN0VGV4dE9iamVjdCAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qge3Byb3BlcnRpZXMsIHN1Ym1vZGV9ID0gdGhpcy52aW1TdGF0ZS5wcmV2aW91c1NlbGVjdGlvblxuICAgIGlmIChwcm9wZXJ0aWVzICYmIHN1Ym1vZGUpIHtcbiAgICAgIHRoaXMud2lzZSA9IHN1Ym1vZGVcbiAgICAgIHRoaXMuc3dyYXAodGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKS5zZWxlY3RCeVByb3BlcnRpZXMocHJvcGVydGllcylcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IG51bGxcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBzZWxlY3RUZXh0T2JqZWN0IChzZWxlY3Rpb24pIHtcbiAgICBpZiAodGhpcy52aW1TdGF0ZS5oYXNQZXJzaXN0ZW50U2VsZWN0aW9ucygpKSB7XG4gICAgICB0aGlzLnBlcnNpc3RlbnRTZWxlY3Rpb24uc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbn1cblxuLy8gVXNlZCBvbmx5IGJ5IFJlcGxhY2VXaXRoUmVnaXN0ZXIgYW5kIFB1dEJlZm9yZSBhbmQgaXRzJyBjaGlsZHJlbi5cbmNsYXNzIExhc3RQYXN0ZWRSYW5nZSBleHRlbmRzIFRleHRPYmplY3Qge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHdpc2UgPSBudWxsXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG5cbiAgc2VsZWN0VGV4dE9iamVjdCAoc2VsZWN0aW9uKSB7XG4gICAgZm9yIChzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5nZXRQYXN0ZWRSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cbn1cblxuY2xhc3MgVmlzaWJsZUFyZWEgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgW3N0YXJ0Um93LCBlbmRSb3ddID0gdGhpcy5lZGl0b3IuZ2V0VmlzaWJsZVJvd1JhbmdlKClcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY3JlZW5SYW5nZShbW3N0YXJ0Um93LCAwXSwgW2VuZFJvdywgSW5maW5pdHldXSlcbiAgfVxufVxuXG5jbGFzcyBEaWZmSHVuayBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gJ2xpbmV3aXNlJ1xuICBzZWxlY3RPbmNlID0gdHJ1ZVxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgcm93ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmdldEh1bmtSYW5nZUF0QnVmZmVyUm93KHRoaXMuZWRpdG9yLCByb3cpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduKFxuICB7XG4gICAgVGV4dE9iamVjdCxcbiAgICBXb3JkLFxuICAgIFdob2xlV29yZCxcbiAgICBTbWFydFdvcmQsXG4gICAgU3Vid29yZCxcbiAgICBQYWlyLFxuICAgIEFQYWlyLFxuICAgIEFueVBhaXIsXG4gICAgQW55UGFpckFsbG93Rm9yd2FyZGluZyxcbiAgICBBbnlRdW90ZSxcbiAgICBRdW90ZSxcbiAgICBEb3VibGVRdW90ZSxcbiAgICBTaW5nbGVRdW90ZSxcbiAgICBCYWNrVGljayxcbiAgICBDdXJseUJyYWNrZXQsXG4gICAgU3F1YXJlQnJhY2tldCxcbiAgICBQYXJlbnRoZXNpcyxcbiAgICBBbmdsZUJyYWNrZXQsXG4gICAgVGFnLFxuICAgIFBhcmFncmFwaCxcbiAgICBJbmRlbnRhdGlvbixcbiAgICBDb21tZW50LFxuICAgIENvbW1lbnRPclBhcmFncmFwaCxcbiAgICBGb2xkLFxuICAgIEZ1bmN0aW9uLFxuICAgIEFyZ3VtZW50cyxcbiAgICBDdXJyZW50TGluZSxcbiAgICBFbnRpcmUsXG4gICAgRW1wdHksXG4gICAgTGF0ZXN0Q2hhbmdlLFxuICAgIFNlYXJjaE1hdGNoRm9yd2FyZCxcbiAgICBTZWFyY2hNYXRjaEJhY2t3YXJkLFxuICAgIFByZXZpb3VzU2VsZWN0aW9uLFxuICAgIFBlcnNpc3RlbnRTZWxlY3Rpb24sXG4gICAgTGFzdFBhc3RlZFJhbmdlLFxuICAgIFZpc2libGVBcmVhXG4gIH0sXG4gIFdvcmQuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFdob2xlV29yZC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgU21hcnRXb3JkLmRlcml2ZUNsYXNzKHRydWUpLFxuICBTdWJ3b3JkLmRlcml2ZUNsYXNzKHRydWUpLFxuICBBbnlQYWlyLmRlcml2ZUNsYXNzKHRydWUpLFxuICBBbnlQYWlyQWxsb3dGb3J3YXJkaW5nLmRlcml2ZUNsYXNzKHRydWUpLFxuICBBbnlRdW90ZS5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgRG91YmxlUXVvdGUuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFNpbmdsZVF1b3RlLmRlcml2ZUNsYXNzKHRydWUpLFxuICBCYWNrVGljay5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQ3VybHlCcmFja2V0LmRlcml2ZUNsYXNzKHRydWUsIHRydWUpLFxuICBTcXVhcmVCcmFja2V0LmRlcml2ZUNsYXNzKHRydWUsIHRydWUpLFxuICBQYXJlbnRoZXNpcy5kZXJpdmVDbGFzcyh0cnVlLCB0cnVlKSxcbiAgQW5nbGVCcmFja2V0LmRlcml2ZUNsYXNzKHRydWUsIHRydWUpLFxuICBUYWcuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFBhcmFncmFwaC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgSW5kZW50YXRpb24uZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIENvbW1lbnQuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEJsb2NrQ29tbWVudC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQ29tbWVudE9yUGFyYWdyYXBoLmRlcml2ZUNsYXNzKHRydWUpLFxuICBGb2xkLmRlcml2ZUNsYXNzKHRydWUpLFxuICBGdW5jdGlvbi5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQXJndW1lbnRzLmRlcml2ZUNsYXNzKHRydWUpLFxuICBDdXJyZW50TGluZS5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgRW50aXJlLmRlcml2ZUNsYXNzKHRydWUpLFxuICBMYXRlc3RDaGFuZ2UuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFBlcnNpc3RlbnRTZWxlY3Rpb24uZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFZpc2libGVBcmVhLmRlcml2ZUNsYXNzKHRydWUpLFxuICBEaWZmSHVuay5kZXJpdmVDbGFzcyh0cnVlKVxuKVxuIl19