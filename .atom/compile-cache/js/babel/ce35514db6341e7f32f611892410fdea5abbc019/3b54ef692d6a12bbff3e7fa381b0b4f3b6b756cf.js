'use babel';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var changeCase = require('change-case');
var selectList = undefined;

var _require = require('atom');

var BufferedProcess = _require.BufferedProcess;

var _require2 = require('./operator');

var Operator = _require2.Operator;

// TransformString
// ================================

var TransformString = (function (_Operator) {
  _inherits(TransformString, _Operator);

  function TransformString() {
    _classCallCheck(this, TransformString);

    _get(Object.getPrototypeOf(TransformString.prototype), 'constructor', this).apply(this, arguments);

    this.trackChange = true;
    this.stayOptionName = 'stayOnTransformString';
    this.autoIndent = false;
    this.autoIndentNewline = false;
    this.replaceByDiff = false;
  }

  _createClass(TransformString, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var text = this.getNewText(selection.getText(), selection);
      if (text) {
        if (this.replaceByDiff) {
          this.replaceTextInRangeViaDiff(selection.getBufferRange(), text);
        } else {
          selection.insertText(text, { autoIndent: this.autoIndent, autoIndentNewline: this.autoIndentNewline });
        }
      }
    }
  }], [{
    key: 'registerToSelectList',
    value: function registerToSelectList() {
      this.stringTransformers.push(this);
    }
  }, {
    key: 'command',
    value: false,
    enumerable: true
  }, {
    key: 'stringTransformers',
    value: [],
    enumerable: true
  }]);

  return TransformString;
})(Operator);

