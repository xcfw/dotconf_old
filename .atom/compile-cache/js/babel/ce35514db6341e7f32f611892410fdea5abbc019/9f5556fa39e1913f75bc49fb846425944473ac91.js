'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _require = require('atom');

var BufferedProcess = _require.BufferedProcess;

var settings = require('./settings');
var VimState = require('./vim-state');

// NOTE: changing order affects output of lib/json/command-table.json
var VMPOperationFiles = ['./operator', './operator-insert', './operator-transform-string', './motion', './motion-search', './text-object', './misc-command'];

// Borrowed from underscore-plus
var ModifierKeyMap = {
  'ctrl-cmd-': '⌃⌘',
  'cmd-': '⌘',
  'ctrl-': '⌃',
  alt: '⌥',
  option: '⌥',
  enter: '⏎',
  left: '←',
  right: '→',
  up: '↑',
  down: '↓',
  backspace: 'BS',
  space: 'SPC'
};

var SelectorMap = {
  'atom-text-editor.vim-mode-plus': '',
  '.normal-mode': 'n',
  '.insert-mode': 'i',
  '.replace': 'R',
  '.visual-mode': 'v',
  '.characterwise': 'C',
  '.blockwise': 'B',
  '.linewise': 'L',
  '.operator-pending-mode': 'o',
  '.with-count': '#',
  '.has-persistent-selection': '%'
};