var ChangeCase = (function (_TransformString) {
  _inherits(ChangeCase, _TransformString);

  function ChangeCase() {
    _classCallCheck(this, ChangeCase);

    _get(Object.getPrototypeOf(ChangeCase.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ChangeCase, [{
    key: 'getNewText',
    value: function getNewText(text) {
      var functionName = this.functionName || changeCase.lowerCaseFirst(this.name);
      // HACK: Pure Vim's `~` is too aggressive(e.g. remove punctuation, remove white spaces...).
      // Here intentionally making changeCase less aggressive by narrowing target charset.
      var charset = '[À-ʯΆ-և\\w]';
      var regex = new RegExp(charset + '+(:?[-./]?' + charset + '+)*', 'g');
      return text.replace(regex, function (match) {
        return changeCase[functionName](match);
      });
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return ChangeCase;
})(TransformString);

var NoCase = (function (_ChangeCase) {
  _inherits(NoCase, _ChangeCase);

  function NoCase() {
    _classCallCheck(this, NoCase);

    _get(Object.getPrototypeOf(NoCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return NoCase;
})(ChangeCase);

var DotCase = (function (_ChangeCase2) {
  _inherits(DotCase, _ChangeCase2);

  function DotCase() {
    _classCallCheck(this, DotCase);

    _get(Object.getPrototypeOf(DotCase.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DotCase, null, [{
    key: 'displayNameSuffix',
    value: '.',
    enumerable: true
  }]);

  return DotCase;
})(ChangeCase);

var SwapCase = (function (_ChangeCase3) {
  _inherits(SwapCase, _ChangeCase3);

  function SwapCase() {
    _classCallCheck(this, SwapCase);

    _get(Object.getPrototypeOf(SwapCase.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SwapCase, null, [{
    key: 'displayNameSuffix',
    value: '~',
    enumerable: true
  }]);

  return SwapCase;
})(ChangeCase);

var PathCase = (function (_ChangeCase4) {
  _inherits(PathCase, _ChangeCase4);

  function PathCase() {
    _classCallCheck(this, PathCase);

    _get(Object.getPrototypeOf(PathCase.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(PathCase, null, [{
    key: 'displayNameSuffix',
    value: '/',
    enumerable: true
  }]);

  return PathCase;
})(ChangeCase);

var UpperCase = (function (_ChangeCase5) {
  _inherits(UpperCase, _ChangeCase5);

  function UpperCase() {
    _classCallCheck(this, UpperCase);

    _get(Object.getPrototypeOf(UpperCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return UpperCase;
})(ChangeCase);

var LowerCase = (function (_ChangeCase6) {
  _inherits(LowerCase, _ChangeCase6);

  function LowerCase() {
    _classCallCheck(this, LowerCase);

    _get(Object.getPrototypeOf(LowerCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return LowerCase;
})(ChangeCase);

var CamelCase = (function (_ChangeCase7) {
  _inherits(CamelCase, _ChangeCase7);

  function CamelCase() {
    _classCallCheck(this, CamelCase);

    _get(Object.getPrototypeOf(CamelCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return CamelCase;
})(ChangeCase);

var SnakeCase = (function (_ChangeCase8) {
  _inherits(SnakeCase, _ChangeCase8);

  function SnakeCase() {
    _classCallCheck(this, SnakeCase);

    _get(Object.getPrototypeOf(SnakeCase.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SnakeCase, null, [{
    key: 'displayNameSuffix',
    value: '_',
    enumerable: true
  }]);

  return SnakeCase;
})(ChangeCase);

var TitleCase = (function (_ChangeCase9) {
  _inherits(TitleCase, _ChangeCase9);

  function TitleCase() {
    _classCallCheck(this, TitleCase);

    _get(Object.getPrototypeOf(TitleCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return TitleCase;
})(ChangeCase);

var ParamCase = (function (_ChangeCase10) {
  _inherits(ParamCase, _ChangeCase10);

  function ParamCase() {
    _classCallCheck(this, ParamCase);

    _get(Object.getPrototypeOf(ParamCase.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ParamCase, null, [{
    key: 'displayNameSuffix',
    value: '-',
    enumerable: true
  }]);

  return ParamCase;
})(ChangeCase);

var HeaderCase = (function (_ChangeCase11) {
  _inherits(HeaderCase, _ChangeCase11);

  function HeaderCase() {
    _classCallCheck(this, HeaderCase);

    _get(Object.getPrototypeOf(HeaderCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return HeaderCase;
})(ChangeCase);

var PascalCase = (function (_ChangeCase12) {
  _inherits(PascalCase, _ChangeCase12);

  function PascalCase() {
    _classCallCheck(this, PascalCase);

    _get(Object.getPrototypeOf(PascalCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return PascalCase;
})(ChangeCase);

var ConstantCase = (function (_ChangeCase13) {
  _inherits(ConstantCase, _ChangeCase13);

  function ConstantCase() {
    _classCallCheck(this, ConstantCase);

    _get(Object.getPrototypeOf(ConstantCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return ConstantCase;
})(ChangeCase);

var SentenceCase = (function (_ChangeCase14) {
  _inherits(SentenceCase, _ChangeCase14);

  function SentenceCase() {
    _classCallCheck(this, SentenceCase);

    _get(Object.getPrototypeOf(SentenceCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return SentenceCase;
})(ChangeCase);

var UpperCaseFirst = (function (_ChangeCase15) {
  _inherits(UpperCaseFirst, _ChangeCase15);

  function UpperCaseFirst() {
    _classCallCheck(this, UpperCaseFirst);

    _get(Object.getPrototypeOf(UpperCaseFirst.prototype), 'constructor', this).apply(this, arguments);
  }

  return UpperCaseFirst;
})(ChangeCase);

var LowerCaseFirst = (function (_ChangeCase16) {
  _inherits(LowerCaseFirst, _ChangeCase16);

  function LowerCaseFirst() {
    _classCallCheck(this, LowerCaseFirst);

    _get(Object.getPrototypeOf(LowerCaseFirst.prototype), 'constructor', this).apply(this, arguments);
  }

  return LowerCaseFirst;
})(ChangeCase);

var DashCase = (function (_ChangeCase17) {
  _inherits(DashCase, _ChangeCase17);

  function DashCase() {
    _classCallCheck(this, DashCase);

    _get(Object.getPrototypeOf(DashCase.prototype), 'constructor', this).apply(this, arguments);

    this.functionName = 'paramCase';
  }

  _createClass(DashCase, null, [{
    key: 'displayNameSuffix',
    value: '-',
    enumerable: true
  }]);

  return DashCase;
})(ChangeCase);

var ToggleCase = (function (_ChangeCase18) {
  _inherits(ToggleCase, _ChangeCase18);

  function ToggleCase() {
    _classCallCheck(this, ToggleCase);

    _get(Object.getPrototypeOf(ToggleCase.prototype), 'constructor', this).apply(this, arguments);

    this.functionName = 'swapCase';
  }

  _createClass(ToggleCase, null, [{
    key: 'displayNameSuffix',
    value: '~',
    enumerable: true
  }]);

  return ToggleCase;
})(ChangeCase);

var ToggleCaseAndMoveRight = (function (_ChangeCase19) {
  _inherits(ToggleCaseAndMoveRight, _ChangeCase19);

  function ToggleCaseAndMoveRight() {
    _classCallCheck(this, ToggleCaseAndMoveRight);

    _get(Object.getPrototypeOf(ToggleCaseAndMoveRight.prototype), 'constructor', this).apply(this, arguments);

    this.functionName = 'swapCase';
    this.flashTarget = false;
    this.restorePositions = false;
    this.target = 'MoveRight';
  }

  // Replace
  // -------------------------
  return ToggleCaseAndMoveRight;
})(ChangeCase);

var Replace = (function (_TransformString2) {
  _inherits(Replace, _TransformString2);

  function Replace() {
    _classCallCheck(this, Replace);

    _get(Object.getPrototypeOf(Replace.prototype), 'constructor', this).apply(this, arguments);

    this.flashCheckpoint = 'did-select-occurrence';
    this.autoIndentNewline = true;
    this.readInputAfterSelect = true;
  }

  _createClass(Replace, [{
    key: 'getNewText',
    value: function getNewText(text) {
      if (this.target.name === 'MoveRightBufferColumn' && text.length !== this.getCount()) {
        return;
      }

      var input = this.input || '\n';
      if (input === '\n') {
        this.restorePositions = false;
      }
      return text.replace(/./g, input);
    }
  }]);

  return Replace;
})(TransformString);

var ReplaceCharacter = (function (_Replace) {
  _inherits(ReplaceCharacter, _Replace);

  function ReplaceCharacter() {
    _classCallCheck(this, ReplaceCharacter);

    _get(Object.getPrototypeOf(ReplaceCharacter.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveRightBufferColumn';
  }

  // -------------------------
  // DUP meaning with SplitString need consolidate.
  return ReplaceCharacter;
})(Replace);

var SplitByCharacter = (function (_TransformString3) {
  _inherits(SplitByCharacter, _TransformString3);

  function SplitByCharacter() {
    _classCallCheck(this, SplitByCharacter);

    _get(Object.getPrototypeOf(SplitByCharacter.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SplitByCharacter, [{
    key: 'getNewText',
    value: function getNewText(text) {
      return text.split('').join(' ');
    }
  }]);

  return SplitByCharacter;
})(TransformString);

var EncodeUriComponent = (function (_TransformString4) {
  _inherits(EncodeUriComponent, _TransformString4);

  function EncodeUriComponent() {
    _classCallCheck(this, EncodeUriComponent);

    _get(Object.getPrototypeOf(EncodeUriComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(EncodeUriComponent, [{
    key: 'getNewText',
    value: function getNewText(text) {
      return encodeURIComponent(text);
    }
  }], [{
    key: 'displayNameSuffix',
    value: '%',
    enumerable: true
  }]);

  return EncodeUriComponent;
})(TransformString);

var DecodeUriComponent = (function (_TransformString5) {
  _inherits(DecodeUriComponent, _TransformString5);

  function DecodeUriComponent() {
    _classCallCheck(this, DecodeUriComponent);

    _get(Object.getPrototypeOf(DecodeUriComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DecodeUriComponent, [{
    key: 'getNewText',
    value: function getNewText(text) {
      return decodeURIComponent(text);
    }
  }], [{
    key: 'displayNameSuffix',
    value: '%%',
    enumerable: true
  }]);

  return DecodeUriComponent;
})(TransformString);

var TrimString = (function (_TransformString6) {
  _inherits(TrimString, _TransformString6);

  function TrimString() {
    _classCallCheck(this, TrimString);

    _get(Object.getPrototypeOf(TrimString.prototype), 'constructor', this).apply(this, arguments);

    this.stayByMarker = true;
    this.replaceByDiff = true;
  }

  _createClass(TrimString, [{
    key: 'getNewText',
    value: function getNewText(text) {
      return text.trim();
    }
  }]);

  return TrimString;
})(TransformString);

var CompactSpaces = (function (_TransformString7) {
  _inherits(CompactSpaces, _TransformString7);

  function CompactSpaces() {
    _classCallCheck(this, CompactSpaces);

    _get(Object.getPrototypeOf(CompactSpaces.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(CompactSpaces, [{
    key: 'getNewText',
    value: function getNewText(text) {
      if (text.match(/^[ ]+$/)) {
        return ' ';
      } else {
        // Don't compact for leading and trailing white spaces.
        var regex = /^(\s*)(.*?)(\s*)$/gm;
        return text.replace(regex, function (m, leading, middle, trailing) {
          return leading + middle.split(/[ \t]+/).join(' ') + trailing;
        });
      }
    }
  }]);

  return CompactSpaces;
})(TransformString);

var AlignOccurrence = (function (_TransformString8) {
  _inherits(AlignOccurrence, _TransformString8);

  function AlignOccurrence() {
    _classCallCheck(this, AlignOccurrence);

    _get(Object.getPrototypeOf(AlignOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrence = true;
    this.whichToPad = 'auto';
  }

  _createClass(AlignOccurrence, [{
    key: 'getSelectionTaker',
    value: function getSelectionTaker() {
      var selectionsByRow = {};
      for (var selection of this.editor.getSelectionsOrderedByBufferPosition()) {
        var row = selection.getBufferRange().start.row;
        if (!(row in selectionsByRow)) selectionsByRow[row] = [];
        selectionsByRow[row].push(selection);
      }
      var allRows = Object.keys(selectionsByRow);
      return function () {
        return allRows.map(function (row) {
          return selectionsByRow[row].shift();
        }).filter(function (s) {
          return s;
        });
      };
    }
  }, {
    key: 'getWichToPadForText',
    value: function getWichToPadForText(text) {
      if (this.whichToPad !== 'auto') return this.whichToPad;

      if (/^\s*[=|]\s*$/.test(text)) {
        // Asignment(=) and `|`(markdown-table separator)
        return 'start';
      } else if (/^\s*,\s*$/.test(text)) {
        // Arguments
        return 'end';
      } else if (/\W$/.test(text)) {
        // ends with non-word-char
        return 'end';
      } else {
        return 'start';
      }
    }
  }, {
    key: 'calculatePadding',
    value: function calculatePadding() {
      var _this = this;

      var totalAmountOfPaddingByRow = {};
      var columnForSelection = function columnForSelection(selection) {
        var which = _this.getWichToPadForText(selection.getText());
        var point = selection.getBufferRange()[which];
        return point.column + (totalAmountOfPaddingByRow[point.row] || 0);
      };

      var takeSelections = this.getSelectionTaker();
      while (true) {
        var selections = takeSelections();
        if (!selections.length) return;
        var maxColumn = selections.map(columnForSelection).reduce(function (max, cur) {
          return cur > max ? cur : max;
        });
        for (var selection of selections) {
          var row = selection.getBufferRange().start.row;
          var amountOfPadding = maxColumn - columnForSelection(selection);
          totalAmountOfPaddingByRow[row] = (totalAmountOfPaddingByRow[row] || 0) + amountOfPadding;
          this.amountOfPaddingBySelection.set(selection, amountOfPadding);
        }
      }
    }
  }, {
    key: 'execute',
    value: function execute() {
      var _this2 = this;

      this.amountOfPaddingBySelection = new Map();
      this.onDidSelectTarget(function () {
        _this2.calculatePadding();
      });
      _get(Object.getPrototypeOf(AlignOccurrence.prototype), 'execute', this).call(this);
    }
  }, {
    key: 'getNewText',
    value: function getNewText(text, selection) {
      var padding = ' '.repeat(this.amountOfPaddingBySelection.get(selection));
      var whichToPad = this.getWichToPadForText(selection.getText());
      return whichToPad === 'start' ? padding + text : text + padding;
    }
  }]);

  return AlignOccurrence;
})(TransformString);

var AlignOccurrenceByPadLeft = (function (_AlignOccurrence) {
  _inherits(AlignOccurrenceByPadLeft, _AlignOccurrence);

  function AlignOccurrenceByPadLeft() {
    _classCallCheck(this, AlignOccurrenceByPadLeft);

    _get(Object.getPrototypeOf(AlignOccurrenceByPadLeft.prototype), 'constructor', this).apply(this, arguments);

    this.whichToPad = 'start';
  }

  return AlignOccurrenceByPadLeft;
})(AlignOccurrence);

var AlignOccurrenceByPadRight = (function (_AlignOccurrence2) {
  _inherits(AlignOccurrenceByPadRight, _AlignOccurrence2);

  function AlignOccurrenceByPadRight() {
    _classCallCheck(this, AlignOccurrenceByPadRight);

    _get(Object.getPrototypeOf(AlignOccurrenceByPadRight.prototype), 'constructor', this).apply(this, arguments);

    this.whichToPad = 'end';
  }

  return AlignOccurrenceByPadRight;
})(AlignOccurrence);

var RemoveLeadingWhiteSpaces = (function (_TransformString9) {
  _inherits(RemoveLeadingWhiteSpaces, _TransformString9);

  function RemoveLeadingWhiteSpaces() {
    _classCallCheck(this, RemoveLeadingWhiteSpaces);

    _get(Object.getPrototypeOf(RemoveLeadingWhiteSpaces.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(RemoveLeadingWhiteSpaces, [{
    key: 'getNewText',
    value: function getNewText(text, selection) {
      var trimLeft = function trimLeft(text) {
        return text.trimLeft();
      };
      return this.utils.splitTextByNewLine(text).map(trimLeft).join('\n') + '\n';
    }
  }]);

  return RemoveLeadingWhiteSpaces;
})(TransformString);

var ConvertToSoftTab = (function (_TransformString10) {
  _inherits(ConvertToSoftTab, _TransformString10);

  function ConvertToSoftTab() {
    _classCallCheck(this, ConvertToSoftTab);

    _get(Object.getPrototypeOf(ConvertToSoftTab.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(ConvertToSoftTab, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var _this3 = this;

      this.scanEditor('forward', /\t/g, { scanRange: selection.getBufferRange() }, function (_ref) {
        var range = _ref.range;
        var replace = _ref.replace;

        // Replace \t to spaces which length is vary depending on tabStop and tabLenght
        // So we directly consult it's screen representing length.
        var length = _this3.editor.screenRangeForBufferRange(range).getExtent().column;
        replace(' '.repeat(length));
      });
    }
  }], [{
    key: 'displayName',
    value: 'Soft Tab',
    enumerable: true
  }]);

  return ConvertToSoftTab;
})(TransformString);

var ConvertToHardTab = (function (_TransformString11) {
  _inherits(ConvertToHardTab, _TransformString11);

  function ConvertToHardTab() {
    _classCallCheck(this, ConvertToHardTab);

    _get(Object.getPrototypeOf(ConvertToHardTab.prototype), 'constructor', this).apply(this, arguments);
  }

  // -------------------------

  _createClass(ConvertToHardTab, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var _this4 = this;

      var tabLength = this.editor.getTabLength();
      this.scanEditor('forward', /[ \t]+/g, { scanRange: selection.getBufferRange() }, function (_ref2) {
        var range = _ref2.range;
        var replace = _ref2.replace;

        var _editor$screenRangeForBufferRange = _this4.editor.screenRangeForBufferRange(range);

        var start = _editor$screenRangeForBufferRange.start;
        var end = _editor$screenRangeForBufferRange.end;

        var startColumn = start.column;
        var endColumn = end.column;

        // We can't naively replace spaces to tab, we have to consider valid tabStop column
        // If nextTabStop column exceeds replacable range, we pad with spaces.
        var newText = '';
        while (true) {
          var remainder = startColumn % tabLength;
          var nextTabStop = startColumn + (remainder === 0 ? tabLength : remainder);
          if (nextTabStop > endColumn) {
            newText += ' '.repeat(endColumn - startColumn);
          } else {
            newText += '\t';
          }
          startColumn = nextTabStop;
          if (startColumn >= endColumn) {
            break;
          }
        }

        replace(newText);
      });
    }
  }], [{
    key: 'displayName',
    value: 'Hard Tab',
    enumerable: true
  }]);

  return ConvertToHardTab;
})(TransformString);

var TransformStringByExternalCommand = (function (_TransformString12) {
  _inherits(TransformStringByExternalCommand, _TransformString12);

  function TransformStringByExternalCommand() {
    _classCallCheck(this, TransformStringByExternalCommand);

    _get(Object.getPrototypeOf(TransformStringByExternalCommand.prototype), 'constructor', this).apply(this, arguments);

    this.autoIndent = true;
    this.command = '';
    this.args = [];
  }

  // -------------------------

  _createClass(TransformStringByExternalCommand, [{
    key: 'getNewText',
    // e.g args: ['-rn']

    // NOTE: Unlike other class, first arg is `stdout` of external commands.
    value: function getNewText(text, selection) {
      return text || selection.getText();
    }
  }, {
    key: 'getCommand',
    value: function getCommand(selection) {
      return { command: this.command, args: this.args };
    }
  }, {
    key: 'getStdin',
    value: function getStdin(selection) {
      return selection.getText();
    }
  }, {
    key: 'execute',
    value: _asyncToGenerator(function* () {
      this.preSelect();

      if (this.selectTarget()) {
        for (var selection of this.editor.getSelections()) {
          var _ref3 = this.getCommand(selection) || {};

          var command = _ref3.command;
          var args = _ref3.args;

          if (command == null || args == null) continue;

          var stdout = yield this.runExternalCommand({ command: command, args: args, stdin: this.getStdin(selection) });
          selection.insertText(this.getNewText(stdout, selection), { autoIndent: this.autoIndent });
        }
        this.mutationManager.setCheckpoint('did-finish');
        this.restoreCursorPositionsIfNecessary();
      }
      this.postMutate();
    })
  }, {
    key: 'runExternalCommand',
    value: function runExternalCommand(options) {
      var _this5 = this;

      var output = '';
      options.stdout = function (data) {
        return output += data;
      };
      var exitPromise = new Promise(function (resolve) {
        options.exit = function () {
          return resolve(output);
        };
      });
      var stdin = options.stdin;

      delete options.stdin;
      var bufferedProcess = new BufferedProcess(options);
      bufferedProcess.onWillThrowError(function (_ref4) {
        var error = _ref4.error;
        var handle = _ref4.handle;

        // Suppress command not found error intentionally.
        if (error.code === 'ENOENT' && error.syscall.indexOf('spawn') === 0) {
          console.log(_this5.getCommandName() + ': Failed to spawn command ' + error.path + '.');
          handle();
        }
        _this5.cancelOperation();
      });

      if (stdin) {
        bufferedProcess.process.stdin.write(stdin);
        bufferedProcess.process.stdin.end();
      }
      return exitPromise;
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return TransformStringByExternalCommand;
})(TransformString);

var TransformStringBySelectList = (function (_TransformString13) {
  _inherits(TransformStringBySelectList, _TransformString13);

  function TransformStringBySelectList() {
    _classCallCheck(this, TransformStringBySelectList);

    _get(Object.getPrototypeOf(TransformStringBySelectList.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'Empty';
    this.recordable = false;
  }

  _createClass(TransformStringBySelectList, [{
    key: 'selectItems',
    value: function selectItems() {
      if (!selectList) {
        var SelectList = require('./select-list');
        selectList = new SelectList();
      }
      return selectList.selectFromItems(this.constructor.getSelectListItems());
    }
  }, {
    key: 'execute',
    value: _asyncToGenerator(function* () {
      var item = yield this.selectItems();
      if (item) {
        this.vimState.operationStack.runNext(item.klass, { target: this.nextTarget });
      }
    })
  }], [{
    key: 'getSelectListItems',
    value: function getSelectListItems() {
      var _this6 = this;

      if (!this.selectListItems) {
        this.selectListItems = this.stringTransformers.map(function (klass) {
          var suffix = klass.hasOwnProperty('displayNameSuffix') ? ' ' + klass.displayNameSuffix : '';

          return {
            klass: klass,
            displayName: klass.hasOwnProperty('displayName') ? klass.displayName + suffix : _this6._.humanizeEventName(_this6._.dasherize(klass.name)) + suffix
          };
        });
      }
      return this.selectListItems;
    }
  }]);

  return TransformStringBySelectList;
})(TransformString);

var TransformWordBySelectList = (function (_TransformStringBySelectList) {
  _inherits(TransformWordBySelectList, _TransformStringBySelectList);

  function TransformWordBySelectList() {
    _classCallCheck(this, TransformWordBySelectList);

    _get(Object.getPrototypeOf(TransformWordBySelectList.prototype), 'constructor', this).apply(this, arguments);

    this.nextTarget = 'InnerWord';
  }

  return TransformWordBySelectList;
})(TransformStringBySelectList);

var TransformSmartWordBySelectList = (function (_TransformStringBySelectList2) {
  _inherits(TransformSmartWordBySelectList, _TransformStringBySelectList2);

  function TransformSmartWordBySelectList() {
    _classCallCheck(this, TransformSmartWordBySelectList);

    _get(Object.getPrototypeOf(TransformSmartWordBySelectList.prototype), 'constructor', this).apply(this, arguments);

    this.nextTarget = 'InnerSmartWord';
  }

  // -------------------------
  return TransformSmartWordBySelectList;
})(TransformStringBySelectList);

var ReplaceWithRegister = (function (_TransformString14) {
  _inherits(ReplaceWithRegister, _TransformString14);

  function ReplaceWithRegister() {
    _classCallCheck(this, ReplaceWithRegister);

    _get(Object.getPrototypeOf(ReplaceWithRegister.prototype), 'constructor', this).apply(this, arguments);

    this.flashType = 'operator-long';
  }

  _createClass(ReplaceWithRegister, [{
    key: 'initialize',
    value: function initialize() {
      this.vimState.sequentialPasteManager.onInitialize(this);
      _get(Object.getPrototypeOf(ReplaceWithRegister.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'execute',
    value: function execute() {
      this.sequentialPaste = this.vimState.sequentialPasteManager.onExecute(this);

      _get(Object.getPrototypeOf(ReplaceWithRegister.prototype), 'execute', this).call(this);

      for (var selection of this.editor.getSelections()) {
        var range = this.mutationManager.getMutatedBufferRangeForSelection(selection);
        this.vimState.sequentialPasteManager.savePastedRangeForSelection(selection, range);
      }
    }
  }, {
    key: 'getNewText',
    value: function getNewText(text, selection) {
      var value = this.vimState.register.get(null, selection, this.sequentialPaste);
      return value ? value.text : '';
    }
  }]);

  return ReplaceWithRegister;
})(TransformString);

var ReplaceOccurrenceWithRegister = (function (_ReplaceWithRegister) {
  _inherits(ReplaceOccurrenceWithRegister, _ReplaceWithRegister);

  function ReplaceOccurrenceWithRegister() {
    _classCallCheck(this, ReplaceOccurrenceWithRegister);

    _get(Object.getPrototypeOf(ReplaceOccurrenceWithRegister.prototype), 'constructor', this).apply(this, arguments);

    this.occurrence = true;
  }

  // Save text to register before replace
  return ReplaceOccurrenceWithRegister;
})(ReplaceWithRegister);

var SwapWithRegister = (function (_TransformString15) {
  _inherits(SwapWithRegister, _TransformString15);

  function SwapWithRegister() {
    _classCallCheck(this, SwapWithRegister);

    _get(Object.getPrototypeOf(SwapWithRegister.prototype), 'constructor', this).apply(this, arguments);
  }

  // Indent < TransformString
  // -------------------------

  _createClass(SwapWithRegister, [{
    key: 'getNewText',
    value: function getNewText(text, selection) {
      var newText = this.vimState.register.getText();
      this.setTextToRegister(text, selection);
      return newText;
    }
  }]);

  return SwapWithRegister;
})(TransformString);

var Indent = (function (_TransformString16) {
  _inherits(Indent, _TransformString16);

  function Indent() {
    _classCallCheck(this, Indent);

    _get(Object.getPrototypeOf(Indent.prototype), 'constructor', this).apply(this, arguments);

    this.stayByMarker = true;
    this.setToFirstCharacterOnLinewise = true;
    this.wise = 'linewise';
  }

  _createClass(Indent, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var _this7 = this;

      // Need count times indentation in visual-mode and its repeat(`.`).
      if (this.target.name === 'CurrentSelection') {
        (function () {
          var oldText = undefined;
          // limit to 100 to avoid freezing by accidental big number.
          _this7.countTimes(_this7.limitNumber(_this7.getCount(), { max: 100 }), function (_ref5) {
            var stop = _ref5.stop;

            oldText = selection.getText();
            _this7.indent(selection);
            if (selection.getText() === oldText) stop();
          });
        })();
      } else {
        this.indent(selection);
      }
    }
  }, {
    key: 'indent',
    value: function indent(selection) {
      selection.indentSelectedRows();
    }
  }]);

  return Indent;
})(TransformString);

var Outdent = (function (_Indent) {
  _inherits(Outdent, _Indent);

  function Outdent() {
    _classCallCheck(this, Outdent);

    _get(Object.getPrototypeOf(Outdent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Outdent, [{
    key: 'indent',
    value: function indent(selection) {
      selection.outdentSelectedRows();
    }
  }]);

  return Outdent;
})(Indent);

var AutoIndent = (function (_Indent2) {
  _inherits(AutoIndent, _Indent2);

  function AutoIndent() {
    _classCallCheck(this, AutoIndent);

    _get(Object.getPrototypeOf(AutoIndent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(AutoIndent, [{
    key: 'indent',
    value: function indent(selection) {
      selection.autoIndentSelectedRows();
    }
  }]);

  return AutoIndent;
})(Indent);

var ToggleLineComments = (function (_TransformString17) {
  _inherits(ToggleLineComments, _TransformString17);

  function ToggleLineComments() {
    _classCallCheck(this, ToggleLineComments);

    _get(Object.getPrototypeOf(ToggleLineComments.prototype), 'constructor', this).apply(this, arguments);

    this.flashTarget = false;
    this.stayByMarker = true;
    this.stayAtSamePosition = true;
    this.wise = 'linewise';
  }

  _createClass(ToggleLineComments, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      selection.toggleLineComments();
    }
  }]);

  return ToggleLineComments;
})(TransformString);

var Reflow = (function (_TransformString18) {
  _inherits(Reflow, _TransformString18);

  function Reflow() {
    _classCallCheck(this, Reflow);

    _get(Object.getPrototypeOf(Reflow.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Reflow, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      atom.commands.dispatch(this.editorElement, 'autoflow:reflow-selection');
    }
  }]);

  return Reflow;
})(TransformString);

var ReflowWithStay = (function (_Reflow) {
  _inherits(ReflowWithStay, _Reflow);

  function ReflowWithStay() {
    _classCallCheck(this, ReflowWithStay);

    _get(Object.getPrototypeOf(ReflowWithStay.prototype), 'constructor', this).apply(this, arguments);

    this.stayAtSamePosition = true;
  }

  // Surround < TransformString
  // -------------------------
  return ReflowWithStay;
})(Reflow);

var SurroundBase = (function (_TransformString19) {
  _inherits(SurroundBase, _TransformString19);

  function SurroundBase() {
    _classCallCheck(this, SurroundBase);

    _get(Object.getPrototypeOf(SurroundBase.prototype), 'constructor', this).apply(this, arguments);

    this.surroundAction = null;
    this.pairsByAlias = {
      '(': ['(', ')'],
      ')': ['(', ')'],
      '{': ['{', '}'],
      '}': ['{', '}'],
      '[': ['[', ']'],
      ']': ['[', ']'],
      '<': ['<', '>'],
      '>': ['<', '>'],
      b: ['(', ')'],
      B: ['{', '}'],
      r: ['[', ']'],
      a: ['<', '>']
    };
  }

  _createClass(SurroundBase, [{
    key: 'initialize',
    value: function initialize() {
      this.replaceByDiff = this.getConfig('replaceByDiffOnSurround');
      this.stayByMarker = this.replaceByDiff;
      _get(Object.getPrototypeOf(SurroundBase.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'getPair',
    value: function getPair(char) {
      var userConfig = this.getConfig('customSurroundPairs');
      var customPairByAlias = JSON.parse(userConfig) || {};
      return customPairByAlias[char] || this.pairsByAlias[char] || [char, char];
    }
  }, {
    key: 'surround',
    value: function surround(text, char) {
      var _this8 = this;

      var _ref6 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var _ref6$keepLayout = _ref6.keepLayout;
      var keepLayout = _ref6$keepLayout === undefined ? false : _ref6$keepLayout;
      var selection = _ref6.selection;

      var _getPair = this.getPair(char);

      var _getPair2 = _slicedToArray(_getPair, 3);

      var open = _getPair2[0];
      var close = _getPair2[1];
      var addSpace = _getPair2[2];

      if (!keepLayout && text.endsWith('\n')) {
        (function () {
          var baseIndentLevel = _this8.editor.indentationForBufferRow(selection.getBufferRange().start.row);
          var indentTextStartRow = _this8.editor.buildIndentString(baseIndentLevel);
          var indentTextOneLevel = _this8.editor.buildIndentString(1);

          open = indentTextStartRow + open + '\n';
          text = text.replace(/^(.+)$/gm, function (m) {
            return indentTextOneLevel + m;
          });
          close = indentTextStartRow + close + '\n';
        })();
      }

      if (this.utils.isSingleLineText(text)) {
        if (addSpace || this.getConfig('charactersToAddSpaceOnSurround').includes(char)) {
          text = ' ' + text + ' ';
        }
      }
      return open + text + close;
    }
  }, {
    key: 'getTargetPair',
    value: function getTargetPair() {
      if (this.target) {
        return this.target.pair;
      }
    }
  }, {
    key: 'deleteSurround',
    value: function deleteSurround(text) {
      var _ref7 = this.getTargetPair() || [text[0], text[text.length - 1]];

      var _ref72 = _slicedToArray(_ref7, 2);

      var open = _ref72[0];
      var close = _ref72[1];

      var innerText = text.slice(open.length, text.length - close.length);
      return this.utils.isSingleLineText(text) && open !== close ? innerText.trim() : innerText;
    }
  }, {
    key: 'getNewText',
    value: function getNewText(text, selection) {
      if (this.surroundAction === 'surround') {
        return this.surround(text, this.input, { selection: selection });
      } else if (this.surroundAction === 'delete-surround') {
        return this.deleteSurround(text);
      } else if (this.surroundAction === 'change-surround') {
        return this.surround(this.deleteSurround(text), this.input, { keepLayout: true });
      }
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return SurroundBase;
})(TransformString);

var Surround = (function (_SurroundBase) {
  _inherits(Surround, _SurroundBase);

  function Surround() {
    _classCallCheck(this, Surround);

    _get(Object.getPrototypeOf(Surround.prototype), 'constructor', this).apply(this, arguments);

    this.surroundAction = 'surround';
    this.readInputAfterSelect = true;
  }

  return Surround;
})(SurroundBase);

var SurroundWord = (function (_Surround) {
  _inherits(SurroundWord, _Surround);

  function SurroundWord() {
    _classCallCheck(this, SurroundWord);

    _get(Object.getPrototypeOf(SurroundWord.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'InnerWord';
  }

  return SurroundWord;
})(Surround);

var SurroundSmartWord = (function (_Surround2) {
  _inherits(SurroundSmartWord, _Surround2);

  function SurroundSmartWord() {
    _classCallCheck(this, SurroundSmartWord);

    _get(Object.getPrototypeOf(SurroundSmartWord.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'InnerSmartWord';
  }

  return SurroundSmartWord;
})(Surround);

var MapSurround = (function (_Surround3) {
  _inherits(MapSurround, _Surround3);

  function MapSurround() {
    _classCallCheck(this, MapSurround);

    _get(Object.getPrototypeOf(MapSurround.prototype), 'constructor', this).apply(this, arguments);

    this.occurrence = true;
    this.patternForOccurrence = /\w+/g;
  }

  // Delete Surround
  // -------------------------
  return MapSurround;
})(Surround);

var DeleteSurround = (function (_SurroundBase2) {
  _inherits(DeleteSurround, _SurroundBase2);

  function DeleteSurround() {
    _classCallCheck(this, DeleteSurround);

    _get(Object.getPrototypeOf(DeleteSurround.prototype), 'constructor', this).apply(this, arguments);

    this.surroundAction = 'delete-surround';
  }

  _createClass(DeleteSurround, [{
    key: 'initialize',
    value: function initialize() {
      var _this9 = this;

      if (!this.target) {
        this.focusInput({
          onConfirm: function onConfirm(char) {
            _this9.setTarget(_this9.getInstance('APair', { pair: _this9.getPair(char) }));
            _this9.processOperation();
          }
        });
      }
      _get(Object.getPrototypeOf(DeleteSurround.prototype), 'initialize', this).call(this);
    }
  }]);

  return DeleteSurround;
})(SurroundBase);

var DeleteSurroundAnyPair = (function (_DeleteSurround) {
  _inherits(DeleteSurroundAnyPair, _DeleteSurround);

  function DeleteSurroundAnyPair() {
    _classCallCheck(this, DeleteSurroundAnyPair);

    _get(Object.getPrototypeOf(DeleteSurroundAnyPair.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'AAnyPair';
  }

  return DeleteSurroundAnyPair;
})(DeleteSurround);

var DeleteSurroundAnyPairAllowForwarding = (function (_DeleteSurroundAnyPair) {
  _inherits(DeleteSurroundAnyPairAllowForwarding, _DeleteSurroundAnyPair);

  function DeleteSurroundAnyPairAllowForwarding() {
    _classCallCheck(this, DeleteSurroundAnyPairAllowForwarding);

    _get(Object.getPrototypeOf(DeleteSurroundAnyPairAllowForwarding.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'AAnyPairAllowForwarding';
  }

  // Change Surround
  // -------------------------
  return DeleteSurroundAnyPairAllowForwarding;
})(DeleteSurroundAnyPair);

var ChangeSurround = (function (_DeleteSurround2) {
  _inherits(ChangeSurround, _DeleteSurround2);

  function ChangeSurround() {
    _classCallCheck(this, ChangeSurround);

    _get(Object.getPrototypeOf(ChangeSurround.prototype), 'constructor', this).apply(this, arguments);

    this.surroundAction = 'change-surround';
    this.readInputAfterSelect = true;
  }

  _createClass(ChangeSurround, [{
    key: 'focusInputPromised',

    // Override to show changing char on hover
    value: _asyncToGenerator(function* () {
      var hoverPoint = this.mutationManager.getInitialPointForSelection(this.editor.getLastSelection());
      var openSurrondText = this.getTargetPair() ? this.getTargetPair()[0] : this.editor.getSelectedText()[0];
      this.vimState.hover.set(openSurrondText, hoverPoint);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _get(Object.getPrototypeOf(ChangeSurround.prototype), 'focusInputPromised', this).apply(this, args);
    })
  }]);

  return ChangeSurround;
})(DeleteSurround);

var ChangeSurroundAnyPair = (function (_ChangeSurround) {
  _inherits(ChangeSurroundAnyPair, _ChangeSurround);

  function ChangeSurroundAnyPair() {
    _classCallCheck(this, ChangeSurroundAnyPair);

    _get(Object.getPrototypeOf(ChangeSurroundAnyPair.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'AAnyPair';
  }

  return ChangeSurroundAnyPair;
})(ChangeSurround);

var ChangeSurroundAnyPairAllowForwarding = (function (_ChangeSurroundAnyPair) {
  _inherits(ChangeSurroundAnyPairAllowForwarding, _ChangeSurroundAnyPair);

  function ChangeSurroundAnyPairAllowForwarding() {
    _classCallCheck(this, ChangeSurroundAnyPairAllowForwarding);

    _get(Object.getPrototypeOf(ChangeSurroundAnyPairAllowForwarding.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'AAnyPairAllowForwarding';
  }

  // -------------------------
  // FIXME
  // Currently native editor.joinLines() is better for cursor position setting
  // So I use native methods for a meanwhile.
  return ChangeSurroundAnyPairAllowForwarding;
})(ChangeSurroundAnyPair);

var JoinTarget = (function (_TransformString20) {
  _inherits(JoinTarget, _TransformString20);

  function JoinTarget() {
    _classCallCheck(this, JoinTarget);

    _get(Object.getPrototypeOf(JoinTarget.prototype), 'constructor', this).apply(this, arguments);

    this.flashTarget = false;
    this.restorePositions = false;
  }

  _createClass(JoinTarget, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var range = selection.getBufferRange();

      // When cursor is at last BUFFER row, it select last-buffer-row, then
      // joinning result in "clear last-buffer-row text".
      // I believe this is BUG of upstream atom-core. guard this situation here
      if (!range.isSingleLine() || range.end.row !== this.editor.getLastBufferRow()) {
        if (this.utils.isLinewiseRange(range)) {
          selection.setBufferRange(range.translate([0, 0], [-1, Infinity]));
        }
        selection.joinLines();
      }
      var point = selection.getBufferRange().end.translate([0, -1]);
      return selection.cursor.setBufferPosition(point);
    }
  }]);

  return JoinTarget;
})(TransformString);

var Join = (function (_JoinTarget) {
  _inherits(Join, _JoinTarget);

  function Join() {
    _classCallCheck(this, Join);

    _get(Object.getPrototypeOf(Join.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveToRelativeLine';
  }

  return Join;
})(JoinTarget);

var JoinBase = (function (_TransformString21) {
  _inherits(JoinBase, _TransformString21);

  function JoinBase() {
    _classCallCheck(this, JoinBase);

    _get(Object.getPrototypeOf(JoinBase.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.trim = false;
    this.target = 'MoveToRelativeLineMinimumTwo';
  }

  _createClass(JoinBase, [{
    key: 'getNewText',
    value: function getNewText(text) {
      var regex = this.trim ? /\r?\n[ \t]*/g : /\r?\n/g;
      return text.trimRight().replace(regex, this.input) + '\n';
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return JoinBase;
})(TransformString);

var JoinWithKeepingSpace = (function (_JoinBase) {
  _inherits(JoinWithKeepingSpace, _JoinBase);

  function JoinWithKeepingSpace() {
    _classCallCheck(this, JoinWithKeepingSpace);

    _get(Object.getPrototypeOf(JoinWithKeepingSpace.prototype), 'constructor', this).apply(this, arguments);

    this.input = '';
  }

  return JoinWithKeepingSpace;
})(JoinBase);

var JoinByInput = (function (_JoinBase2) {
  _inherits(JoinByInput, _JoinBase2);

  function JoinByInput() {
    _classCallCheck(this, JoinByInput);

    _get(Object.getPrototypeOf(JoinByInput.prototype), 'constructor', this).apply(this, arguments);

    this.readInputAfterSelect = true;
    this.focusInputOptions = { charsMax: 10 };
    this.trim = true;
  }

  return JoinByInput;
})(JoinBase);

var JoinByInputWithKeepingSpace = (function (_JoinByInput) {
  _inherits(JoinByInputWithKeepingSpace, _JoinByInput);

  function JoinByInputWithKeepingSpace() {
    _classCallCheck(this, JoinByInputWithKeepingSpace);

    _get(Object.getPrototypeOf(JoinByInputWithKeepingSpace.prototype), 'constructor', this).apply(this, arguments);

    this.trim = false;
  }

  // -------------------------
  // String suffix in name is to avoid confusion with 'split' window.
  return JoinByInputWithKeepingSpace;
})(JoinByInput);

var SplitString = (function (_TransformString22) {
  _inherits(SplitString, _TransformString22);

  function SplitString() {
    _classCallCheck(this, SplitString);

    _get(Object.getPrototypeOf(SplitString.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveToRelativeLine';
    this.keepSplitter = false;
    this.readInputAfterSelect = true;
    this.focusInputOptions = { charsMax: 10 };
  }

  _createClass(SplitString, [{
    key: 'getNewText',
    value: function getNewText(text) {
      var regex = new RegExp(this._.escapeRegExp(this.input || '\\n'), 'g');
      var lineSeparator = (this.keepSplitter ? this.input : '') + '\n';
      return text.replace(regex, lineSeparator);
    }
  }]);

  return SplitString;
})(TransformString);

var SplitStringWithKeepingSplitter = (function (_SplitString) {
  _inherits(SplitStringWithKeepingSplitter, _SplitString);

  function SplitStringWithKeepingSplitter() {
    _classCallCheck(this, SplitStringWithKeepingSplitter);

    _get(Object.getPrototypeOf(SplitStringWithKeepingSplitter.prototype), 'constructor', this).apply(this, arguments);

    this.keepSplitter = true;
  }

  return SplitStringWithKeepingSplitter;
})(SplitString);

var SplitArguments = (function (_TransformString23) {
  _inherits(SplitArguments, _TransformString23);

  function SplitArguments() {
    _classCallCheck(this, SplitArguments);

    _get(Object.getPrototypeOf(SplitArguments.prototype), 'constructor', this).apply(this, arguments);

    this.keepSeparator = true;
  }

  _createClass(SplitArguments, [{
    key: 'getNewText',
    value: function getNewText(text, selection) {
      var allTokens = this.utils.splitArguments(text.trim());
      var newText = '';

      var baseIndentLevel = this.editor.indentationForBufferRow(selection.getBufferRange().start.row);
      var indentTextStartRow = this.editor.buildIndentString(baseIndentLevel);
      var indentTextInnerRows = this.editor.buildIndentString(baseIndentLevel + 1);

      while (allTokens.length) {
        var _allTokens$shift = allTokens.shift();

        var _text = _allTokens$shift.text;
        var type = _allTokens$shift.type;

        newText += type === 'separator' ? (this.keepSeparator ? _text.trim() : '') + '\n' : indentTextInnerRows + _text;
      }
      return '\n' + newText + '\n' + indentTextStartRow;
    }
  }]);

  return SplitArguments;
})(TransformString);

var SplitArgumentsWithRemoveSeparator = (function (_SplitArguments) {
  _inherits(SplitArgumentsWithRemoveSeparator, _SplitArguments);

  function SplitArgumentsWithRemoveSeparator() {
    _classCallCheck(this, SplitArgumentsWithRemoveSeparator);

    _get(Object.getPrototypeOf(SplitArgumentsWithRemoveSeparator.prototype), 'constructor', this).apply(this, arguments);

    this.keepSeparator = false;
  }

  return SplitArgumentsWithRemoveSeparator;
})(SplitArguments);

var SplitArgumentsOfInnerAnyPair = (function (_SplitArguments2) {
  _inherits(SplitArgumentsOfInnerAnyPair, _SplitArguments2);

  function SplitArgumentsOfInnerAnyPair() {
    _classCallCheck(this, SplitArgumentsOfInnerAnyPair);

    _get(Object.getPrototypeOf(SplitArgumentsOfInnerAnyPair.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'InnerAnyPair';
  }

  return SplitArgumentsOfInnerAnyPair;
})(SplitArguments);

var ChangeOrder = (function (_TransformString24) {
  _inherits(ChangeOrder, _TransformString24);

  function ChangeOrder() {
    _classCallCheck(this, ChangeOrder);

    _get(Object.getPrototypeOf(ChangeOrder.prototype), 'constructor', this).apply(this, arguments);

    this.action = null;
    this.sortBy = null;
  }

  _createClass(ChangeOrder, [{
    key: 'getNewText',
    value: function getNewText(text) {
      var _this10 = this;

      return this.target.isLinewise() ? this.getNewList(this.utils.splitTextByNewLine(text)).join('\n') + '\n' : this.sortArgumentsInTextBy(text, function (args) {
        return _this10.getNewList(args);
      });
    }
  }, {
    key: 'getNewList',
    value: function getNewList(rows) {
      if (rows.length === 1) {
        return [this.utils.changeCharOrder(rows[0], this.action, this.sortBy)];
      } else {
        return this.utils.changeArrayOrder(rows, this.action, this.sortBy);
      }
    }
  }, {
    key: 'sortArgumentsInTextBy',
    value: function sortArgumentsInTextBy(text, fn) {
      var start = text.search(/\S/);
      var end = text.search(/\s*$/);
      var leadingSpaces = start !== -1 ? text.slice(0, start) : '';
      var trailingSpaces = end !== -1 ? text.slice(end) : '';
      var allTokens = this.utils.splitArguments(text.slice(start, end));
      var args = allTokens.filter(function (token) {
        return token.type === 'argument';
      }).map(function (token) {
        return token.text;
      });
      var newArgs = fn(args);

      var newText = '';
      while (allTokens.length) {
        var token = allTokens.shift();
        // token.type is "separator" or "argument"
        newText += token.type === 'separator' ? token.text : newArgs.shift();
      }
      return leadingSpaces + newText + trailingSpaces;
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return ChangeOrder;
})(TransformString);

var Reverse = (function (_ChangeOrder) {
  _inherits(Reverse, _ChangeOrder);

  function Reverse() {
    _classCallCheck(this, Reverse);

    _get(Object.getPrototypeOf(Reverse.prototype), 'constructor', this).apply(this, arguments);

    this.action = 'reverse';
  }

  return Reverse;
})(ChangeOrder);

var ReverseInnerAnyPair = (function (_Reverse) {
  _inherits(ReverseInnerAnyPair, _Reverse);

  function ReverseInnerAnyPair() {
    _classCallCheck(this, ReverseInnerAnyPair);

    _get(Object.getPrototypeOf(ReverseInnerAnyPair.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'InnerAnyPair';
  }

  return ReverseInnerAnyPair;
})(Reverse);

var Rotate = (function (_ChangeOrder2) {
  _inherits(Rotate, _ChangeOrder2);

  function Rotate() {
    _classCallCheck(this, Rotate);

    _get(Object.getPrototypeOf(Rotate.prototype), 'constructor', this).apply(this, arguments);

    this.action = 'rotate-left';
  }

  return Rotate;
})(ChangeOrder);

var RotateBackwards = (function (_ChangeOrder3) {
  _inherits(RotateBackwards, _ChangeOrder3);

  function RotateBackwards() {
    _classCallCheck(this, RotateBackwards);

    _get(Object.getPrototypeOf(RotateBackwards.prototype), 'constructor', this).apply(this, arguments);

    this.action = 'rotate-right';
  }

  return RotateBackwards;
})(ChangeOrder);

var RotateArgumentsOfInnerPair = (function (_Rotate) {
  _inherits(RotateArgumentsOfInnerPair, _Rotate);

  function RotateArgumentsOfInnerPair() {
    _classCallCheck(this, RotateArgumentsOfInnerPair);

    _get(Object.getPrototypeOf(RotateArgumentsOfInnerPair.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'InnerAnyPair';
  }

  return RotateArgumentsOfInnerPair;
})(Rotate);

var RotateArgumentsBackwardsOfInnerPair = (function (_RotateBackwards) {
  _inherits(RotateArgumentsBackwardsOfInnerPair, _RotateBackwards);

  function RotateArgumentsBackwardsOfInnerPair() {
    _classCallCheck(this, RotateArgumentsBackwardsOfInnerPair);

    _get(Object.getPrototypeOf(RotateArgumentsBackwardsOfInnerPair.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'InnerAnyPair';
  }

  return RotateArgumentsBackwardsOfInnerPair;
})(RotateBackwards);

var Sort = (function (_ChangeOrder4) {
  _inherits(Sort, _ChangeOrder4);

  function Sort() {
    _classCallCheck(this, Sort);

    _get(Object.getPrototypeOf(Sort.prototype), 'constructor', this).apply(this, arguments);

    this.action = 'sort';
  }

  return Sort;
})(ChangeOrder);

var SortCaseInsensitively = (function (_Sort) {
  _inherits(SortCaseInsensitively, _Sort);

  function SortCaseInsensitively() {
    _classCallCheck(this, SortCaseInsensitively);

    _get(Object.getPrototypeOf(SortCaseInsensitively.prototype), 'constructor', this).apply(this, arguments);

    this.sortBy = function (rowA, rowB) {
      return rowA.localeCompare(rowB, { sensitivity: 'base' });
    };
  }

  return SortCaseInsensitively;
})(Sort);

var SortByNumber = (function (_Sort2) {
  _inherits(SortByNumber, _Sort2);

  function SortByNumber() {
    _classCallCheck(this, SortByNumber);

    _get(Object.getPrototypeOf(SortByNumber.prototype), 'constructor', this).apply(this, arguments);

    this.sortBy = function (rowA, rowB) {
      return (Number.parseInt(rowA) || Infinity) - (Number.parseInt(rowB) || Infinity);
    };
  }

  return SortByNumber;
})(Sort);

var NumberingLines = (function (_TransformString25) {
  _inherits(NumberingLines, _TransformString25);

  function NumberingLines() {
    _classCallCheck(this, NumberingLines);

    _get(Object.getPrototypeOf(NumberingLines.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(NumberingLines, [{
    key: 'getNewText',
    value: function getNewText(text) {
      var _this11 = this;

      var rows = this.utils.splitTextByNewLine(text);
      var lastRowWidth = String(rows.length).length;

      var newRows = rows.map(function (rowText, i) {
        i++; // fix 0 start index to 1 start.
        var amountOfPadding = _this11.limitNumber(lastRowWidth - String(i).length, { min: 0 });
        return ' '.repeat(amountOfPadding) + i + ': ' + rowText;
      });
      return newRows.join('\n') + '\n';
    }
  }]);

  return NumberingLines;
})(TransformString);

var DuplicateWithCommentOutOriginal = (function (_TransformString26) {
  _inherits(DuplicateWithCommentOutOriginal, _TransformString26);

  function DuplicateWithCommentOutOriginal() {
    _classCallCheck(this, DuplicateWithCommentOutOriginal);

    _get(Object.getPrototypeOf(DuplicateWithCommentOutOriginal.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.stayByMarker = true;
    this.stayAtSamePosition = true;
  }

  _createClass(DuplicateWithCommentOutOriginal, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var _selection$getBufferRowRange = selection.getBufferRowRange();

      var _selection$getBufferRowRange2 = _slicedToArray(_selection$getBufferRowRange, 2);

      var startRow = _selection$getBufferRowRange2[0];
      var endRow = _selection$getBufferRowRange2[1];

      selection.setBufferRange(this.utils.insertTextAtBufferPosition(this.editor, [startRow, 0], selection.getText()));
      this.editor.toggleLineCommentsForBufferRows(startRow, endRow);
    }
  }]);

  return DuplicateWithCommentOutOriginal;
})(TransformString);

module.exports = {
  TransformString: TransformString,

  NoCase: NoCase,
  DotCase: DotCase,
  SwapCase: SwapCase,
  PathCase: PathCase,
  UpperCase: UpperCase,
  LowerCase: LowerCase,
  CamelCase: CamelCase,
  SnakeCase: SnakeCase,
  TitleCase: TitleCase,
  ParamCase: ParamCase,
  HeaderCase: HeaderCase,
  PascalCase: PascalCase,
  ConstantCase: ConstantCase,
  SentenceCase: SentenceCase,
  UpperCaseFirst: UpperCaseFirst,
  LowerCaseFirst: LowerCaseFirst,
  DashCase: DashCase,
  ToggleCase: ToggleCase,
  ToggleCaseAndMoveRight: ToggleCaseAndMoveRight,

  Replace: Replace,
  ReplaceCharacter: ReplaceCharacter,
  SplitByCharacter: SplitByCharacter,
  EncodeUriComponent: EncodeUriComponent,
  DecodeUriComponent: DecodeUriComponent,
  TrimString: TrimString,
  CompactSpaces: CompactSpaces,
  AlignOccurrence: AlignOccurrence,
  AlignOccurrenceByPadLeft: AlignOccurrenceByPadLeft,
  AlignOccurrenceByPadRight: AlignOccurrenceByPadRight,
  RemoveLeadingWhiteSpaces: RemoveLeadingWhiteSpaces,
  ConvertToSoftTab: ConvertToSoftTab,
  ConvertToHardTab: ConvertToHardTab,
  TransformStringByExternalCommand: TransformStringByExternalCommand,
  TransformStringBySelectList: TransformStringBySelectList,
  TransformWordBySelectList: TransformWordBySelectList,
  TransformSmartWordBySelectList: TransformSmartWordBySelectList,
  ReplaceWithRegister: ReplaceWithRegister,
  ReplaceOccurrenceWithRegister: ReplaceOccurrenceWithRegister,
  SwapWithRegister: SwapWithRegister,
  Indent: Indent,
  Outdent: Outdent,
  AutoIndent: AutoIndent,
  ToggleLineComments: ToggleLineComments,
  Reflow: Reflow,
  ReflowWithStay: ReflowWithStay,
  SurroundBase: SurroundBase,
  Surround: Surround,
  SurroundWord: SurroundWord,
  SurroundSmartWord: SurroundSmartWord,
  MapSurround: MapSurround,
  DeleteSurround: DeleteSurround,
  DeleteSurroundAnyPair: DeleteSurroundAnyPair,
  DeleteSurroundAnyPairAllowForwarding: DeleteSurroundAnyPairAllowForwarding,
  ChangeSurround: ChangeSurround,
  ChangeSurroundAnyPair: ChangeSurroundAnyPair,
  ChangeSurroundAnyPairAllowForwarding: ChangeSurroundAnyPairAllowForwarding,
  JoinTarget: JoinTarget,
  Join: Join,
  JoinBase: JoinBase,
  JoinWithKeepingSpace: JoinWithKeepingSpace,
  JoinByInput: JoinByInput,
  JoinByInputWithKeepingSpace: JoinByInputWithKeepingSpace,
  SplitString: SplitString,
  SplitStringWithKeepingSplitter: SplitStringWithKeepingSplitter,
  SplitArguments: SplitArguments,
  SplitArgumentsWithRemoveSeparator: SplitArgumentsWithRemoveSeparator,
  SplitArgumentsOfInnerAnyPair: SplitArgumentsOfInnerAnyPair,
  ChangeOrder: ChangeOrder,
  Reverse: Reverse,
  ReverseInnerAnyPair: ReverseInnerAnyPair,
  Rotate: Rotate,
  RotateBackwards: RotateBackwards,
  RotateArgumentsOfInnerPair: RotateArgumentsOfInnerPair,
  RotateArgumentsBackwardsOfInnerPair: RotateArgumentsBackwardsOfInnerPair,
  Sort: Sort,
  SortCaseInsensitively: SortCaseInsensitively,
  SortByNumber: SortByNumber,
  NumberingLines: NumberingLines,
  DuplicateWithCommentOutOriginal: DuplicateWithCommentOutOriginal
};
for (var klass of Object.values(module.exports)) {
  if (klass.isCommand()) klass.registerToSelectList();
}
// e.g. command: 'sort'
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3hjZi8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7QUFFWCxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDekMsSUFBSSxVQUFVLFlBQUEsQ0FBQTs7ZUFFWSxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUFsQyxlQUFlLFlBQWYsZUFBZTs7Z0JBQ0gsT0FBTyxDQUFDLFlBQVksQ0FBQzs7SUFBakMsUUFBUSxhQUFSLFFBQVE7Ozs7O0lBSVQsZUFBZTtZQUFmLGVBQWU7O1dBQWYsZUFBZTswQkFBZixlQUFlOzsrQkFBZixlQUFlOztTQUduQixXQUFXLEdBQUcsSUFBSTtTQUNsQixjQUFjLEdBQUcsdUJBQXVCO1NBQ3hDLFVBQVUsR0FBRyxLQUFLO1NBQ2xCLGlCQUFpQixHQUFHLEtBQUs7U0FDekIsYUFBYSxHQUFHLEtBQUs7OztlQVBqQixlQUFlOztXQWFILHlCQUFDLFNBQVMsRUFBRTtBQUMxQixVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUM1RCxVQUFJLElBQUksRUFBRTtBQUNSLFlBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixjQUFJLENBQUMseUJBQXlCLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQ2pFLE1BQU07QUFDTCxtQkFBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsRUFBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUMsQ0FBQyxDQUFBO1NBQ3JHO09BQ0Y7S0FDRjs7O1dBYjJCLGdDQUFHO0FBQzdCLFVBQUksQ0FBQyxrQkFBa0Is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WCxXQUFXO0FBQ1gsNkJBQTJCLEVBQTNCLDJCQUEyQjtBQUMzQixhQUFXLEVBQVgsV0FBVztBQUNYLGdDQUE4QixFQUE5Qiw4QkFBOEI7QUFDOUIsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QsbUNBQWlDLEVBQWpDLGlDQUFpQztBQUNqQyw4QkFBNEIsRUFBNUIsNEJBQTRCO0FBQzVCLGFBQVcsRUFBWCxXQUFXO0FBQ1gsU0FBTyxFQUFQLE9BQU87QUFDUCxxQkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLFFBQU0sRUFBTixNQUFNO0FBQ04saUJBQWUsRUFBZixlQUFlO0FBQ2YsNEJBQTBCLEVBQTFCLDBCQUEwQjtBQUMxQixxQ0FBbUMsRUFBbkMsbUNBQW1DO0FBQ25DLE1BQUksRUFBSixJQUFJO0FBQ0osdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixjQUFZLEVBQVosWUFBWTtBQUNaLGdCQUFjLEVBQWQsY0FBYztBQUNkLGlDQUErQixFQUEvQiwrQkFBK0I7Q0FDaEMsQ0FBQTtBQUNELEtBQUssSUFBTSxLQUFLLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDakQsTUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUUsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUE7Q0FDcEQiLCJmaWxlIjoiL2hvbWUveGNmLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5jb25zdCBjaGFuZ2VDYXNlID0gcmVxdWlyZSgnY2hhbmdlLWNhc2UnKVxubGV0IHNlbGVjdExpc3RcblxuY29uc3Qge0J1ZmZlcmVkUHJvY2Vzc30gPSByZXF1aXJlKCdhdG9tJylcbmNvbnN0IHtPcGVyYXRvcn0gPSByZXF1aXJlKCcuL29wZXJhdG9yJylcblxuLy8gVHJhbnNmb3JtU3RyaW5nXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nIGV4dGVuZHMgT3BlcmF0b3Ige1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHN0YXRpYyBzdHJpbmdUcmFuc2Zvcm1lcnMgPSBbXVxuICB0cmFja0NoYW5nZSA9IHRydWVcbiAgc3RheU9wdGlvbk5hbWUgPSAnc3RheU9uVHJhbnNmb3JtU3RyaW5nJ1xuICBhdXRvSW5kZW50ID0gZmFsc2VcbiAgYXV0b0luZGVudE5ld2xpbmUgPSBmYWxzZVxuICByZXBsYWNlQnlEaWZmID0gZmFsc2VcblxuICBzdGF0aWMgcmVnaXN0ZXJUb1NlbGVjdExpc3QgKCkge1xuICAgIHRoaXMuc3RyaW5nVHJhbnNmb3JtZXJzLnB1c2godGhpcylcbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbiAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgdGV4dCA9IHRoaXMuZ2V0TmV3VGV4dChzZWxlY3Rpb24uZ2V0VGV4dCgpLCBzZWxlY3Rpb24pXG4gICAgaWYgKHRleHQpIHtcbiAgICAgIGlmICh0aGlzLnJlcGxhY2VCeURpZmYpIHtcbiAgICAgICAgdGhpcy5yZXBsYWNlVGV4dEluUmFuZ2VWaWFEaWZmKHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLCB0ZXh0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwge2F1dG9JbmRlbnQ6IHRoaXMuYXV0b0luZGVudCwgYXV0b0luZGVudE5ld2xpbmU6IHRoaXMuYXV0b0luZGVudE5ld2xpbmV9KVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDaGFuZ2VDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBnZXROZXdUZXh0ICh0ZXh0KSB7XG4gICAgY29uc3QgZnVuY3Rpb25OYW1lID0gdGhpcy5mdW5jdGlvbk5hbWUgfHwgY2hhbmdlQ2FzZS5sb3dlckNhc2VGaXJzdCh0aGlzLm5hbWUpXG4gICAgLy8gSEFDSzogUHVyZSBWaW0ncyBgfmAgaXMgdG9vIGFnZ3Jlc3NpdmUoZS5nLiByZW1vdmUgcHVuY3R1YXRpb24sIHJlbW92ZSB3aGl0ZSBzcGFjZXMuLi4pLlxuICAgIC8vIEhlcmUgaW50ZW50aW9uYWxseSBtYWtpbmcgY2hhbmdlQ2FzZSBsZXNzIGFnZ3Jlc3NpdmUgYnkgbmFycm93aW5nIHRhcmdldCBjaGFyc2V0LlxuICAgIGNvbnN0IGNoYXJzZXQgPSAnW1xcdTAwQzAtXFx1MDJBRlxcdTAzODYtXFx1MDU4N1xcXFx3XSdcbiAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoYCR7Y2hhcnNldH0rKDo/Wy0uL10/JHtjaGFyc2V0fSspKmAsICdnJylcbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKHJlZ2V4LCBtYXRjaCA9PiBjaGFuZ2VDYXNlW2Z1bmN0aW9uTmFtZV0obWF0Y2gpKVxuICB9XG59XG5cbmNsYXNzIE5vQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge31cbmNsYXNzIERvdENhc2UgZXh0ZW5kcyBDaGFuZ2VDYXNlIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lU3VmZml4ID0gJy4nXG59XG5jbGFzcyBTd2FwQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge1xuICBzdGF0aWMgZGlzcGxheU5hbWVTdWZmaXggPSAnfidcbn1cbmNsYXNzIFBhdGhDYXNlIGV4dGVuZHMgQ2hhbmdlQ2FzZSB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZVN1ZmZpeCA9ICcvJ1xufVxuY2xhc3MgVXBwZXJDYXNlIGV4dGVuZHMgQ2hhbmdlQ2FzZSB7fVxuY2xhc3MgTG93ZXJDYXNlIGV4dGVuZHMgQ2hhbmdlQ2FzZSB7fVxuY2xhc3MgQ2FtZWxDYXNlIGV4dGVuZHMgQ2hhbmdlQ2FzZSB7fVxuY2xhc3MgU25ha2VDYXNlIGV4dGVuZHMgQ2hhbmdlQ2FzZSB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZVN1ZmZpeCA9ICdfJ1xufVxuY2xhc3MgVGl0bGVDYXNlIGV4dGVuZHMgQ2hhbmdlQ2FzZSB7fVxuY2xhc3MgUGFyYW1DYXNlIGV4dGVuZHMgQ2hhbmdlQ2FzZSB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZVN1ZmZpeCA9ICctJ1xufVxuY2xhc3MgSGVhZGVyQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge31cbmNsYXNzIFBhc2NhbENhc2UgZXh0ZW5kcyBDaGFuZ2VDYXNlIHt9XG5jbGFzcyBDb25zdGFudENhc2UgZXh0ZW5kcyBDaGFuZ2VDYXNlIHt9XG5jbGFzcyBTZW50ZW5jZUNhc2UgZXh0ZW5kcyBDaGFuZ2VDYXNlIHt9XG5jbGFzcyBVcHBlckNhc2VGaXJzdCBleHRlbmRzIENoYW5nZUNhc2Uge31cbmNsYXNzIExvd2VyQ2FzZUZpcnN0IGV4dGVuZHMgQ2hhbmdlQ2FzZSB7fVxuXG5jbGFzcyBEYXNoQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge1xuICBzdGF0aWMgZGlzcGxheU5hbWVTdWZmaXggPSAnLSdcbiAgZnVuY3Rpb25OYW1lID0gJ3BhcmFtQ2FzZSdcbn1cbmNsYXNzIFRvZ2dsZUNhc2UgZXh0ZW5kcyBDaGFuZ2VDYXNlIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lU3VmZml4ID0gJ34nXG4gIGZ1bmN0aW9uTmFtZSA9ICdzd2FwQ2FzZSdcbn1cblxuY2xhc3MgVG9nZ2xlQ2FzZUFuZE1vdmVSaWdodCBleHRlbmRzIENoYW5nZUNhc2Uge1xuICBmdW5jdGlvbk5hbWUgPSAnc3dhcENhc2UnXG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlXG4gIHRhcmdldCA9ICdNb3ZlUmlnaHQnXG59XG5cbi8vIFJlcGxhY2Vcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFJlcGxhY2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBmbGFzaENoZWNrcG9pbnQgPSAnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJ1xuICBhdXRvSW5kZW50TmV3bGluZSA9IHRydWVcbiAgcmVhZElucHV0QWZ0ZXJTZWxlY3QgPSB0cnVlXG5cbiAgZ2V0TmV3VGV4dCAodGV4dCkge1xuICAgIGlmICh0aGlzLnRhcmdldC5uYW1lID09PSAnTW92ZVJpZ2h0QnVmZmVyQ29sdW1uJyAmJiB0ZXh0Lmxlbmd0aCAhPT0gdGhpcy5nZXRDb3VudCgpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBpbnB1dCA9IHRoaXMuaW5wdXQgfHwgJ1xcbidcbiAgICBpZiAoaW5wdXQgPT09ICdcXG4nKSB7XG4gICAgICB0aGlzLnJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC8uL2csIGlucHV0KVxuICB9XG59XG5cbmNsYXNzIFJlcGxhY2VDaGFyYWN0ZXIgZXh0ZW5kcyBSZXBsYWNlIHtcbiAgdGFyZ2V0ID0gJ01vdmVSaWdodEJ1ZmZlckNvbHVtbidcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRFVQIG1lYW5pbmcgd2l0aCBTcGxpdFN0cmluZyBuZWVkIGNvbnNvbGlkYXRlLlxuY2xhc3MgU3BsaXRCeUNoYXJhY3RlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGdldE5ld1RleHQgKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dC5zcGxpdCgnJykuam9pbignICcpXG4gIH1cbn1cblxuY2xhc3MgRW5jb2RlVXJpQ29tcG9uZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lU3VmZml4ID0gJyUnXG4gIGdldE5ld1RleHQgKHRleHQpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpXG4gIH1cbn1cblxuY2xhc3MgRGVjb2RlVXJpQ29tcG9uZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lU3VmZml4ID0gJyUlJ1xuICBnZXROZXdUZXh0ICh0ZXh0KSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudCh0ZXh0KVxuICB9XG59XG5cbmNsYXNzIFRyaW1TdHJpbmcgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHJlcGxhY2VCeURpZmYgPSB0cnVlXG5cbiAgZ2V0TmV3VGV4dCAodGV4dCkge1xuICAgIHJldHVybiB0ZXh0LnRyaW0oKVxuICB9XG59XG5cbmNsYXNzIENvbXBhY3RTcGFjZXMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBnZXROZXdUZXh0ICh0ZXh0KSB7XG4gICAgaWYgKHRleHQubWF0Y2goL15bIF0rJC8pKSB7XG4gICAgICByZXR1cm4gJyAnXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERvbid0IGNvbXBhY3QgZm9yIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlIHNwYWNlcy5cbiAgICAgIGNvbnN0IHJlZ2V4ID0gL14oXFxzKikoLio/KShcXHMqKSQvZ21cbiAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UocmVnZXgsIChtLCBsZWFkaW5nLCBtaWRkbGUsIHRyYWlsaW5nKSA9PiB7XG4gICAgICAgIHJldHVybiBsZWFkaW5nICsgbWlkZGxlLnNwbGl0KC9bIFxcdF0rLykuam9pbignICcpICsgdHJhaWxpbmdcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIEFsaWduT2NjdXJyZW5jZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG4gIHdoaWNoVG9QYWQgPSAnYXV0bydcblxuICBnZXRTZWxlY3Rpb25UYWtlciAoKSB7XG4gICAgY29uc3Qgc2VsZWN0aW9uc0J5Um93ID0ge31cbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKSkge1xuICAgICAgY29uc3Qgcm93ID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnQucm93XG4gICAgICBpZiAoIShyb3cgaW4gc2VsZWN0aW9uc0J5Um93KSkgc2VsZWN0aW9uc0J5Um93W3Jvd10gPSBbXVxuICAgICAgc2VsZWN0aW9uc0J5Um93W3Jvd10ucHVzaChzZWxlY3Rpb24pXG4gICAgfVxuICAgIGNvbnN0IGFsbFJvd3MgPSBPYmplY3Qua2V5cyhzZWxlY3Rpb25zQnlSb3cpXG4gICAgcmV0dXJuICgpID0+IGFsbFJvd3MubWFwKHJvdyA9PiBzZWxlY3Rpb25zQnlSb3dbcm93XS5zaGlmdCgpKS5maWx0ZXIocyA9PiBzKVxuICB9XG5cbiAgZ2V0V2ljaFRvUGFkRm9yVGV4dCAodGV4dCkge1xuICAgIGlmICh0aGlzLndoaWNoVG9QYWQgIT09ICdhdXRvJykgcmV0dXJuIHRoaXMud2hpY2hUb1BhZFxuXG4gICAgaWYgKC9eXFxzKls9fF1cXHMqJC8udGVzdCh0ZXh0KSkge1xuICAgICAgLy8gQXNpZ25tZW50KD0pIGFuZCBgfGAobWFya2Rvd24tdGFibGUgc2VwYXJhdG9yKVxuICAgICAgcmV0dXJuICdzdGFydCdcbiAgICB9IGVsc2UgaWYgKC9eXFxzKixcXHMqJC8udGVzdCh0ZXh0KSkge1xuICAgICAgLy8gQXJndW1lbnRzXG4gICAgICByZXR1cm4gJ2VuZCdcbiAgICB9IGVsc2UgaWYgKC9cXFckLy50ZXN0KHRleHQpKSB7XG4gICAgICAvLyBlbmRzIHdpdGggbm9uLXdvcmQtY2hhclxuICAgICAgcmV0dXJuICdlbmQnXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnc3RhcnQnXG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlUGFkZGluZyAoKSB7XG4gICAgY29uc3QgdG90YWxBbW91bnRPZlBhZGRpbmdCeVJvdyA9IHt9XG4gICAgY29uc3QgY29sdW1uRm9yU2VsZWN0aW9uID0gc2VsZWN0aW9uID0+IHtcbiAgICAgIGNvbnN0IHdoaWNoID0gdGhpcy5nZXRXaWNoVG9QYWRGb3JUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCkpXG4gICAgICBjb25zdCBwb2ludCA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpW3doaWNoXVxuICAgICAgcmV0dXJuIHBvaW50LmNvbHVtbiArICh0b3RhbEFtb3VudE9mUGFkZGluZ0J5Um93W3BvaW50LnJvd10gfHwgMClcbiAgICB9XG5cbiAgICBjb25zdCB0YWtlU2VsZWN0aW9ucyA9IHRoaXMuZ2V0U2VsZWN0aW9uVGFrZXIoKVxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBjb25zdCBzZWxlY3Rpb25zID0gdGFrZVNlbGVjdGlvbnMoKVxuICAgICAgaWYgKCFzZWxlY3Rpb25zLmxlbmd0aCkgcmV0dXJuXG4gICAgICBjb25zdCBtYXhDb2x1bW4gPSBzZWxlY3Rpb25zLm1hcChjb2x1bW5Gb3JTZWxlY3Rpb24pLnJlZHVjZSgobWF4LCBjdXIpID0+IChjdXIgPiBtYXggPyBjdXIgOiBtYXgpKVxuICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2Ygc2VsZWN0aW9ucykge1xuICAgICAgICBjb25zdCByb3cgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydC5yb3dcbiAgICAgICAgY29uc3QgYW1vdW50T2ZQYWRkaW5nID0gbWF4Q29sdW1uIC0gY29sdW1uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgICAgdG90YWxBbW91bnRPZlBhZGRpbmdCeVJvd1tyb3ddID0gKHRvdGFsQW1vdW50T2ZQYWRkaW5nQnlSb3dbcm93XSB8fCAwKSArIGFtb3VudE9mUGFkZGluZ1xuICAgICAgICB0aGlzLmFtb3VudE9mUGFkZGluZ0J5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIGFtb3VudE9mUGFkZGluZylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBleGVjdXRlICgpIHtcbiAgICB0aGlzLmFtb3VudE9mUGFkZGluZ0J5U2VsZWN0aW9uID0gbmV3IE1hcCgpXG4gICAgdGhpcy5vbkRpZFNlbGVjdFRhcmdldCgoKSA9PiB7XG4gICAgICB0aGlzLmNhbGN1bGF0ZVBhZGRpbmcoKVxuICAgIH0pXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cblxuICBnZXROZXdUZXh0ICh0ZXh0LCBzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBwYWRkaW5nID0gJyAnLnJlcGVhdCh0aGlzLmFtb3VudE9mUGFkZGluZ0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pKVxuICAgIGNvbnN0IHdoaWNoVG9QYWQgPSB0aGlzLmdldFdpY2hUb1BhZEZvclRleHQoc2VsZWN0aW9uLmdldFRleHQoKSlcbiAgICByZXR1cm4gd2hpY2hUb1BhZCA9PT0gJ3N0YXJ0JyA/IHBhZGRpbmcgKyB0ZXh0IDogdGV4dCArIHBhZGRpbmdcbiAgfVxufVxuXG5jbGFzcyBBbGlnbk9jY3VycmVuY2VCeVBhZExlZnQgZXh0ZW5kcyBBbGlnbk9jY3VycmVuY2Uge1xuICB3aGljaFRvUGFkID0gJ3N0YXJ0J1xufVxuXG5jbGFzcyBBbGlnbk9jY3VycmVuY2VCeVBhZFJpZ2h0IGV4dGVuZHMgQWxpZ25PY2N1cnJlbmNlIHtcbiAgd2hpY2hUb1BhZCA9ICdlbmQnXG59XG5cbmNsYXNzIFJlbW92ZUxlYWRpbmdXaGl0ZVNwYWNlcyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIGdldE5ld1RleHQgKHRleHQsIHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHRyaW1MZWZ0ID0gdGV4dCA9PiB0ZXh0LnRyaW1MZWZ0KClcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy51dGlsc1xuICAgICAgICAuc3BsaXRUZXh0QnlOZXdMaW5lKHRleHQpXG4gICAgICAgIC5tYXAodHJpbUxlZnQpXG4gICAgICAgIC5qb2luKCdcXG4nKSArICdcXG4nXG4gICAgKVxuICB9XG59XG5cbmNsYXNzIENvbnZlcnRUb1NvZnRUYWIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSAnU29mdCBUYWInXG4gIHdpc2UgPSAnbGluZXdpc2UnXG5cbiAgbXV0YXRlU2VsZWN0aW9uIChzZWxlY3Rpb24pIHtcbiAgICB0aGlzLnNjYW5FZGl0b3IoJ2ZvcndhcmQnLCAvXFx0L2csIHtzY2FuUmFuZ2U6IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpfSwgKHtyYW5nZSwgcmVwbGFjZX0pID0+IHtcbiAgICAgIC8vIFJlcGxhY2UgXFx0IHRvIHNwYWNlcyB3aGljaCBsZW5ndGggaXMgdmFyeSBkZXBlbmRpbmcgb24gdGFiU3RvcCBhbmQgdGFiTGVuZ2h0XG4gICAgICAvLyBTbyB3ZSBkaXJlY3RseSBjb25zdWx0IGl0J3Mgc2NyZWVuIHJlcHJlc2VudGluZyBsZW5ndGguXG4gICAgICBjb25zdCBsZW5ndGggPSB0aGlzLmVkaXRvci5zY3JlZW5SYW5nZUZvckJ1ZmZlclJhbmdlKHJhbmdlKS5nZXRFeHRlbnQoKS5jb2x1bW5cbiAgICAgIHJlcGxhY2UoJyAnLnJlcGVhdChsZW5ndGgpKVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgQ29udmVydFRvSGFyZFRhYiBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9ICdIYXJkIFRhYidcblxuICBtdXRhdGVTZWxlY3Rpb24gKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHRhYkxlbmd0aCA9IHRoaXMuZWRpdG9yLmdldFRhYkxlbmd0aCgpXG4gICAgdGhpcy5zY2FuRWRpdG9yKCdmb3J3YXJkJywgL1sgXFx0XSsvZywge3NjYW5SYW5nZTogc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCl9LCAoe3JhbmdlLCByZXBsYWNlfSkgPT4ge1xuICAgICAgY29uc3Qge3N0YXJ0LCBlbmR9ID0gdGhpcy5lZGl0b3Iuc2NyZWVuUmFuZ2VGb3JCdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgIGxldCBzdGFydENvbHVtbiA9IHN0YXJ0LmNvbHVtblxuICAgICAgY29uc3QgZW5kQ29sdW1uID0gZW5kLmNvbHVtblxuXG4gICAgICAvLyBXZSBjYW4ndCBuYWl2ZWx5IHJlcGxhY2Ugc3BhY2VzIHRvIHRhYiwgd2UgaGF2ZSB0byBjb25zaWRlciB2YWxpZCB0YWJTdG9wIGNvbHVtblxuICAgICAgLy8gSWYgbmV4dFRhYlN0b3AgY29sdW1uIGV4Y2VlZHMgcmVwbGFjYWJsZSByYW5nZSwgd2UgcGFkIHdpdGggc3BhY2VzLlxuICAgICAgbGV0IG5ld1RleHQgPSAnJ1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY29uc3QgcmVtYWluZGVyID0gc3RhcnRDb2x1bW4gJSB0YWJMZW5ndGhcbiAgICAgICAgY29uc3QgbmV4dFRhYlN0b3AgPSBzdGFydENvbHVtbiArIChyZW1haW5kZXIgPT09IDAgPyB0YWJMZW5ndGggOiByZW1haW5kZXIpXG4gICAgICAgIGlmIChuZXh0VGFiU3RvcCA+IGVuZENvbHVtbikge1xuICAgICAgICAgIG5ld1RleHQgKz0gJyAnLnJlcGVhdChlbmRDb2x1bW4gLSBzdGFydENvbHVtbilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXdUZXh0ICs9ICdcXHQnXG4gICAgICAgIH1cbiAgICAgICAgc3RhcnRDb2x1bW4gPSBuZXh0VGFiU3RvcFxuICAgICAgICBpZiAoc3RhcnRDb2x1bW4gPj0gZW5kQ29sdW1uKSB7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXBsYWNlKG5ld1RleHQpXG4gICAgfSlcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBUcmFuc2Zvcm1TdHJpbmdCeUV4dGVybmFsQ29tbWFuZCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgYXV0b0luZGVudCA9IHRydWVcbiAgY29tbWFuZCA9ICcnIC8vIGUuZy4gY29tbWFuZDogJ3NvcnQnXG4gIGFyZ3MgPSBbXSAvLyBlLmcgYXJnczogWyctcm4nXVxuXG4gIC8vIE5PVEU6IFVubGlrZSBvdGhlciBjbGFzcywgZmlyc3QgYXJnIGlzIGBzdGRvdXRgIG9mIGV4dGVybmFsIGNvbW1hbmRzLlxuICBnZXROZXdUZXh0ICh0ZXh0LCBzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gdGV4dCB8fCBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gIH1cbiAgZ2V0Q29tbWFuZCAoc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHtjb21tYW5kOiB0aGlzLmNvbW1hbmQsIGFyZ3M6IHRoaXMuYXJnc31cbiAgfVxuICBnZXRTdGRpbiAoc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgfVxuXG4gIGFzeW5jIGV4ZWN1dGUgKCkge1xuICAgIHRoaXMucHJlU2VsZWN0KClcblxuICAgIGlmICh0aGlzLnNlbGVjdFRhcmdldCgpKSB7XG4gICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgY29uc3Qge2NvbW1hbmQsIGFyZ3N9ID0gdGhpcy5nZXRDb21tYW5kKHNlbGVjdGlvbikgfHwge31cbiAgICAgICAgaWYgKGNvbW1hbmQgPT0gbnVsbCB8fCBhcmdzID09IG51bGwpIGNvbnRpbnVlXG5cbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gYXdhaXQgdGhpcy5ydW5FeHRlcm5hbENvbW1hbmQoe2NvbW1hbmQsIGFyZ3MsIHN0ZGluOiB0aGlzLmdldFN0ZGluKHNlbGVjdGlvbil9KVxuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0aGlzLmdldE5ld1RleHQoc3Rkb3V0LCBzZWxlY3Rpb24pLCB7YXV0b0luZGVudDogdGhpcy5hdXRvSW5kZW50fSlcbiAgICAgIH1cbiAgICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ2RpZC1maW5pc2gnKVxuICAgICAgdGhpcy5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3NhcnkoKVxuICAgIH1cbiAgICB0aGlzLnBvc3RNdXRhdGUoKVxuICB9XG5cbiAgcnVuRXh0ZXJuYWxDb21tYW5kIChvcHRpb25zKSB7XG4gICAgbGV0IG91dHB1dCA9ICcnXG4gICAgb3B0aW9ucy5zdGRvdXQgPSBkYXRhID0+IChvdXRwdXQgKz0gZGF0YSlcbiAgICBjb25zdCBleGl0UHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgb3B0aW9ucy5leGl0ID0gKCkgPT4gcmVzb2x2ZShvdXRwdXQpXG4gICAgfSlcbiAgICBjb25zdCB7c3RkaW59ID0gb3B0aW9uc1xuICAgIGRlbGV0ZSBvcHRpb25zLnN0ZGluXG4gICAgY29uc3QgYnVmZmVyZWRQcm9jZXNzID0gbmV3IEJ1ZmZlcmVkUHJvY2VzcyhvcHRpb25zKVxuICAgIGJ1ZmZlcmVkUHJvY2Vzcy5vbldpbGxUaHJvd0Vycm9yKCh7ZXJyb3IsIGhhbmRsZX0pID0+IHtcbiAgICAgIC8vIFN1cHByZXNzIGNvbW1hbmQgbm90IGZvdW5kIGVycm9yIGludGVudGlvbmFsbHkuXG4gICAgICBpZiAoZXJyb3IuY29kZSA9PT0gJ0VOT0VOVCcgJiYgZXJyb3Iuc3lzY2FsbC5pbmRleE9mKCdzcGF3bicpID09PSAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke3RoaXMuZ2V0Q29tbWFuZE5hbWUoKX06IEZhaWxlZCB0byBzcGF3biBjb21tYW5kICR7ZXJyb3IucGF0aH0uYClcbiAgICAgICAgaGFuZGxlKClcbiAgICAgIH1cbiAgICAgIHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICB9KVxuXG4gICAgaWYgKHN0ZGluKSB7XG4gICAgICBidWZmZXJlZFByb2Nlc3MucHJvY2Vzcy5zdGRpbi53cml0ZShzdGRpbilcbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLmVuZCgpXG4gICAgfVxuICAgIHJldHVybiBleGl0UHJvbWlzZVxuICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHRhcmdldCA9ICdFbXB0eSdcbiAgcmVjb3JkYWJsZSA9IGZhbHNlXG5cbiAgc3RhdGljIGdldFNlbGVjdExpc3RJdGVtcyAoKSB7XG4gICAgaWYgKCF0aGlzLnNlbGVjdExpc3RJdGVtcykge1xuICAgICAgdGhpcy5zZWxlY3RMaXN0SXRlbXMgPSB0aGlzLnN0cmluZ1RyYW5zZm9ybWVycy5tYXAoa2xhc3MgPT4ge1xuICAgICAgICBjb25zdCBzdWZmaXggPSBrbGFzcy5oYXNPd25Qcm9wZXJ0eSgnZGlzcGxheU5hbWVTdWZmaXgnKSA/ICcgJyArIGtsYXNzLmRpc3BsYXlOYW1lU3VmZml4IDogJydcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGtsYXNzOiBrbGFzcyxcbiAgICAgICAgICBkaXNwbGF5TmFtZToga2xhc3MuaGFzT3duUHJvcGVydHkoJ2Rpc3BsYXlOYW1lJylcbiAgICAgICAgICAgID8ga2xhc3MuZGlzcGxheU5hbWUgKyBzdWZmaXhcbiAgICAgICAgICAgIDogdGhpcy5fLmh1bWFuaXplRXZlbnROYW1lKHRoaXMuXy5kYXNoZXJpemUoa2xhc3MubmFtZSkpICsgc3VmZml4XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNlbGVjdExpc3RJdGVtc1xuICB9XG5cbiAgc2VsZWN0SXRlbXMgKCkge1xuICAgIGlmICghc2VsZWN0TGlzdCkge1xuICAgICAgY29uc3QgU2VsZWN0TGlzdCA9IHJlcXVpcmUoJy4vc2VsZWN0LWxpc3QnKVxuICAgICAgc2VsZWN0TGlzdCA9IG5ldyBTZWxlY3RMaXN0KClcbiAgICB9XG4gICAgcmV0dXJuIHNlbGVjdExpc3Quc2VsZWN0RnJvbUl0ZW1zKHRoaXMuY29uc3RydWN0b3IuZ2V0U2VsZWN0TGlzdEl0ZW1zKCkpXG4gIH1cblxuICBhc3luYyBleGVjdXRlICgpIHtcbiAgICBjb25zdCBpdGVtID0gYXdhaXQgdGhpcy5zZWxlY3RJdGVtcygpXG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIHRoaXMudmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuTmV4dChpdGVtLmtsYXNzLCB7dGFyZ2V0OiB0aGlzLm5leHRUYXJnZXR9KVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBUcmFuc2Zvcm1Xb3JkQnlTZWxlY3RMaXN0IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nQnlTZWxlY3RMaXN0IHtcbiAgbmV4dFRhcmdldCA9ICdJbm5lcldvcmQnXG59XG5cbmNsYXNzIFRyYW5zZm9ybVNtYXJ0V29yZEJ5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdCB7XG4gIG5leHRUYXJnZXQgPSAnSW5uZXJTbWFydFdvcmQnXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFJlcGxhY2VXaXRoUmVnaXN0ZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBmbGFzaFR5cGUgPSAnb3BlcmF0b3ItbG9uZydcblxuICBpbml0aWFsaXplICgpIHtcbiAgICB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIub25Jbml0aWFsaXplKHRoaXMpXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBleGVjdXRlICgpIHtcbiAgICB0aGlzLnNlcXVlbnRpYWxQYXN0ZSA9IHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5vbkV4ZWN1dGUodGhpcylcblxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuXG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldE11dGF0ZWRCdWZmZXJSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIuc2F2ZVBhc3RlZFJhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbiwgcmFuZ2UpXG4gICAgfVxuICB9XG5cbiAgZ2V0TmV3VGV4dCAodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmdldChudWxsLCBzZWxlY3Rpb24sIHRoaXMuc2VxdWVudGlhbFBhc3RlKVxuICAgIHJldHVybiB2YWx1ZSA/IHZhbHVlLnRleHQgOiAnJ1xuICB9XG59XG5cbmNsYXNzIFJlcGxhY2VPY2N1cnJlbmNlV2l0aFJlZ2lzdGVyIGV4dGVuZHMgUmVwbGFjZVdpdGhSZWdpc3RlciB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG59XG5cbi8vIFNhdmUgdGV4dCB0byByZWdpc3RlciBiZWZvcmUgcmVwbGFjZVxuY2xhc3MgU3dhcFdpdGhSZWdpc3RlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGdldE5ld1RleHQgKHRleHQsIHNlbGVjdGlvbikge1xuICAgIGNvbnN0IG5ld1RleHQgPSB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmdldFRleHQoKVxuICAgIHRoaXMuc2V0VGV4dFRvUmVnaXN0ZXIodGV4dCwgc2VsZWN0aW9uKVxuICAgIHJldHVybiBuZXdUZXh0XG4gIH1cbn1cblxuLy8gSW5kZW50IDwgVHJhbnNmb3JtU3RyaW5nXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBJbmRlbnQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlID0gdHJ1ZVxuICB3aXNlID0gJ2xpbmV3aXNlJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbiAoc2VsZWN0aW9uKSB7XG4gICAgLy8gTmVlZCBjb3VudCB0aW1lcyBpbmRlbnRhdGlvbiBpbiB2aXN1YWwtbW9kZSBhbmQgaXRzIHJlcGVhdChgLmApLlxuICAgIGlmICh0aGlzLnRhcmdldC5uYW1lID09PSAnQ3VycmVudFNlbGVjdGlvbicpIHtcbiAgICAgIGxldCBvbGRUZXh0XG4gICAgICAvLyBsaW1pdCB0byAxMDAgdG8gYXZvaWQgZnJlZXppbmcgYnkgYWNjaWRlbnRhbCBiaWcgbnVtYmVyLlxuICAgICAgdGhpcy5jb3VudFRpbWVzKHRoaXMubGltaXROdW1iZXIodGhpcy5nZXRDb3VudCgpLCB7bWF4OiAxMDB9KSwgKHtzdG9wfSkgPT4ge1xuICAgICAgICBvbGRUZXh0ID0gc2VsZWN0aW9uLmdldFRleHQoKVxuICAgICAgICB0aGlzLmluZGVudChzZWxlY3Rpb24pXG4gICAgICAgIGlmIChzZWxlY3Rpb24uZ2V0VGV4dCgpID09PSBvbGRUZXh0KSBzdG9wKClcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaW5kZW50KHNlbGVjdGlvbilcbiAgICB9XG4gIH1cblxuICBpbmRlbnQgKHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvbi5pbmRlbnRTZWxlY3RlZFJvd3MoKVxuICB9XG59XG5cbmNsYXNzIE91dGRlbnQgZXh0ZW5kcyBJbmRlbnQge1xuICBpbmRlbnQgKHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvbi5vdXRkZW50U2VsZWN0ZWRSb3dzKClcbiAgfVxufVxuXG5jbGFzcyBBdXRvSW5kZW50IGV4dGVuZHMgSW5kZW50IHtcbiAgaW5kZW50IChzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24uYXV0b0luZGVudFNlbGVjdGVkUm93cygpXG4gIH1cbn1cblxuY2xhc3MgVG9nZ2xlTGluZUNvbW1lbnRzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHN0YXlBdFNhbWVQb3NpdGlvbiA9IHRydWVcbiAgd2lzZSA9ICdsaW5ld2lzZSdcblxuICBtdXRhdGVTZWxlY3Rpb24gKHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvbi50b2dnbGVMaW5lQ29tbWVudHMoKVxuICB9XG59XG5cbmNsYXNzIFJlZmxvdyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIG11dGF0ZVNlbGVjdGlvbiAoc2VsZWN0aW9uKSB7XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0aGlzLmVkaXRvckVsZW1lbnQsICdhdXRvZmxvdzpyZWZsb3ctc2VsZWN0aW9uJylcbiAgfVxufVxuXG5jbGFzcyBSZWZsb3dXaXRoU3RheSBleHRlbmRzIFJlZmxvdyB7XG4gIHN0YXlBdFNhbWVQb3NpdGlvbiA9IHRydWVcbn1cblxuLy8gU3Vycm91bmQgPCBUcmFuc2Zvcm1TdHJpbmdcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFN1cnJvdW5kQmFzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgc3Vycm91bmRBY3Rpb24gPSBudWxsXG4gIHBhaXJzQnlBbGlhcyA9IHtcbiAgICAnKCc6IFsnKCcsICcpJ10sXG4gICAgJyknOiBbJygnLCAnKSddLFxuICAgICd7JzogWyd7JywgJ30nXSxcbiAgICAnfSc6IFsneycsICd9J10sXG4gICAgJ1snOiBbJ1snLCAnXSddLFxuICAgICddJzogWydbJywgJ10nXSxcbiAgICAnPCc6IFsnPCcsICc+J10sXG4gICAgJz4nOiBbJzwnLCAnPiddLFxuICAgIGI6IFsnKCcsICcpJ10sXG4gICAgQjogWyd7JywgJ30nXSxcbiAgICByOiBbJ1snLCAnXSddLFxuICAgIGE6IFsnPCcsICc+J11cbiAgfVxuXG4gIGluaXRpYWxpemUgKCkge1xuICAgIHRoaXMucmVwbGFjZUJ5RGlmZiA9IHRoaXMuZ2V0Q29uZmlnKCdyZXBsYWNlQnlEaWZmT25TdXJyb3VuZCcpXG4gICAgdGhpcy5zdGF5QnlNYXJrZXIgPSB0aGlzLnJlcGxhY2VCeURpZmZcbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGdldFBhaXIgKGNoYXIpIHtcbiAgICBjb25zdCB1c2VyQ29uZmlnID0gdGhpcy5nZXRDb25maWcoJ2N1c3RvbVN1cnJvdW5kUGFpcnMnKVxuICAgIGNvbnN0IGN1c3RvbVBhaXJCeUFsaWFzID0gSlNPTi5wYXJzZSh1c2VyQ29uZmlnKSB8fCB7fVxuICAgIHJldHVybiBjdXN0b21QYWlyQnlBbGlhc1tjaGFyXSB8fCB0aGlzLnBhaXJzQnlBbGlhc1tjaGFyXSB8fCBbY2hhciwgY2hhcl1cbiAgfVxuXG4gIHN1cnJvdW5kICh0ZXh0LCBjaGFyLCB7a2VlcExheW91dCA9IGZhbHNlLCBzZWxlY3Rpb259ID0ge30pIHtcbiAgICBsZXQgW29wZW4sIGNsb3NlLCBhZGRTcGFjZV0gPSB0aGlzLmdldFBhaXIoY2hhcilcbiAgICBpZiAoIWtlZXBMYXlvdXQgJiYgdGV4dC5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgIGNvbnN0IGJhc2VJbmRlbnRMZXZlbCA9IHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0LnJvdylcbiAgICAgIGNvbnN0IGluZGVudFRleHRTdGFydFJvdyA9IHRoaXMuZWRpdG9yLmJ1aWxkSW5kZW50U3RyaW5nKGJhc2VJbmRlbnRMZXZlbClcbiAgICAgIGNvbnN0IGluZGVudFRleHRPbmVMZXZlbCA9IHRoaXMuZWRpdG9yLmJ1aWxkSW5kZW50U3RyaW5nKDEpXG5cbiAgICAgIG9wZW4gPSBpbmRlbnRUZXh0U3RhcnRSb3cgKyBvcGVuICsgJ1xcbidcbiAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoL14oLispJC9nbSwgbSA9PiBpbmRlbnRUZXh0T25lTGV2ZWwgKyBtKVxuICAgICAgY2xvc2UgPSBpbmRlbnRUZXh0U3RhcnRSb3cgKyBjbG9zZSArICdcXG4nXG4gICAgfVxuXG4gICAgaWYgKHRoaXMudXRpbHMuaXNTaW5nbGVMaW5lVGV4dCh0ZXh0KSkge1xuICAgICAgaWYgKGFkZFNwYWNlIHx8IHRoaXMuZ2V0Q29uZmlnKCdjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmQnKS5pbmNsdWRlcyhjaGFyKSkge1xuICAgICAgICB0ZXh0ID0gJyAnICsgdGV4dCArICcgJ1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3BlbiArIHRleHQgKyBjbG9zZVxuICB9XG5cbiAgZ2V0VGFyZ2V0UGFpciAoKSB7XG4gICAgaWYgKHRoaXMudGFyZ2V0KSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXQucGFpclxuICAgIH1cbiAgfVxuXG4gIGRlbGV0ZVN1cnJvdW5kICh0ZXh0KSB7XG4gICAgY29uc3QgW29wZW4sIGNsb3NlXSA9IHRoaXMuZ2V0VGFyZ2V0UGFpcigpIHx8IFt0ZXh0WzBdLCB0ZXh0W3RleHQubGVuZ3RoIC0gMV1dXG4gICAgY29uc3QgaW5uZXJUZXh0ID0gdGV4dC5zbGljZShvcGVuLmxlbmd0aCwgdGV4dC5sZW5ndGggLSBjbG9zZS5sZW5ndGgpXG4gICAgcmV0dXJuIHRoaXMudXRpbHMuaXNTaW5nbGVMaW5lVGV4dCh0ZXh0KSAmJiBvcGVuICE9PSBjbG9zZSA/IGlubmVyVGV4dC50cmltKCkgOiBpbm5lclRleHRcbiAgfVxuXG4gIGdldE5ld1RleHQgKHRleHQsIHNlbGVjdGlvbikge1xuICAgIGlmICh0aGlzLnN1cnJvdW5kQWN0aW9uID09PSAnc3Vycm91bmQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdXJyb3VuZCh0ZXh0LCB0aGlzLmlucHV0LCB7c2VsZWN0aW9ufSlcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3Vycm91bmRBY3Rpb24gPT09ICdkZWxldGUtc3Vycm91bmQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWxldGVTdXJyb3VuZCh0ZXh0KVxuICAgIH0gZWxzZSBpZiAodGhpcy5zdXJyb3VuZEFjdGlvbiA9PT0gJ2NoYW5nZS1zdXJyb3VuZCcpIHtcbiAgICAgIHJldHVybiB0aGlzLnN1cnJvdW5kKHRoaXMuZGVsZXRlU3Vycm91bmQodGV4dCksIHRoaXMuaW5wdXQsIHtrZWVwTGF5b3V0OiB0cnVlfSlcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZEJhc2Uge1xuICBzdXJyb3VuZEFjdGlvbiA9ICdzdXJyb3VuZCdcbiAgcmVhZElucHV0QWZ0ZXJTZWxlY3QgPSB0cnVlXG59XG5cbmNsYXNzIFN1cnJvdW5kV29yZCBleHRlbmRzIFN1cnJvdW5kIHtcbiAgdGFyZ2V0ID0gJ0lubmVyV29yZCdcbn1cblxuY2xhc3MgU3Vycm91bmRTbWFydFdvcmQgZXh0ZW5kcyBTdXJyb3VuZCB7XG4gIHRhcmdldCA9ICdJbm5lclNtYXJ0V29yZCdcbn1cblxuY2xhc3MgTWFwU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZCB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG4gIHBhdHRlcm5Gb3JPY2N1cnJlbmNlID0gL1xcdysvZ1xufVxuXG4vLyBEZWxldGUgU3Vycm91bmRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIERlbGV0ZVN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmRCYXNlIHtcbiAgc3Vycm91bmRBY3Rpb24gPSAnZGVsZXRlLXN1cnJvdW5kJ1xuICBpbml0aWFsaXplICgpIHtcbiAgICBpZiAoIXRoaXMudGFyZ2V0KSB7XG4gICAgICB0aGlzLmZvY3VzSW5wdXQoe1xuICAgICAgICBvbkNvbmZpcm06IGNoYXIgPT4ge1xuICAgICAgICAgIHRoaXMuc2V0VGFyZ2V0KHRoaXMuZ2V0SW5zdGFuY2UoJ0FQYWlyJywge3BhaXI6IHRoaXMuZ2V0UGFpcihjaGFyKX0pKVxuICAgICAgICAgIHRoaXMucHJvY2Vzc09wZXJhdGlvbigpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG59XG5cbmNsYXNzIERlbGV0ZVN1cnJvdW5kQW55UGFpciBleHRlbmRzIERlbGV0ZVN1cnJvdW5kIHtcbiAgdGFyZ2V0ID0gJ0FBbnlQYWlyJ1xufVxuXG5jbGFzcyBEZWxldGVTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBEZWxldGVTdXJyb3VuZEFueVBhaXIge1xuICB0YXJnZXQgPSAnQUFueVBhaXJBbGxvd0ZvcndhcmRpbmcnXG59XG5cbi8vIENoYW5nZSBTdXJyb3VuZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ2hhbmdlU3Vycm91bmQgZXh0ZW5kcyBEZWxldGVTdXJyb3VuZCB7XG4gIHN1cnJvdW5kQWN0aW9uID0gJ2NoYW5nZS1zdXJyb3VuZCdcbiAgcmVhZElucHV0QWZ0ZXJTZWxlY3QgPSB0cnVlXG5cbiAgLy8gT3ZlcnJpZGUgdG8gc2hvdyBjaGFuZ2luZyBjaGFyIG9uIGhvdmVyXG4gIGFzeW5jIGZvY3VzSW5wdXRQcm9taXNlZCAoLi4uYXJncykge1xuICAgIGNvbnN0IGhvdmVyUG9pbnQgPSB0aGlzLm11dGF0aW9uTWFuYWdlci5nZXRJbml0aWFsUG9pbnRGb3JTZWxlY3Rpb24odGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgIGNvbnN0IG9wZW5TdXJyb25kVGV4dCA9IHRoaXMuZ2V0VGFyZ2V0UGFpcigpID8gdGhpcy5nZXRUYXJnZXRQYWlyKClbMF0gOiB0aGlzLmVkaXRvci5nZXRTZWxlY3RlZFRleHQoKVswXVxuICAgIHRoaXMudmltU3RhdGUuaG92ZXIuc2V0KG9wZW5TdXJyb25kVGV4dCwgaG92ZXJQb2ludClcbiAgICByZXR1cm4gc3VwZXIuZm9jdXNJbnB1dFByb21pc2VkKC4uLmFyZ3MpXG4gIH1cbn1cblxuY2xhc3MgQ2hhbmdlU3Vycm91bmRBbnlQYWlyIGV4dGVuZHMgQ2hhbmdlU3Vycm91bmQge1xuICB0YXJnZXQgPSAnQUFueVBhaXInXG59XG5cbmNsYXNzIENoYW5nZVN1cnJvdW5kQW55UGFpckFsbG93Rm9yd2FyZGluZyBleHRlbmRzIENoYW5nZVN1cnJvdW5kQW55UGFpciB7XG4gIHRhcmdldCA9ICdBQW55UGFpckFsbG93Rm9yd2FyZGluZydcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRklYTUVcbi8vIEN1cnJlbnRseSBuYXRpdmUgZWRpdG9yLmpvaW5MaW5lcygpIGlzIGJldHRlciBmb3IgY3Vyc29yIHBvc2l0aW9uIHNldHRpbmdcbi8vIFNvIEkgdXNlIG5hdGl2ZSBtZXRob2RzIGZvciBhIG1lYW53aGlsZS5cbmNsYXNzIEpvaW5UYXJnZXQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuXG4gIG11dGF0ZVNlbGVjdGlvbiAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gICAgLy8gV2hlbiBjdXJzb3IgaXMgYXQgbGFzdCBCVUZGRVIgcm93LCBpdCBzZWxlY3QgbGFzdC1idWZmZXItcm93LCB0aGVuXG4gICAgLy8gam9pbm5pbmcgcmVzdWx0IGluIFwiY2xlYXIgbGFzdC1idWZmZXItcm93IHRleHRcIi5cbiAgICAvLyBJIGJlbGlldmUgdGhpcyBpcyBCVUcgb2YgdXBzdHJlYW0gYXRvbS1jb3JlLiBndWFyZCB0aGlzIHNpdHVhdGlvbiBoZXJlXG4gICAgaWYgKCFyYW5nZS5pc1NpbmdsZUxpbmUoKSB8fCByYW5nZS5lbmQucm93ICE9PSB0aGlzLmVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCkpIHtcbiAgICAgIGlmICh0aGlzLnV0aWxzLmlzTGluZXdpc2VSYW5nZShyYW5nZSkpIHtcbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlLnRyYW5zbGF0ZShbMCwgMF0sIFstMSwgSW5maW5pdHldKSlcbiAgICAgIH1cbiAgICAgIHNlbGVjdGlvbi5qb2luTGluZXMoKVxuICAgIH1cbiAgICBjb25zdCBwb2ludCA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmVuZC50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICByZXR1cm4gc2VsZWN0aW9uLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgfVxufVxuXG5jbGFzcyBKb2luIGV4dGVuZHMgSm9pblRhcmdldCB7XG4gIHRhcmdldCA9ICdNb3ZlVG9SZWxhdGl2ZUxpbmUnXG59XG5cbmNsYXNzIEpvaW5CYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICB3aXNlID0gJ2xpbmV3aXNlJ1xuICB0cmltID0gZmFsc2VcbiAgdGFyZ2V0ID0gJ01vdmVUb1JlbGF0aXZlTGluZU1pbmltdW1Ud28nXG5cbiAgZ2V0TmV3VGV4dCAodGV4dCkge1xuICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy50cmltID8gL1xccj9cXG5bIFxcdF0qL2cgOiAvXFxyP1xcbi9nXG4gICAgcmV0dXJuIHRleHQudHJpbVJpZ2h0KCkucmVwbGFjZShyZWdleCwgdGhpcy5pbnB1dCkgKyAnXFxuJ1xuICB9XG59XG5cbmNsYXNzIEpvaW5XaXRoS2VlcGluZ1NwYWNlIGV4dGVuZHMgSm9pbkJhc2Uge1xuICBpbnB1dCA9ICcnXG59XG5cbmNsYXNzIEpvaW5CeUlucHV0IGV4dGVuZHMgSm9pbkJhc2Uge1xuICByZWFkSW5wdXRBZnRlclNlbGVjdCA9IHRydWVcbiAgZm9jdXNJbnB1dE9wdGlvbnMgPSB7Y2hhcnNNYXg6IDEwfVxuICB0cmltID0gdHJ1ZVxufVxuXG5jbGFzcyBKb2luQnlJbnB1dFdpdGhLZWVwaW5nU3BhY2UgZXh0ZW5kcyBKb2luQnlJbnB1dCB7XG4gIHRyaW0gPSBmYWxzZVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTdHJpbmcgc3VmZml4IGluIG5hbWUgaXMgdG8gYXZvaWQgY29uZnVzaW9uIHdpdGggJ3NwbGl0JyB3aW5kb3cuXG5jbGFzcyBTcGxpdFN0cmluZyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHRhcmdldCA9ICdNb3ZlVG9SZWxhdGl2ZUxpbmUnXG4gIGtlZXBTcGxpdHRlciA9IGZhbHNlXG4gIHJlYWRJbnB1dEFmdGVyU2VsZWN0ID0gdHJ1ZVxuICBmb2N1c0lucHV0T3B0aW9ucyA9IHtjaGFyc01heDogMTB9XG5cbiAgZ2V0TmV3VGV4dCAodGV4dCkge1xuICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCh0aGlzLl8uZXNjYXBlUmVnRXhwKHRoaXMuaW5wdXQgfHwgJ1xcXFxuJyksICdnJylcbiAgICBjb25zdCBsaW5lU2VwYXJhdG9yID0gKHRoaXMua2VlcFNwbGl0dGVyID8gdGhpcy5pbnB1dCA6ICcnKSArICdcXG4nXG4gICAgcmV0dXJuIHRleHQucmVwbGFjZShyZWdleCwgbGluZVNlcGFyYXRvcilcbiAgfVxufVxuXG5jbGFzcyBTcGxpdFN0cmluZ1dpdGhLZWVwaW5nU3BsaXR0ZXIgZXh0ZW5kcyBTcGxpdFN0cmluZyB7XG4gIGtlZXBTcGxpdHRlciA9IHRydWVcbn1cblxuY2xhc3MgU3BsaXRBcmd1bWVudHMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBrZWVwU2VwYXJhdG9yID0gdHJ1ZVxuXG4gIGdldE5ld1RleHQgKHRleHQsIHNlbGVjdGlvbikge1xuICAgIGNvbnN0IGFsbFRva2VucyA9IHRoaXMudXRpbHMuc3BsaXRBcmd1bWVudHModGV4dC50cmltKCkpXG4gICAgbGV0IG5ld1RleHQgPSAnJ1xuXG4gICAgY29uc3QgYmFzZUluZGVudExldmVsID0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnQucm93KVxuICAgIGNvbnN0IGluZGVudFRleHRTdGFydFJvdyA9IHRoaXMuZWRpdG9yLmJ1aWxkSW5kZW50U3RyaW5nKGJhc2VJbmRlbnRMZXZlbClcbiAgICBjb25zdCBpbmRlbnRUZXh0SW5uZXJSb3dzID0gdGhpcy5lZGl0b3IuYnVpbGRJbmRlbnRTdHJpbmcoYmFzZUluZGVudExldmVsICsgMSlcblxuICAgIHdoaWxlIChhbGxUb2tlbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCB7dGV4dCwgdHlwZX0gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgbmV3VGV4dCArPSB0eXBlID09PSAnc2VwYXJhdG9yJyA/ICh0aGlzLmtlZXBTZXBhcmF0b3IgPyB0ZXh0LnRyaW0oKSA6ICcnKSArICdcXG4nIDogaW5kZW50VGV4dElubmVyUm93cyArIHRleHRcbiAgICB9XG4gICAgcmV0dXJuIGBcXG4ke25ld1RleHR9XFxuJHtpbmRlbnRUZXh0U3RhcnRSb3d9YFxuICB9XG59XG5cbmNsYXNzIFNwbGl0QXJndW1lbnRzV2l0aFJlbW92ZVNlcGFyYXRvciBleHRlbmRzIFNwbGl0QXJndW1lbnRzIHtcbiAga2VlcFNlcGFyYXRvciA9IGZhbHNlXG59XG5cbmNsYXNzIFNwbGl0QXJndW1lbnRzT2ZJbm5lckFueVBhaXIgZXh0ZW5kcyBTcGxpdEFyZ3VtZW50cyB7XG4gIHRhcmdldCA9ICdJbm5lckFueVBhaXInXG59XG5cbmNsYXNzIENoYW5nZU9yZGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBhY3Rpb24gPSBudWxsXG4gIHNvcnRCeSA9IG51bGxcblxuICBnZXROZXdUZXh0ICh0ZXh0KSB7XG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0LmlzTGluZXdpc2UoKVxuICAgICAgPyB0aGlzLmdldE5ld0xpc3QodGhpcy51dGlscy5zcGxpdFRleHRCeU5ld0xpbmUodGV4dCkpLmpvaW4oJ1xcbicpICsgJ1xcbidcbiAgICAgIDogdGhpcy5zb3J0QXJndW1lbnRzSW5UZXh0QnkodGV4dCwgYXJncyA9PiB0aGlzLmdldE5ld0xpc3QoYXJncykpXG4gIH1cblxuICBnZXROZXdMaXN0IChyb3dzKSB7XG4gICAgaWYgKHJvd3MubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gW3RoaXMudXRpbHMuY2hhbmdlQ2hhck9yZGVyKHJvd3NbMF0sIHRoaXMuYWN0aW9uLCB0aGlzLnNvcnRCeSldXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnV0aWxzLmNoYW5nZUFycmF5T3JkZXIocm93cywgdGhpcy5hY3Rpb24sIHRoaXMuc29ydEJ5KVxuICAgIH1cbiAgfVxuXG4gIHNvcnRBcmd1bWVudHNJblRleHRCeSAodGV4dCwgZm4pIHtcbiAgICBjb25zdCBzdGFydCA9IHRleHQuc2VhcmNoKC9cXFMvKVxuICAgIGNvbnN0IGVuZCA9IHRleHQuc2VhcmNoKC9cXHMqJC8pXG4gICAgY29uc3QgbGVhZGluZ1NwYWNlcyA9IHN0YXJ0ICE9PSAtMSA/IHRleHQuc2xpY2UoMCwgc3RhcnQpIDogJydcbiAgICBjb25zdCB0cmFpbGluZ1NwYWNlcyA9IGVuZCAhPT0gLTEgPyB0ZXh0LnNsaWNlKGVuZCkgOiAnJ1xuICAgIGNvbnN0IGFsbFRva2VucyA9IHRoaXMudXRpbHMuc3BsaXRBcmd1bWVudHModGV4dC5zbGljZShzdGFydCwgZW5kKSlcbiAgICBjb25zdCBhcmdzID0gYWxsVG9rZW5zLmZpbHRlcih0b2tlbiA9PiB0b2tlbi50eXBlID09PSAnYXJndW1lbnQnKS5tYXAodG9rZW4gPT4gdG9rZW4udGV4dClcbiAgICBjb25zdCBuZXdBcmdzID0gZm4oYXJncylcblxuICAgIGxldCBuZXdUZXh0ID0gJydcbiAgICB3aGlsZSAoYWxsVG9rZW5zLmxlbmd0aCkge1xuICAgICAgY29uc3QgdG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgLy8gdG9rZW4udHlwZSBpcyBcInNlcGFyYXRvclwiIG9yIFwiYXJndW1lbnRcIlxuICAgICAgbmV3VGV4dCArPSB0b2tlbi50eXBlID09PSAnc2VwYXJhdG9yJyA/IHRva2VuLnRleHQgOiBuZXdBcmdzLnNoaWZ0KClcbiAgICB9XG4gICAgcmV0dXJuIGxlYWRpbmdTcGFjZXMgKyBuZXdUZXh0ICsgdHJhaWxpbmdTcGFjZXNcbiAgfVxufVxuXG5jbGFzcyBSZXZlcnNlIGV4dGVuZHMgQ2hhbmdlT3JkZXIge1xuICBhY3Rpb24gPSAncmV2ZXJzZSdcbn1cblxuY2xhc3MgUmV2ZXJzZUlubmVyQW55UGFpciBleHRlbmRzIFJldmVyc2Uge1xuICB0YXJnZXQgPSAnSW5uZXJBbnlQYWlyJ1xufVxuXG5jbGFzcyBSb3RhdGUgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGFjdGlvbiA9ICdyb3RhdGUtbGVmdCdcbn1cblxuY2xhc3MgUm90YXRlQmFja3dhcmRzIGV4dGVuZHMgQ2hhbmdlT3JkZXIge1xuICBhY3Rpb24gPSAncm90YXRlLXJpZ2h0J1xufVxuXG5jbGFzcyBSb3RhdGVBcmd1bWVudHNPZklubmVyUGFpciBleHRlbmRzIFJvdGF0ZSB7XG4gIHRhcmdldCA9ICdJbm5lckFueVBhaXInXG59XG5cbmNsYXNzIFJvdGF0ZUFyZ3VtZW50c0JhY2t3YXJkc09mSW5uZXJQYWlyIGV4dGVuZHMgUm90YXRlQmFja3dhcmRzIHtcbiAgdGFyZ2V0ID0gJ0lubmVyQW55UGFpcidcbn1cblxuY2xhc3MgU29ydCBleHRlbmRzIENoYW5nZU9yZGVyIHtcbiAgYWN0aW9uID0gJ3NvcnQnXG59XG5cbmNsYXNzIFNvcnRDYXNlSW5zZW5zaXRpdmVseSBleHRlbmRzIFNvcnQge1xuICBzb3J0QnkgPSAocm93QSwgcm93QikgPT4gcm93QS5sb2NhbGVDb21wYXJlKHJvd0IsIHtzZW5zaXRpdml0eTogJ2Jhc2UnfSlcbn1cblxuY2xhc3MgU29ydEJ5TnVtYmVyIGV4dGVuZHMgU29ydCB7XG4gIHNvcnRCeSA9IChyb3dBLCByb3dCKSA9PiAoTnVtYmVyLnBhcnNlSW50KHJvd0EpIHx8IEluZmluaXR5KSAtIChOdW1iZXIucGFyc2VJbnQocm93QikgfHwgSW5maW5pdHkpXG59XG5cbmNsYXNzIE51bWJlcmluZ0xpbmVzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgd2lzZSA9ICdsaW5ld2lzZSdcblxuICBnZXROZXdUZXh0ICh0ZXh0KSB7XG4gICAgY29uc3Qgcm93cyA9IHRoaXMudXRpbHMuc3BsaXRUZXh0QnlOZXdMaW5lKHRleHQpXG4gICAgY29uc3QgbGFzdFJvd1dpZHRoID0gU3RyaW5nKHJvd3MubGVuZ3RoKS5sZW5ndGhcblxuICAgIGNvbnN0IG5ld1Jvd3MgPSByb3dzLm1hcCgocm93VGV4dCwgaSkgPT4ge1xuICAgICAgaSsrIC8vIGZpeCAwIHN0YXJ0IGluZGV4IHRvIDEgc3RhcnQuXG4gICAgICBjb25zdCBhbW91bnRPZlBhZGRpbmcgPSB0aGlzLmxpbWl0TnVtYmVyKGxhc3RSb3dXaWR0aCAtIFN0cmluZyhpKS5sZW5ndGgsIHttaW46IDB9KVxuICAgICAgcmV0dXJuICcgJy5yZXBlYXQoYW1vdW50T2ZQYWRkaW5nKSArIGkgKyAnOiAnICsgcm93VGV4dFxuICAgIH0pXG4gICAgcmV0dXJuIG5ld1Jvd3Muam9pbignXFxuJykgKyAnXFxuJ1xuICB9XG59XG5cbmNsYXNzIER1cGxpY2F0ZVdpdGhDb21tZW50T3V0T3JpZ2luYWwgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICB3aXNlID0gJ2xpbmV3aXNlJ1xuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHN0YXlBdFNhbWVQb3NpdGlvbiA9IHRydWVcbiAgbXV0YXRlU2VsZWN0aW9uIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBbc3RhcnRSb3csIGVuZFJvd10gPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZSh0aGlzLnV0aWxzLmluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLCBbc3RhcnRSb3csIDBdLCBzZWxlY3Rpb24uZ2V0VGV4dCgpKSlcbiAgICB0aGlzLmVkaXRvci50b2dnbGVMaW5lQ29tbWVudHNGb3JCdWZmZXJSb3dzKHN0YXJ0Um93LCBlbmRSb3cpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFRyYW5zZm9ybVN0cmluZyxcblxuICBOb0Nhc2UsXG4gIERvdENhc2UsXG4gIFN3YXBDYXNlLFxuICBQYXRoQ2FzZSxcbiAgVXBwZXJDYXNlLFxuICBMb3dlckNhc2UsXG4gIENhbWVsQ2FzZSxcbiAgU25ha2VDYXNlLFxuICBUaXRsZUNhc2UsXG4gIFBhcmFtQ2FzZSxcbiAgSGVhZGVyQ2FzZSxcbiAgUGFzY2FsQ2FzZSxcbiAgQ29uc3RhbnRDYXNlLFxuICBTZW50ZW5jZUNhc2UsXG4gIFVwcGVyQ2FzZUZpcnN0LFxuICBMb3dlckNhc2VGaXJzdCxcbiAgRGFzaENhc2UsXG4gIFRvZ2dsZUNhc2UsXG4gIFRvZ2dsZUNhc2VBbmRNb3ZlUmlnaHQsXG5cbiAgUmVwbGFjZSxcbiAgUmVwbGFjZUNoYXJhY3RlcixcbiAgU3BsaXRCeUNoYXJhY3RlcixcbiAgRW5jb2RlVXJpQ29tcG9uZW50LFxuICBEZWNvZGVVcmlDb21wb25lbnQsXG4gIFRyaW1TdHJpbmcsXG4gIENvbXBhY3RTcGFjZXMsXG4gIEFsaWduT2NjdXJyZW5jZSxcbiAgQWxpZ25PY2N1cnJlbmNlQnlQYWRMZWZ0LFxuICBBbGlnbk9jY3VycmVuY2VCeVBhZFJpZ2h0LFxuICBSZW1vdmVMZWFkaW5nV2hpdGVTcGFjZXMsXG4gIENvbnZlcnRUb1NvZnRUYWIsXG4gIENvbnZlcnRUb0hhcmRUYWIsXG4gIFRyYW5zZm9ybVN0cmluZ0J5RXh0ZXJuYWxDb21tYW5kLFxuICBUcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3QsXG4gIFRyYW5zZm9ybVdvcmRCeVNlbGVjdExpc3QsXG4gIFRyYW5zZm9ybVNtYXJ0V29yZEJ5U2VsZWN0TGlzdCxcbiAgUmVwbGFjZVdpdGhSZWdpc3RlcixcbiAgUmVwbGFjZU9jY3VycmVuY2VXaXRoUmVnaXN0ZXIsXG4gIFN3YXBXaXRoUmVnaXN0ZXIsXG4gIEluZGVudCxcbiAgT3V0ZGVudCxcbiAgQXV0b0luZGVudCxcbiAgVG9nZ2xlTGluZUNvbW1lbnRzLFxuICBSZWZsb3csXG4gIFJlZmxvd1dpdGhTdGF5LFxuICBTdXJyb3VuZEJhc2UsXG4gIFN1cnJvdW5kLFxuICBTdXJyb3VuZFdvcmQsXG4gIFN1cnJvdW5kU21hcnRXb3JkLFxuICBNYXBTdXJyb3VuZCxcbiAgRGVsZXRlU3Vycm91bmQsXG4gIERlbGV0ZVN1cnJvdW5kQW55UGFpcixcbiAgRGVsZXRlU3Vycm91bmRBbnlQYWlyQWxsb3dGb3J3YXJkaW5nLFxuICBDaGFuZ2VTdXJyb3VuZCxcbiAgQ2hhbmdlU3Vycm91bmRBbnlQYWlyLFxuICBDaGFuZ2VTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcsXG4gIEpvaW5UYXJnZXQsXG4gIEpvaW4sXG4gIEpvaW5CYXNlLFxuICBKb2luV2l0aEtlZXBpbmdTcGFjZSxcbiAgSm9pbkJ5SW5wdXQsXG4gIEpvaW5CeUlucHV0V2l0aEtlZXBpbmdTcGFjZSxcbiAgU3BsaXRTdHJpbmcsXG4gIFNwbGl0U3RyaW5nV2l0aEtlZXBpbmdTcGxpdHRlcixcbiAgU3BsaXRBcmd1bWVudHMsXG4gIFNwbGl0QXJndW1lbnRzV2l0aFJlbW92ZVNlcGFyYXRvcixcbiAgU3BsaXRBcmd1bWVudHNPZklubmVyQW55UGFpcixcbiAgQ2hhbmdlT3JkZXIsXG4gIFJldmVyc2UsXG4gIFJldmVyc2VJbm5lckFueVBhaXIsXG4gIFJvdGF0ZSxcbiAgUm90YXRlQmFja3dhcmRzLFxuICBSb3RhdGVBcmd1bWVudHNPZklubmVyUGFpcixcbiAgUm90YXRlQXJndW1lbnRzQmFja3dhcmRzT2ZJbm5lclBhaXIsXG4gIFNvcnQsXG4gIFNvcnRDYXNlSW5zZW5zaXRpdmVseSxcbiAgU29ydEJ5TnVtYmVyLFxuICBOdW1iZXJpbmdMaW5lcyxcbiAgRHVwbGljYXRlV2l0aENvbW1lbnRPdXRPcmlnaW5hbFxufVxuZm9yIChjb25zdCBrbGFzcyBvZiBPYmplY3QudmFsdWVzKG1vZHVsZS5leHBvcnRzKSkge1xuICBpZiAoa2xhc3MuaXNDb21tYW5kKCkpIGtsYXNzLnJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbn1cbiJdfQ==