var Developer = (function () {
  function Developer() {
    _classCallCheck(this, Developer);
  }

  _createClass(Developer, [{
    key: 'init',
    value: function init() {
      var _this = this;

      return atom.commands.add('atom-text-editor', {
        'vim-mode-plus:toggle-debug': function vimModePlusToggleDebug() {
          return _this.toggleDebug();
        },
        'vim-mode-plus:open-in-vim': function vimModePlusOpenInVim() {
          return _this.openInVim();
        },
        'vim-mode-plus:generate-command-summary-table': function vimModePlusGenerateCommandSummaryTable() {
          return _this.generateCommandSummaryTable();
        },
        'vim-mode-plus:write-command-table-and-file-table-to-disk': function vimModePlusWriteCommandTableAndFileTableToDisk() {
          return _this.writeCommandTableAndFileTableToDisk();
        },
        'vim-mode-plus:set-global-vim-state': function vimModePlusSetGlobalVimState() {
          return _this.setGlobalVimState();
        },
        'vim-mode-plus:clear-debug-output': function vimModePlusClearDebugOutput() {
          return _this.clearDebugOutput();
        },
        'vim-mode-plus:reload': function vimModePlusReload() {
          return _this.reload();
        },
        'vim-mode-plus:reload-with-dependencies': function vimModePlusReloadWithDependencies() {
          return _this.reload(true);
        },
        'vim-mode-plus:report-total-marker-count': function vimModePlusReportTotalMarkerCount() {
          return _this.reportTotalMarkerCount();
        },
        'vim-mode-plus:report-total-and-per-editor-marker-count': function vimModePlusReportTotalAndPerEditorMarkerCount() {
          return _this.reportTotalMarkerCount(true);
        },
        'vim-mode-plus:report-require-cache': function vimModePlusReportRequireCache() {
          return _this.reportRequireCache({ excludeNodModules: true });
        },
        'vim-mode-plus:report-require-cache-all': function vimModePlusReportRequireCacheAll() {
          return _this.reportRequireCache({ excludeNodModules: false });
        }
      });
    }
  }, {
    key: 'setGlobalVimState',
    value: function setGlobalVimState() {
      global.vimState = VimState.get(atom.workspace.getActiveTextEditor());
      console.log('set global.vimState for debug', global.vimState);
    }
  }, {
    key: 'reportRequireCache',
    value: function reportRequireCache(_ref) {
      var focus = _ref.focus;
      var excludeNodModules = _ref.excludeNodModules;

      var path = require('path');
      var packPath = atom.packages.getLoadedPackage('vim-mode-plus').path;
      var cachedPaths = Object.keys(require.cache).filter(function (p) {
        return p.startsWith(packPath + path.sep);
      }).map(function (p) {
        return p.replace(packPath, '');
      });

      for (var cachedPath of cachedPaths) {
        if (excludeNodModules && cachedPath.search(/node_modules/) >= 0) {
          continue;
        }
        if (focus && cachedPath.search(new RegExp('' + focus)) >= 0) {
          cachedPath = '*' + cachedPath;
        }
        console.log(cachedPath);
      }
    }
  }, {
    key: 'reportTotalMarkerCount',
    value: function reportTotalMarkerCount() {
      var showEditorsReport = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var _require2 = require('util');

      var inspect = _require2.inspect;

      var _require3 = require('path');

      var basename = _require3.basename;

      var total = {
        mark: 0,
        hlsearch: 0,
        mutation: 0,
        occurrence: 0,
        persistentSel: 0
      };

      for (var editor of atom.workspace.getTextEditors()) {
        var vimState = VimState.get(editor);
        var mark = vimState.mark.markerLayer.getMarkerCount();
        var hlsearch = vimState.highlightSearch.markerLayer.getMarkerCount();
        var mutation = vimState.mutationManager.markerLayer.getMarkerCount();
        var occurrence = vimState.occurrenceManager.markerLayer.getMarkerCount();
        var persistentSel = vimState.persistentSelection.markerLayer.getMarkerCount();
        if (showEditorsReport) {
          console.log(basename(editor.getPath()), inspect({ mark: mark, hlsearch: hlsearch, mutation: mutation, occurrence: occurrence, persistentSel: persistentSel }));
        }

        total.mark += mark;
        total.hlsearch += hlsearch;
        total.mutation += mutation;
        total.occurrence += occurrence;
        total.persistentSel += persistentSel;
      }

      return console.log('total', inspect(total));
    }
  }, {
    key: 'reload',
    value: _asyncToGenerator(function* (reloadDependencies) {
      function deleteRequireCacheForPathPrefix(prefix) {
        Object.keys(require.cache).filter(function (p) {
          return p.startsWith(prefix);
        }).forEach(function (p) {
          return delete require.cache[p];
        });
      }

      var packagesNeedReload = ['vim-mode-plus'];
      if (reloadDependencies) packagesNeedReload.push.apply(packagesNeedReload, _toConsumableArray(settings.get('devReloadPackages')));

      var loadedPackages = packagesNeedReload.filter(function (packName) {
        return atom.packages.isPackageLoaded(packName);
      });
      console.log('reload', loadedPackages);

      var pathSeparator = require('path').sep;

      for (var packName of loadedPackages) {
        console.log('- deactivating ' + packName);
        var packPath = atom.packages.getLoadedPackage(packName).path;
        yield atom.packages.deactivatePackage(packName);
        atom.packages.unloadPackage(packName);
        deleteRequireCacheForPathPrefix(packPath + pathSeparator);
      }
      console.time('activate');

      loadedPackages.forEach(function (packName) {
        console.log('+ activating ' + packName);
        atom.packages.loadPackage(packName);
        atom.packages.activatePackage(packName);
      });

      console.timeEnd('activate');
    })
  }, {
    key: 'clearDebugOutput',
    value: function clearDebugOutput(name, fn) {
      var _require4 = require('fs-plus');

      var normalize = _require4.normalize;

      var filePath = normalize(settings.get('debugOutputFilePath'));
      atom.workspace.open(filePath, { searchAllPanes: true, activatePane: false }).then(function (editor) {
        editor.setText('');
        editor.save();
      });
    }
  }, {
    key: 'toggleDebug',
    value: function toggleDebug() {
      settings.set('debug', !settings.get('debug'));
      console.log(settings.scope + ' debug:', settings.get('debug'));
    }
  }, {
    key: 'getCommandSpecs',
    value: function getCommandSpecs() {
      var _require5 = require('underscore-plus');

      var escapeRegExp = _require5.escapeRegExp;

      var _require6 = require('./utils');

      var getKeyBindingForCommand = _require6.getKeyBindingForCommand;

      var specs = [];
      for (var file of VMPOperationFiles) {
        for (var klass of Object.values(require(file))) {
          if (!klass.isCommand()) continue;

          var commandName = klass.getCommandName();

          var keymaps = getKeyBindingForCommand(commandName, { packageName: 'vim-mode-plus' });
          var keymap = keymaps ? keymaps.map(function (k) {
            return '`' + compactSelector(k.selector) + '` <code>' + compactKeystrokes(k.keystrokes) + '</code>';
          }).join('<br/>') : undefined;

          specs.push({
            name: klass.name,
            commandName: commandName,
            kind: klass.operationKind,
            keymap: keymap
          });
        }
      }

      return specs;

      function compactSelector(selector) {
        var sources = Object.keys(SelectorMap).map(escapeRegExp);
        var regex = new RegExp('(' + sources.join('|') + ')', 'g');
        return selector.split(/,\s*/g).map(function (scope) {
          return scope.replace(/:not\((.*?)\)/g, '!$1').replace(regex, function (s) {
            return SelectorMap[s];
          });
        }).join(',');
      }

      function compactKeystrokes(keystrokes) {
        var specialChars = '\\`*_{}[]()#+-.!';

        var modifierKeyRegexSources = Object.keys(ModifierKeyMap).map(escapeRegExp);
        var modifierKeyRegex = new RegExp('(' + modifierKeyRegexSources.join('|') + ')');
        var specialCharsRegexSources = specialChars.split('').map(escapeRegExp);
        var specialCharsRegex = new RegExp('(' + specialCharsRegexSources.join('|') + ')', 'g');

        return keystrokes
        // .replace(/(`|_)/g, '\\$1')
        .replace(modifierKeyRegex, function (s) {
          return ModifierKeyMap[s];
        }).replace(specialCharsRegex, '\\$1').replace(/\|/g, '&#124;').replace(/\s+/, '');
      }
    }
  }, {
    key: 'generateSummaryTableForCommandSpecs',
    value: function generateSummaryTableForCommandSpecs(specs) {
      var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var header = _ref2.header;

      var grouped = {};
      for (var spec of specs) {
        if (!grouped[spec.kind]) grouped[spec.kind] = [];

        grouped[spec.kind].push(spec);
      }

      var result = '';
      var OPERATION_KINDS = ['operator', 'motion', 'text-object', 'misc-command'];

      for (var kind of OPERATION_KINDS) {
        var _specs = grouped[kind];
        if (!_specs) continue;

        // prettier-ignore
        var table = ['| Keymap | Command | Description |', '|:-------|:--------|:------------|'];

        for (var _ref32 of _specs) {
          var _ref3$keymap = _ref32.keymap;
          var keymap = _ref3$keymap === undefined ? '' : _ref3$keymap;
          var commandName = _ref32.commandName;
          var _ref3$description = _ref32.description;
          var description = _ref3$description === undefined ? '' : _ref3$description;

          commandName = commandName.replace(/vim-mode-plus:/, '');
          table.push('| ' + keymap + ' | `' + commandName + '` | ' + description + ' |');
        }
        result += '## ' + kind + '\n\n' + table.join('\n') + '\n\n';
      }

      atom.workspace.open().then(function (editor) {
        if (header) editor.insertText(header + '\n\n');
        editor.insertText(result);
      });
    }
  }, {
    key: 'generateCommandSummaryTable',
    value: function generateCommandSummaryTable() {
      var _require7 = require('./utils');

      var removeIndent = _require7.removeIndent;

      var header = removeIndent('\n      ## Keymap selector abbreviations\n\n      In this document, following abbreviations are used for shortness.\n\n      | Abbrev | Selector                     | Description                         |\n      |:-------|:-----------------------------|:------------------------------------|\n      | `!i`   | `:not(.insert-mode)`         | except insert-mode                  |\n      | `i`    | `.insert-mode`               |                                     |\n      | `o`    | `.operator-pending-mode`     |                                     |\n      | `n`    | `.normal-mode`               |                                     |\n      | `v`    | `.visual-mode`               |                                     |\n      | `vB`   | `.visual-mode.blockwise`     |                                     |\n      | `vL`   | `.visual-mode.linewise`      |                                     |\n      | `vC`   | `.visual-mode.characterwise` |                                     |\n      | `iR`   | `.insert-mode.replace`       |                                     |\n      | `#`    | `.with-count`                | when count is specified             |\n      | `%`    | `.has-persistent-selection`  | when persistent-selection is exists |\n      ');

      this.generateSummaryTableForCommandSpecs(this.getCommandSpecs(), { header: header });
    }
  }, {
    key: 'openInVim',
    value: function openInVim() {
      var editor = atom.workspace.getActiveTextEditor();

      var _editor$getCursorBufferPosition = editor.getCursorBufferPosition();

      var row = _editor$getCursorBufferPosition.row;
      var column = _editor$getCursorBufferPosition.column;

      // e.g. /Applications/MacVim.app/Contents/MacOS/Vim -g /etc/hosts "+call cursor(4, 3)"
      return new BufferedProcess({
        command: '/Applications/MacVim.app/Contents/MacOS/Vim',
        args: ['-g', editor.getPath(), '+call cursor(' + (row + 1) + ', ' + (column + 1) + ')']
      });
    }
  }, {
    key: 'buildCommandTableAndFileTable',
    value: function buildCommandTableAndFileTable() {
      var fileTable = {};
      var commandTable = [];
      var seen = {}; // Just to detect duplicate name

      for (var file of VMPOperationFiles) {
        fileTable[file] = [];

        for (var klass of Object.values(require(file))) {
          if (seen[klass.name]) {
            throw new Error('Duplicate class ' + klass.name + ' in "' + file + '" and "' + seen[klass.name] + '"');
          }
          seen[klass.name] = file;
          fileTable[file].push(klass.name);
          if (klass.isCommand()) commandTable.push(klass.getCommandName());
        }
      }
      return { commandTable: commandTable, fileTable: fileTable };
    }

    // # How vmp commands become available?
    // #========================================
    // Vmp have many commands, loading full commands at startup slow down pkg activation.
    // So vmp load summary command table at startup then lazy require command body on-use timing.
    // Here is how vmp commands are registerd and invoked.
    // Initially introduced in PR #758
    //
    // 1. [On dev]: Preparation done by developer
    //   - Invoking `Vim Mode Plus:Write Command Table And File Table To Disk`. it does following.
    //   - "./json/command-table.json" and "./json/file-table.json". are updated.
    //
    // 2. [On atom/vmp startup]
    //   - Register commands(e.g. `move-down`) from "./json/command-table.json".
    //
    // 3. [On run time]: e.g. Invoke `move-down` by `j` keystroke
    //   - Fire `move-down` command.
    //   - It execute `vimState.operationStack.run("MoveDown")`
    //   - Determine files to require from "./json/file-table.json".
    //   - Load `MoveDown` class by require('./motions') and run it!
    //
  }, {
    key: 'writeCommandTableAndFileTableToDisk',
    value: _asyncToGenerator(function* () {
      var fs = require('fs-plus');
      var path = require('path');

      var _buildCommandTableAndFileTable = this.buildCommandTableAndFileTable();

      var commandTable = _buildCommandTableAndFileTable.commandTable;
      var fileTable = _buildCommandTableAndFileTable.fileTable;

      var getStateFor = function getStateFor(baseName, object, pretty) {
        var filePath = path.join(__dirname, 'json', baseName) + (pretty ? '-pretty.json' : '.json');
        var jsonString = pretty ? JSON.stringify(object, null, '  ') : JSON.stringify(object);
        var needUpdate = fs.readFileSync(filePath, 'utf8').trimRight() !== jsonString;
        return { filePath: filePath, jsonString: jsonString, needUpdate: needUpdate };
      };

      var statesNeedUpdate = [getStateFor('command-table', commandTable, false), getStateFor('command-table', commandTable, true), getStateFor('file-table', fileTable, false), getStateFor('file-table', fileTable, true)].filter(function (state) {
        return state.needUpdate;
      });

      if (!statesNeedUpdate.length) {
        atom.notifications.addInfo('No changfes in commandTable and fileTable', { dismissable: true });
        return;
      }

      var _loop = function* (_ref4) {
        var jsonString = _ref4.jsonString;
        var filePath = _ref4.filePath;

        yield atom.workspace.open(filePath, { activatePane: false, activateItem: false }).then(function (editor) {
          editor.setText(jsonString);
          return editor.save().then(function () {
            atom.notifications.addInfo('Updated ' + path.basename(filePath), { dismissable: true });
          });
        });
      };

      for (var _ref4 of statesNeedUpdate) {
        yield* _loop(_ref4);
      }
    })
  }]);

  return Developer;
})();

module.exports = new Developer();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3hjZi8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9kZXZlbG9wZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7O2VBRWUsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBbEMsZUFBZSxZQUFmLGVBQWU7O0FBRXRCLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUN0QyxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7OztBQUd2QyxJQUFNLGlCQUFpQixHQUFHLENBQ3hCLFlBQVksRUFDWixtQkFBbUIsRUFDbkIsNkJBQTZCLEVBQzdCLFVBQVUsRUFDVixpQkFBaUIsRUFDakIsZUFBZSxFQUNmLGdCQUFnQixDQUNqQixDQUFBOzs7QUFHRCxJQUFNLGNBQWMsR0FBRztBQUNyQixhQUFXLEVBQUUsSUFBYztBQUMzQixRQUFNLEVBQUUsR0FBUTtBQUNoQixTQUFPLEVBQUUsR0FBUTtBQUNqQixLQUFHLEVBQUUsR0FBUTtBQUNiLFFBQU0sRUFBRSxHQUFRO0FBQ2hCLE9BQUssRUFBRSxHQUFRO0FBQ2YsTUFBSSxFQUFFLEdBQVE7QUFDZCxPQUFLLEVBQUUsR0FBUTtBQUNmLElBQUUsRUFBRSxHQUFRO0FBQ1osTUFBSSxFQUFFLEdBQVE7QUFDZCxXQUFTLEVBQUUsSUFBSTtBQUNmLE9BQUssRUFBRSxLQUFLO0NBQ2IsQ0FBQTs7QUFFRCxJQUFNLFdBQVcsR0FBRztBQUNsQixrQ0FBZ0MsRUFBRSxFQUFFO0FBQ3BDLGdCQUFjLEVBQUUsR0FBRztBQUNuQixnQkFBYyxFQUFFLEdBQUc7QUFDbkIsWUFBVSxFQUFFLEdBQUc7QUFDZixnQkFBYyxFQUFFLEdBQUc7QUFDbkIsa0JBQWdCLEVBQUUsR0FBRztBQUNyQixjQUFZLEVBQUUsR0FBRztBQUNqQixhQUFXLEVBQUUsR0FBRztBQUNoQiwwQkFBd0IsRUFBRSxHQUFHO0FBQzdCLGVBQWEsRUFBRSxH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QUMsYUFBYSxDQUFDLE9BQU8sQ0FBQywyQ0FBMkMsRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFBO0FBQzVGLGVBQU07T0FDUDs7O1lBRVcsVUFBVSxTQUFWLFVBQVU7WUFBRSxRQUFRLFNBQVIsUUFBUTs7QUFDOUIsY0FBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUM3RixnQkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUMxQixpQkFBTyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDOUIsZ0JBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxjQUFZLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUksRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQTtXQUN0RixDQUFDLENBQUE7U0FDSCxDQUFDLENBQUE7OztBQU5KLHdCQUFxQyxnQkFBZ0IsRUFBRTs7T0FPdEQ7S0FDRjs7O1NBL1RHLFNBQVM7OztBQWtVZixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUEiLCJmaWxlIjoiL2hvbWUveGNmLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2RldmVsb3Blci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmNvbnN0IHtCdWZmZXJlZFByb2Nlc3N9ID0gcmVxdWlyZSgnYXRvbScpXG5cbmNvbnN0IHNldHRpbmdzID0gcmVxdWlyZSgnLi9zZXR0aW5ncycpXG5jb25zdCBWaW1TdGF0ZSA9IHJlcXVpcmUoJy4vdmltLXN0YXRlJylcblxuLy8gTk9URTogY2hhbmdpbmcgb3JkZXIgYWZmZWN0cyBvdXRwdXQgb2YgbGliL2pzb24vY29tbWFuZC10YWJsZS5qc29uXG5jb25zdCBWTVBPcGVyYXRpb25GaWxlcyA9IFtcbiAgJy4vb3BlcmF0b3InLFxuICAnLi9vcGVyYXRvci1pbnNlcnQnLFxuICAnLi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nJyxcbiAgJy4vbW90aW9uJyxcbiAgJy4vbW90aW9uLXNlYXJjaCcsXG4gICcuL3RleHQtb2JqZWN0JyxcbiAgJy4vbWlzYy1jb21tYW5kJ1xuXVxuXG4vLyBCb3Jyb3dlZCBmcm9tIHVuZGVyc2NvcmUtcGx1c1xuY29uc3QgTW9kaWZpZXJLZXlNYXAgPSB7XG4gICdjdHJsLWNtZC0nOiAnXFx1MjMwM1xcdTIzMTgnLFxuICAnY21kLSc6ICdcXHUyMzE4JyxcbiAgJ2N0cmwtJzogJ1xcdTIzMDMnLFxuICBhbHQ6ICdcXHUyMzI1JyxcbiAgb3B0aW9uOiAnXFx1MjMyNScsXG4gIGVudGVyOiAnXFx1MjNjZScsXG4gIGxlZnQ6ICdcXHUyMTkwJyxcbiAgcmlnaHQ6ICdcXHUyMTkyJyxcbiAgdXA6ICdcXHUyMTkxJyxcbiAgZG93bjogJ1xcdTIxOTMnLFxuICBiYWNrc3BhY2U6ICdCUycsXG4gIHNwYWNlOiAnU1BDJ1xufVxuXG5jb25zdCBTZWxlY3Rvck1hcCA9IHtcbiAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cyc6ICcnLFxuICAnLm5vcm1hbC1tb2RlJzogJ24nLFxuICAnLmluc2VydC1tb2RlJzogJ2knLFxuICAnLnJlcGxhY2UnOiAnUicsXG4gICcudmlzdWFsLW1vZGUnOiAndicsXG4gICcuY2hhcmFjdGVyd2lzZSc6ICdDJyxcbiAgJy5ibG9ja3dpc2UnOiAnQicsXG4gICcubGluZXdpc2UnOiAnTCcsXG4gICcub3BlcmF0b3ItcGVuZGluZy1tb2RlJzogJ28nLFxuICAnLndpdGgtY291bnQnOiAnIycsXG4gICcuaGFzLXBlcnNpc3RlbnQtc2VsZWN0aW9uJzogJyUnXG59XG5cbmNsYXNzIERldmVsb3BlciB7XG4gIGluaXQgKCkge1xuICAgIHJldHVybiBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICd2aW0tbW9kZS1wbHVzOnRvZ2dsZS1kZWJ1Zyc6ICgpID0+IHRoaXMudG9nZ2xlRGVidWcoKSxcbiAgICAgICd2aW0tbW9kZS1wbHVzOm9wZW4taW4tdmltJzogKCkgPT4gdGhpcy5vcGVuSW5WaW0oKSxcbiAgICAgICd2aW0tbW9kZS1wbHVzOmdlbmVyYXRlLWNvbW1hbmQtc3VtbWFyeS10YWJsZSc6ICgpID0+IHRoaXMuZ2VuZXJhdGVDb21tYW5kU3VtbWFyeVRhYmxlKCksXG4gICAgICAndmltLW1vZGUtcGx1czp3cml0ZS1jb21tYW5kLXRhYmxlLWFuZC1maWxlLXRhYmxlLXRvLWRpc2snOiAoKSA9PiB0aGlzLndyaXRlQ29tbWFuZFRhYmxlQW5kRmlsZVRhYmxlVG9EaXNrKCksXG4gICAgICAndmltLW1vZGUtcGx1czpzZXQtZ2xvYmFsLXZpbS1zdGF0ZSc6ICgpID0+IHRoaXMuc2V0R2xvYmFsVmltU3RhdGUoKSxcbiAgICAgICd2aW0tbW9kZS1wbHVzOmNsZWFyLWRlYnVnLW91dHB1dCc6ICgpID0+IHRoaXMuY2xlYXJEZWJ1Z091dHB1dCgpLFxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6cmVsb2FkJzogKCkgPT4gdGhpcy5yZWxvYWQoKSxcbiAgICAgICd2aW0tbW9kZS1wbHVzOnJlbG9hZC13aXRoLWRlcGVuZGVuY2llcyc6ICgpID0+IHRoaXMucmVsb2FkKHRydWUpLFxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6cmVwb3J0LXRvdGFsLW1hcmtlci1jb3VudCc6ICgpID0+IHRoaXMucmVwb3J0VG90YWxNYXJrZXJDb3VudCgpLFxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6cmVwb3J0LXRvdGFsLWFuZC1wZXItZWRpdG9yLW1hcmtlci1jb3VudCc6ICgpID0+IHRoaXMucmVwb3J0VG90YWxNYXJrZXJDb3VudCh0cnVlKSxcbiAgICAgICd2aW0tbW9kZS1wbHVzOnJlcG9ydC1yZXF1aXJlLWNhY2hlJzogKCkgPT4gdGhpcy5yZXBvcnRSZXF1aXJlQ2FjaGUoe2V4Y2x1ZGVOb2RNb2R1bGVzOiB0cnVlfSksXG4gICAgICAndmltLW1vZGUtcGx1czpyZXBvcnQtcmVxdWlyZS1jYWNoZS1hbGwnOiAoKSA9PiB0aGlzLnJlcG9ydFJlcXVpcmVDYWNoZSh7ZXhjbHVkZU5vZE1vZHVsZXM6IGZhbHNlfSlcbiAgICB9KVxuICB9XG5cbiAgc2V0R2xvYmFsVmltU3RhdGUgKCkge1xuICAgIGdsb2JhbC52aW1TdGF0ZSA9IFZpbVN0YXRlLmdldChhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpXG4gICAgY29uc29sZS5sb2coJ3NldCBnbG9iYWwudmltU3RhdGUgZm9yIGRlYnVnJywgZ2xvYmFsLnZpbVN0YXRlKVxuICB9XG5cbiAgcmVwb3J0UmVxdWlyZUNhY2hlICh7Zm9jdXMsIGV4Y2x1ZGVOb2RNb2R1bGVzfSkge1xuICAgIGNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbiAgICBjb25zdCBwYWNrUGF0aCA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZSgndmltLW1vZGUtcGx1cycpLnBhdGhcbiAgICBjb25zdCBjYWNoZWRQYXRocyA9IE9iamVjdC5rZXlzKHJlcXVpcmUuY2FjaGUpXG4gICAgICAuZmlsdGVyKHAgPT4gcC5zdGFydHNXaXRoKHBhY2tQYXRoICsgcGF0aC5zZXApKVxuICAgICAgLm1hcChwID0+IHAucmVwbGFjZShwYWNrUGF0aCwgJycpKVxuXG4gICAgZm9yIChsZXQgY2FjaGVkUGF0aCBvZiBjYWNoZWRQYXRocykge1xuICAgICAgaWYgKGV4Y2x1ZGVOb2RNb2R1bGVzICYmIGNhY2hlZFBhdGguc2VhcmNoKC9ub2RlX21vZHVsZXMvKSA+PSAwKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBpZiAoZm9jdXMgJiYgY2FjaGVkUGF0aC5zZWFyY2gobmV3IFJlZ0V4cChgJHtmb2N1c31gKSkgPj0gMCkge1xuICAgICAgICBjYWNoZWRQYXRoID0gYCoke2NhY2hlZFBhdGh9YFxuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coY2FjaGVkUGF0aClcbiAgICB9XG4gIH1cblxuICByZXBvcnRUb3RhbE1hcmtlckNvdW50IChzaG93RWRpdG9yc1JlcG9ydCA9IGZhbHNlKSB7XG4gICAgY29uc3Qge2luc3BlY3R9ID0gcmVxdWlyZSgndXRpbCcpXG4gICAgY29uc3Qge2Jhc2VuYW1lfSA9IHJlcXVpcmUoJ3BhdGgnKVxuICAgIGNvbnN0IHRvdGFsID0ge1xuICAgICAgbWFyazogMCxcbiAgICAgIGhsc2VhcmNoOiAwLFxuICAgICAgbXV0YXRpb246IDAsXG4gICAgICBvY2N1cnJlbmNlOiAwLFxuICAgICAgcGVyc2lzdGVudFNlbDogMFxuICAgIH1cblxuICAgIGZvciAoY29uc3QgZWRpdG9yIG9mIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkpIHtcbiAgICAgIGNvbnN0IHZpbVN0YXRlID0gVmltU3RhdGUuZ2V0KGVkaXRvcilcbiAgICAgIGNvbnN0IG1hcmsgPSB2aW1TdGF0ZS5tYXJrLm1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KClcbiAgICAgIGNvbnN0IGhsc2VhcmNoID0gdmltU3RhdGUuaGlnaGxpZ2h0U2VhcmNoLm1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KClcbiAgICAgIGNvbnN0IG11dGF0aW9uID0gdmltU3RhdGUubXV0YXRpb25NYW5hZ2VyLm1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KClcbiAgICAgIGNvbnN0IG9jY3VycmVuY2UgPSB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5tYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpXG4gICAgICBjb25zdCBwZXJzaXN0ZW50U2VsID0gdmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5tYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpXG4gICAgICBpZiAoc2hvd0VkaXRvcnNSZXBvcnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coYmFzZW5hbWUoZWRpdG9yLmdldFBhdGgoKSksIGluc3BlY3Qoe21hcmssIGhsc2VhcmNoLCBtdXRhdGlvbiwgb2NjdXJyZW5jZSwgcGVyc2lzdGVudFNlbH0pKVxuICAgICAgfVxuXG4gICAgICB0b3RhbC5tYXJrICs9IG1hcmtcbiAgICAgIHRvdGFsLmhsc2VhcmNoICs9IGhsc2VhcmNoXG4gICAgICB0b3RhbC5tdXRhdGlvbiArPSBtdXRhdGlvblxuICAgICAgdG90YWwub2NjdXJyZW5jZSArPSBvY2N1cnJlbmNlXG4gICAgICB0b3RhbC5wZXJzaXN0ZW50U2VsICs9IHBlcnNpc3RlbnRTZWxcbiAgICB9XG5cbiAgICByZXR1cm4gY29uc29sZS5sb2coJ3RvdGFsJywgaW5zcGVjdCh0b3RhbCkpXG4gIH1cblxuICBhc3luYyByZWxvYWQgKHJlbG9hZERlcGVuZGVuY2llcykge1xuICAgIGZ1bmN0aW9uIGRlbGV0ZVJlcXVpcmVDYWNoZUZvclBhdGhQcmVmaXggKHByZWZpeCkge1xuICAgICAgT2JqZWN0LmtleXMocmVxdWlyZS5jYWNoZSlcbiAgICAgICAgLmZpbHRlcihwID0+IHAuc3RhcnRzV2l0aChwcmVmaXgpKVxuICAgICAgICAuZm9yRWFjaChwID0+IGRlbGV0ZSByZXF1aXJlLmNhY2hlW3BdKVxuICAgIH1cblxuICAgIGNvbnN0IHBhY2thZ2VzTmVlZFJlbG9hZCA9IFsndmltLW1vZGUtcGx1cyddXG4gICAgaWYgKHJlbG9hZERlcGVuZGVuY2llcykgcGFja2FnZXNOZWVkUmVsb2FkLnB1c2goLi4uc2V0dGluZ3MuZ2V0KCdkZXZSZWxvYWRQYWNrYWdlcycpKVxuXG4gICAgY29uc3QgbG9hZGVkUGFja2FnZXMgPSBwYWNrYWdlc05lZWRSZWxvYWQuZmlsdGVyKHBhY2tOYW1lID0+IGF0b20ucGFja2FnZXMuaXNQYWNrYWdlTG9hZGVkKHBhY2tOYW1lKSlcbiAgICBjb25zb2xlLmxvZygncmVsb2FkJywgbG9hZGVkUGFja2FnZXMpXG5cbiAgICBjb25zdCBwYXRoU2VwYXJhdG9yID0gcmVxdWlyZSgncGF0aCcpLnNlcFxuXG4gICAgZm9yIChjb25zdCBwYWNrTmFtZSBvZiBsb2FkZWRQYWNrYWdlcykge1xuICAgICAgY29uc29sZS5sb2coYC0gZGVhY3RpdmF0aW5nICR7cGFja05hbWV9YClcbiAgICAgIGNvbnN0IHBhY2tQYXRoID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKHBhY2tOYW1lKS5wYXRoXG4gICAgICBhd2FpdCBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2tOYW1lKVxuICAgICAgYXRvbS5wYWNrYWdlcy51bmxvYWRQYWNrYWdlKHBhY2tOYW1lKVxuICAgICAgZGVsZXRlUmVxdWlyZUNhY2hlRm9yUGF0aFByZWZpeChwYWNrUGF0aCArIHBhdGhTZXBhcmF0b3IpXG4gICAgfVxuICAgIGNvbnNvbGUudGltZSgnYWN0aXZhdGUnKVxuXG4gICAgbG9hZGVkUGFja2FnZXMuZm9yRWFjaChwYWNrTmFtZSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhgKyBhY3RpdmF0aW5nICR7cGFja05hbWV9YClcbiAgICAgIGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UocGFja05hbWUpXG4gICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShwYWNrTmFtZSlcbiAgICB9KVxuXG4gICAgY29uc29sZS50aW1lRW5kKCdhY3RpdmF0ZScpXG4gIH1cblxuICBjbGVhckRlYnVnT3V0cHV0IChuYW1lLCBmbikge1xuICAgIGNvbnN0IHtub3JtYWxpemV9ID0gcmVxdWlyZSgnZnMtcGx1cycpXG4gICAgY29uc3QgZmlsZVBhdGggPSBub3JtYWxpemUoc2V0dGluZ3MuZ2V0KCdkZWJ1Z091dHB1dEZpbGVQYXRoJykpXG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aCwge3NlYXJjaEFsbFBhbmVzOiB0cnVlLCBhY3RpdmF0ZVBhbmU6IGZhbHNlfSkudGhlbihlZGl0b3IgPT4ge1xuICAgICAgZWRpdG9yLnNldFRleHQoJycpXG4gICAgICBlZGl0b3Iuc2F2ZSgpXG4gICAgfSlcbiAgfVxuXG4gIHRvZ2dsZURlYnVnICgpIHtcbiAgICBzZXR0aW5ncy5zZXQoJ2RlYnVnJywgIXNldHRpbmdzLmdldCgnZGVidWcnKSlcbiAgICBjb25zb2xlLmxvZyhgJHtzZXR0aW5ncy5zY29wZX0gZGVidWc6YCwgc2V0dGluZ3MuZ2V0KCdkZWJ1ZycpKVxuICB9XG5cbiAgZ2V0Q29tbWFuZFNwZWNzICgpIHtcbiAgICBjb25zdCB7ZXNjYXBlUmVnRXhwfSA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUtcGx1cycpXG4gICAgY29uc3Qge2dldEtleUJpbmRpbmdGb3JDb21tYW5kfSA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuXG4gICAgY29uc3Qgc3BlY3MgPSBbXVxuICAgIGZvciAoY29uc3QgZmlsZSBvZiBWTVBPcGVyYXRpb25GaWxlcykge1xuICAgICAgZm9yIChjb25zdCBrbGFzcyBvZiBPYmplY3QudmFsdWVzKHJlcXVpcmUoZmlsZSkpKSB7XG4gICAgICAgIGlmICgha2xhc3MuaXNDb21tYW5kKCkpIGNvbnRpbnVlXG5cbiAgICAgICAgY29uc3QgY29tbWFuZE5hbWUgPSBrbGFzcy5nZXRDb21tYW5kTmFtZSgpXG5cbiAgICAgICAgY29uc3Qga2V5bWFwcyA9IGdldEtleUJpbmRpbmdGb3JDb21tYW5kKGNvbW1hbmROYW1lLCB7cGFja2FnZU5hbWU6ICd2aW0tbW9kZS1wbHVzJ30pXG4gICAgICAgIGNvbnN0IGtleW1hcCA9IGtleW1hcHNcbiAgICAgICAgICA/IGtleW1hcHNcbiAgICAgICAgICAgICAgLm1hcChrID0+IGBcXGAke2NvbXBhY3RTZWxlY3RvcihrLnNlbGVjdG9yKX1cXGAgPGNvZGU+JHtjb21wYWN0S2V5c3Ryb2tlcyhrLmtleXN0cm9rZXMpfTwvY29kZT5gKVxuICAgICAgICAgICAgICAuam9pbignPGJyLz4nKVxuICAgICAgICAgIDogdW5kZWZpbmVkXG5cbiAgICAgICAgc3BlY3MucHVzaCh7XG4gICAgICAgICAgbmFtZToga2xhc3MubmFtZSxcbiAgICAgICAgICBjb21tYW5kTmFtZTogY29tbWFuZE5hbWUsXG4gICAgICAgICAga2luZDoga2xhc3Mub3BlcmF0aW9uS2luZCxcbiAgICAgICAgICBrZXltYXA6IGtleW1hcFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzcGVjc1xuXG4gICAgZnVuY3Rpb24gY29tcGFjdFNlbGVjdG9yIChzZWxlY3Rvcikge1xuICAgICAgY29uc3Qgc291cmNlcyA9IE9iamVjdC5rZXlzKFNlbGVjdG9yTWFwKS5tYXAoZXNjYXBlUmVnRXhwKVxuICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKGAoJHtzb3VyY2VzLmpvaW4oJ3wnKX0pYCwgJ2cnKVxuICAgICAgcmV0dXJuIHNlbGVjdG9yXG4gICAgICAgIC5zcGxpdCgvLFxccyovZylcbiAgICAgICAgLm1hcChzY29wZSA9PiBzY29wZS5yZXBsYWNlKC86bm90XFwoKC4qPylcXCkvZywgJyEkMScpLnJlcGxhY2UocmVnZXgsIHMgPT4gU2VsZWN0b3JNYXBbc10pKVxuICAgICAgICAuam9pbignLCcpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tcGFjdEtleXN0cm9rZXMgKGtleXN0cm9rZXMpIHtcbiAgICAgIGNvbnN0IHNwZWNpYWxDaGFycyA9ICdcXFxcYCpfe31bXSgpIystLiEnXG5cbiAgICAgIGNvbnN0IG1vZGlmaWVyS2V5UmVnZXhTb3VyY2VzID0gT2JqZWN0LmtleXMoTW9kaWZpZXJLZXlNYXApLm1hcChlc2NhcGVSZWdFeHApXG4gICAgICBjb25zdCBtb2RpZmllcktleVJlZ2V4ID0gbmV3IFJlZ0V4cChgKCR7bW9kaWZpZXJLZXlSZWdleFNvdXJjZXMuam9pbignfCcpfSlgKVxuICAgICAgY29uc3Qgc3BlY2lhbENoYXJzUmVnZXhTb3VyY2VzID0gc3BlY2lhbENoYXJzLnNwbGl0KCcnKS5tYXAoZXNjYXBlUmVnRXhwKVxuICAgICAgY29uc3Qgc3BlY2lhbENoYXJzUmVnZXggPSBuZXcgUmVnRXhwKGAoJHtzcGVjaWFsQ2hhcnNSZWdleFNvdXJjZXMuam9pbignfCcpfSlgLCAnZycpXG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIGtleXN0cm9rZXNcbiAgICAgICAgICAvLyAucmVwbGFjZSgvKGB8XykvZywgJ1xcXFwkMScpXG4gICAgICAgICAgLnJlcGxhY2UobW9kaWZpZXJLZXlSZWdleCwgcyA9PiBNb2RpZmllcktleU1hcFtzXSlcbiAgICAgICAgICAucmVwbGFjZShzcGVjaWFsQ2hhcnNSZWdleCwgJ1xcXFwkMScpXG4gICAgICAgICAgLnJlcGxhY2UoL1xcfC9nLCAnJiMxMjQ7JylcbiAgICAgICAgICAucmVwbGFjZSgvXFxzKy8sICcnKVxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIGdlbmVyYXRlU3VtbWFyeVRhYmxlRm9yQ29tbWFuZFNwZWNzIChzcGVjcywge2hlYWRlcn0gPSB7fSkge1xuICAgIGNvbnN0IGdyb3VwZWQgPSB7fVxuICAgIGZvciAoY29uc3Qgc3BlYyBvZiBzcGVjcykge1xuICAgICAgaWYgKCFncm91cGVkW3NwZWMua2luZF0pIGdyb3VwZWRbc3BlYy5raW5kXSA9IFtdXG5cbiAgICAgIGdyb3VwZWRbc3BlYy5raW5kXS5wdXNoKHNwZWMpXG4gICAgfVxuXG4gICAgbGV0IHJlc3VsdCA9ICcnXG4gICAgY29uc3QgT1BFUkFUSU9OX0tJTkRTID0gWydvcGVyYXRvcicsICdtb3Rpb24nLCAndGV4dC1vYmplY3QnLCAnbWlzYy1jb21tYW5kJ11cblxuICAgIGZvciAobGV0IGtpbmQgb2YgT1BFUkFUSU9OX0tJTkRTKSB7XG4gICAgICBjb25zdCBzcGVjcyA9IGdyb3VwZWRba2luZF1cbiAgICAgIGlmICghc3BlY3MpIGNvbnRpbnVlXG5cbiAgICAgIC8vIHByZXR0aWVyLWlnbm9yZVxuICAgICAgY29uc3QgdGFibGUgPSBbXG4gICAgICAgICd8IEtleW1hcCB8IENvbW1hbmQgfCBEZXNjcmlwdGlvbiB8JyxcbiAgICAgICAgJ3w6LS0tLS0tLXw6LS0tLS0tLS18Oi0tLS0tLS0tLS0tLXwnXG4gICAgICBdXG5cbiAgICAgIGZvciAobGV0IHtrZXltYXAgPSAnJywgY29tbWFuZE5hbWUsIGRlc2NyaXB0aW9uID0gJyd9IG9mIHNwZWNzKSB7XG4gICAgICAgIGNvbW1hbmROYW1lID0gY29tbWFuZE5hbWUucmVwbGFjZSgvdmltLW1vZGUtcGx1czovLCAnJylcbiAgICAgICAgdGFibGUucHVzaChgfCAke2tleW1hcH0gfCBcXGAke2NvbW1hbmROYW1lfVxcYCB8ICR7ZGVzY3JpcHRpb259IHxgKVxuICAgICAgfVxuICAgICAgcmVzdWx0ICs9IGAjIyAke2tpbmR9XFxuXFxuYCArIHRhYmxlLmpvaW4oJ1xcbicpICsgJ1xcblxcbidcbiAgICB9XG5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCkudGhlbihlZGl0b3IgPT4ge1xuICAgICAgaWYgKGhlYWRlcikgZWRpdG9yLmluc2VydFRleHQoaGVhZGVyICsgJ1xcblxcbicpXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dChyZXN1bHQpXG4gICAgfSlcbiAgfVxuXG4gIGdlbmVyYXRlQ29tbWFuZFN1bW1hcnlUYWJsZSAoKSB7XG4gICAgY29uc3Qge3JlbW92ZUluZGVudH0gPSByZXF1aXJlKCcuL3V0aWxzJylcbiAgICBjb25zdCBoZWFkZXIgPSByZW1vdmVJbmRlbnQoYFxuICAgICAgIyMgS2V5bWFwIHNlbGVjdG9yIGFiYnJldmlhdGlvbnNcblxuICAgICAgSW4gdGhpcyBkb2N1bWVudCwgZm9sbG93aW5nIGFiYnJldmlhdGlvbnMgYXJlIHVzZWQgZm9yIHNob3J0bmVzcy5cblxuICAgICAgfCBBYmJyZXYgfCBTZWxlY3RvciAgICAgICAgICAgICAgICAgICAgIHwgRGVzY3JpcHRpb24gICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgICAgfDotLS0tLS0tfDotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXw6LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfFxuICAgICAgfCBcXGAhaVxcYCAgIHwgXFxgOm5vdCguaW5zZXJ0LW1vZGUpXFxgICAgICAgICAgfCBleGNlcHQgaW5zZXJ0LW1vZGUgICAgICAgICAgICAgICAgICB8XG4gICAgICB8IFxcYGlcXGAgICAgfCBcXGAuaW5zZXJ0LW1vZGVcXGAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAgIHwgXFxgb1xcYCAgICB8IFxcYC5vcGVyYXRvci1wZW5kaW5nLW1vZGVcXGAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgICAgfCBcXGBuXFxgICAgIHwgXFxgLm5vcm1hbC1tb2RlXFxgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgICB8IFxcYHZcXGAgICAgfCBcXGAudmlzdWFsLW1vZGVcXGAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAgIHwgXFxgdkJcXGAgICB8IFxcYC52aXN1YWwtbW9kZS5ibG9ja3dpc2VcXGAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgICAgfCBcXGB2TFxcYCAgIHwgXFxgLnZpc3VhbC1tb2RlLmxpbmV3aXNlXFxgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgICB8IFxcYHZDXFxgICAgfCBcXGAudmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZVxcYCB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAgIHwgXFxgaVJcXGAgICB8IFxcYC5pbnNlcnQtbW9kZS5yZXBsYWNlXFxgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgICAgfCBcXGAjXFxgICAgIHwgXFxgLndpdGgtY291bnRcXGAgICAgICAgICAgICAgICAgfCB3aGVuIGNvdW50IGlzIHNwZWNpZmllZCAgICAgICAgICAgICB8XG4gICAgICB8IFxcYCVcXGAgICAgfCBcXGAuaGFzLXBlcnNpc3RlbnQtc2VsZWN0aW9uXFxgICB8IHdoZW4gcGVyc2lzdGVudC1zZWxlY3Rpb24gaXMgZXhpc3RzIHxcbiAgICAgIGApXG5cbiAgICB0aGlzLmdlbmVyYXRlU3VtbWFyeVRhYmxlRm9yQ29tbWFuZFNwZWNzKHRoaXMuZ2V0Q29tbWFuZFNwZWNzKCksIHtoZWFkZXJ9KVxuICB9XG5cbiAgb3BlbkluVmltICgpIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBjb25zdCB7cm93LCBjb2x1bW59ID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAvLyBlLmcuIC9BcHBsaWNhdGlvbnMvTWFjVmltLmFwcC9Db250ZW50cy9NYWNPUy9WaW0gLWcgL2V0Yy9ob3N0cyBcIitjYWxsIGN1cnNvcig0LCAzKVwiXG4gICAgcmV0dXJuIG5ldyBCdWZmZXJlZFByb2Nlc3Moe1xuICAgICAgY29tbWFuZDogJy9BcHBsaWNhdGlvbnMvTWFjVmltLmFwcC9Db250ZW50cy9NYWNPUy9WaW0nLFxuICAgICAgYXJnczogWyctZycsIGVkaXRvci5nZXRQYXRoKCksIGArY2FsbCBjdXJzb3IoJHtyb3cgKyAxfSwgJHtjb2x1bW4gKyAxfSlgXVxuICAgIH0pXG4gIH1cblxuICBidWlsZENvbW1hbmRUYWJsZUFuZEZpbGVUYWJsZSAoKSB7XG4gICAgY29uc3QgZmlsZVRhYmxlID0ge31cbiAgICBjb25zdCBjb21tYW5kVGFibGUgPSBbXVxuICAgIGNvbnN0IHNlZW4gPSB7fSAvLyBKdXN0IHRvIGRldGVjdCBkdXBsaWNhdGUgbmFtZVxuXG4gICAgZm9yIChjb25zdCBmaWxlIG9mIFZNUE9wZXJhdGlvbkZpbGVzKSB7XG4gICAgICBmaWxlVGFibGVbZmlsZV0gPSBbXVxuXG4gICAgICBmb3IgKGNvbnN0IGtsYXNzIG9mIE9iamVjdC52YWx1ZXMocmVxdWlyZShmaWxlKSkpIHtcbiAgICAgICAgaWYgKHNlZW5ba2xhc3MubmFtZV0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYER1cGxpY2F0ZSBjbGFzcyAke2tsYXNzLm5hbWV9IGluIFwiJHtmaWxlfVwiIGFuZCBcIiR7c2VlbltrbGFzcy5uYW1lXX1cImApXG4gICAgICAgIH1cbiAgICAgICAgc2VlbltrbGFzcy5uYW1lXSA9IGZpbGVcbiAgICAgICAgZmlsZVRhYmxlW2ZpbGVdLnB1c2goa2xhc3MubmFtZSlcbiAgICAgICAgaWYgKGtsYXNzLmlzQ29tbWFuZCgpKSBjb21tYW5kVGFibGUucHVzaChrbGFzcy5nZXRDb21tYW5kTmFtZSgpKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge2NvbW1hbmRUYWJsZSwgZmlsZVRhYmxlfVxuICB9XG5cbiAgLy8gIyBIb3cgdm1wIGNvbW1hbmRzIGJlY29tZSBhdmFpbGFibGU/XG4gIC8vICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFZtcCBoYXZlIG1hbnkgY29tbWFuZHMsIGxvYWRpbmcgZnVsbCBjb21tYW5kcyBhdCBzdGFydHVwIHNsb3cgZG93biBwa2cgYWN0aXZhdGlvbi5cbiAgLy8gU28gdm1wIGxvYWQgc3VtbWFyeSBjb21tYW5kIHRhYmxlIGF0IHN0YXJ0dXAgdGhlbiBsYXp5IHJlcXVpcmUgY29tbWFuZCBib2R5IG9uLXVzZSB0aW1pbmcuXG4gIC8vIEhlcmUgaXMgaG93IHZtcCBjb21tYW5kcyBhcmUgcmVnaXN0ZXJkIGFuZCBpbnZva2VkLlxuICAvLyBJbml0aWFsbHkgaW50cm9kdWNlZCBpbiBQUiAjNzU4XG4gIC8vXG4gIC8vIDEuIFtPbiBkZXZdOiBQcmVwYXJhdGlvbiBkb25lIGJ5IGRldmVsb3BlclxuICAvLyAgIC0gSW52b2tpbmcgYFZpbSBNb2RlIFBsdXM6V3JpdGUgQ29tbWFuZCBUYWJsZSBBbmQgRmlsZSBUYWJsZSBUbyBEaXNrYC4gaXQgZG9lcyBmb2xsb3dpbmcuXG4gIC8vICAgLSBcIi4vanNvbi9jb21tYW5kLXRhYmxlLmpzb25cIiBhbmQgXCIuL2pzb24vZmlsZS10YWJsZS5qc29uXCIuIGFyZSB1cGRhdGVkLlxuICAvL1xuICAvLyAyLiBbT24gYXRvbS92bXAgc3RhcnR1cF1cbiAgLy8gICAtIFJlZ2lzdGVyIGNvbW1hbmRzKGUuZy4gYG1vdmUtZG93bmApIGZyb20gXCIuL2pzb24vY29tbWFuZC10YWJsZS5qc29uXCIuXG4gIC8vXG4gIC8vIDMuIFtPbiBydW4gdGltZV06IGUuZy4gSW52b2tlIGBtb3ZlLWRvd25gIGJ5IGBqYCBrZXlzdHJva2VcbiAgLy8gICAtIEZpcmUgYG1vdmUtZG93bmAgY29tbWFuZC5cbiAgLy8gICAtIEl0IGV4ZWN1dGUgYHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihcIk1vdmVEb3duXCIpYFxuICAvLyAgIC0gRGV0ZXJtaW5lIGZpbGVzIHRvIHJlcXVpcmUgZnJvbSBcIi4vanNvbi9maWxlLXRhYmxlLmpzb25cIi5cbiAgLy8gICAtIExvYWQgYE1vdmVEb3duYCBjbGFzcyBieSByZXF1aXJlKCcuL21vdGlvbnMnKSBhbmQgcnVuIGl0IVxuICAvL1xuICBhc3luYyB3cml0ZUNvbW1hbmRUYWJsZUFuZEZpbGVUYWJsZVRvRGlzayAoKSB7XG4gICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcy1wbHVzJylcbiAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbiAgICBjb25zdCB7Y29tbWFuZFRhYmxlLCBmaWxlVGFibGV9ID0gdGhpcy5idWlsZENvbW1hbmRUYWJsZUFuZEZpbGVUYWJsZSgpXG5cbiAgICBjb25zdCBnZXRTdGF0ZUZvciA9IChiYXNlTmFtZSwgb2JqZWN0LCBwcmV0dHkpID0+IHtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ2pzb24nLCBiYXNlTmFtZSkgKyAocHJldHR5ID8gJy1wcmV0dHkuanNvbicgOiAnLmpzb24nKVxuICAgICAgY29uc3QganNvblN0cmluZyA9IHByZXR0eSA/IEpTT04uc3RyaW5naWZ5KG9iamVjdCwgbnVsbCwgJyAgJykgOiBKU09OLnN0cmluZ2lmeShvYmplY3QpXG4gICAgICBjb25zdCBuZWVkVXBkYXRlID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmOCcpLnRyaW1SaWdodCgpICE9PSBqc29uU3RyaW5nXG4gICAgICByZXR1cm4ge2ZpbGVQYXRoLCBqc29uU3RyaW5nLCBuZWVkVXBkYXRlfVxuICAgIH1cblxuICAgIGNvbnN0IHN0YXRlc05lZWRVcGRhdGUgPSBbXG4gICAgICBnZXRTdGF0ZUZvcignY29tbWFuZC10YWJsZScsIGNvbW1hbmRUYWJsZSwgZmFsc2UpLFxuICAgICAgZ2V0U3RhdGVGb3IoJ2NvbW1hbmQtdGFibGUnLCBjb21tYW5kVGFibGUsIHRydWUpLFxuICAgICAgZ2V0U3RhdGVGb3IoJ2ZpbGUtdGFibGUnLCBmaWxlVGFibGUsIGZhbHNlKSxcbiAgICAgIGdldFN0YXRlRm9yKCdmaWxlLXRhYmxlJywgZmlsZVRhYmxlLCB0cnVlKVxuICAgIF0uZmlsdGVyKHN0YXRlID0+IHN0YXRlLm5lZWRVcGRhdGUpXG5cbiAgICBpZiAoIXN0YXRlc05lZWRVcGRhdGUubGVuZ3RoKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnTm8gY2hhbmdmZXMgaW4gY29tbWFuZFRhYmxlIGFuZCBmaWxlVGFibGUnLCB7ZGlzbWlzc2FibGU6IHRydWV9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgZm9yIChjb25zdCB7anNvblN0cmluZywgZmlsZVBhdGh9IG9mIHN0YXRlc05lZWRVcGRhdGUpIHtcbiAgICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgsIHthY3RpdmF0ZVBhbmU6IGZhbHNlLCBhY3RpdmF0ZUl0ZW06IGZhbHNlfSkudGhlbihlZGl0b3IgPT4ge1xuICAgICAgICBlZGl0b3Iuc2V0VGV4dChqc29uU3RyaW5nKVxuICAgICAgICByZXR1cm4gZWRpdG9yLnNhdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhgVXBkYXRlZCAke3BhdGguYmFzZW5hbWUoZmlsZVBhdGgpfWAsIHtkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBEZXZlbG9wZXIoKVxuIl19