(function() {
  var CompositeDisposable, Emitter, VimModeline, _, iconv, ref;

  _ = require('underscore-plus');

  iconv = require('iconv-lite');

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  module.exports = VimModeline = {
    subscriptions: null,
    emitter: null,
    modelinePattern: null,
    shortOptions: {
      fenc: "fileencoding",
      ff: "fileformat",
      ft: "filetype",
      et: "expandtab",
      ts: "tabstop",
      sts: "softtabstop",
      sw: "shiftwidth",
      noet: "noexpandtab"
    },
    alternativeOptions: {
      useSoftTabs: "expandtab",
      tabLength: "tabstop",
      encoding: "fileencoding",
      lineEnding: "fileformat",
      grammar: "filetype",
      syntax: "filetype"
    },
    pairOptions: [
      {
        on: "expandtab",
        off: "noexpandtab"
      }, {
        on: "spell",
        off: "nospell"
      }
    ],
    lineEnding: {
      unix: "\n",
      dos: "\r\n",
      mac: "\r"
    },
    alternativeValue: {
      lf: "unix",
      crlf: "dos",
      cr: "mac"
    },
    fileTypeMapper: require('./vim-modeline-filetype'),
    activate: function(state) {
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.config.onDidChange('vim-modeline.prefix', (function(_this) {
        return function() {
          return _this.updateModelinePattern();
        };
      })(this)));
      this.updateModelinePattern();
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'vim-modeline:detect': (function(_this) {
          return function() {
            return _this.detectAndApplyModelineSetting(null, true);
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'vim-modeline:insert-modeline': (function(_this) {
          return function() {
            return _this.insertModeLine();
          };
        })(this)
      }));
      this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.detectAndApplyModelineSetting(editor, false);
        };
      })(this)));
      return this.subscriptions.add(this.onDidSetEncoding((function(_this) {
        return function(arg) {
          var encoding, pkg;
          encoding = arg.encoding;
          pkg = atom.packages.getActivePackage('auto-encoding');
          if (((pkg != null ? pkg.mainModule.subscriptions : void 0) != null) && !_this.commandDispatched) {
            return atom.notifications.addWarning("WARNING: auto-encoding package is enabled. In this case, file encoding doesn't match the modeline. If you want use vim-modeline parse result, please invoke 'vim-modeline:detect' command or select encoding '" + encoding + "'.", {
              dismissable: true
            });
          }
        };
      })(this)));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    onDidParse: function(callback) {
      return this.emitter.on('did-parse', callback);
    },
    onDidSetLineEnding: function(callback) {
      return this.emitter.on('did-set-line-ending', callback);
    },
    onDidSetFileType: function(callback) {
      return this.emitter.on('did-set-file-type', callback);
    },
    onDidSetEncoding: function(callback) {
      return this.emitter.on('did-set-encoding', callback);
    },
    onDidSetSoftTabs: function(callback) {
      return this.emitter.on('did-set-softtabs', callback);
    },
    onDidSetTabLength: function(callback) {
      return this.emitter.on('did-set-tab-length', callback);
    },
    provideVimModelineEventHandlerV1: function() {
      return {
        onDidParse: this.onDidParse.bind(this),
        onDidSetLineEnding: this.onDidSetLineEnding.bind(this),
        onDidSetFileType: this.onDidSetFileType.bind(this),
        onDidSetEncoding: this.onDidSetEncoding.bind(this),
        onDidSetSoftTabs: this.onDidSetSoftTabs.bind(this),
        onDidSetTabLength: this.onDidSetTabLength.bind(this)
      };
    },
    detectAndApplyModelineSetting: function(editor, commandDispatched) {
      var options;
      if (editor == null) {
        editor = null;
      }
      this.commandDispatched = commandDispatched != null ? commandDispatched : false;
      if (editor === null) {
        editor = atom.workspace.getActiveTextEditor();
      }
      if (!editor) {
        return;
      }
      options = this.detectVimModeLine(editor);
      this.emitter.emit('did-parse', {
        editor: editor,
        options: options
      });
      if (options) {
        this.setLineEnding(editor, this.lineEnding[options.fileformat]);
        this.setFileType(editor, options.filetype);
        this.setEncoding(editor, options.fileencoding);
        this.setIndent(editor, options);
        if (atom.packages.isPackageActive('spell-check')) {
          return this.setSpellCheck(editor, options);
        } else {
          return atom.packages.onDidActivatePackage((function(_this) {
            return function(pkg) {
              if (pkg.name === 'spell-check') {
                return _this.setSpellCheck(editor, options);
              }
            };
          })(this));
        }
      }
    },
    detectVimModeLine: function(editor) {
      var error, i, j, l, len, lineNum, m, max, n, options, opts, ref1, ref2, ref3, results, results1, results2;
      options = false;
      max = atom.config.get("vim-modeline.readLineNum") - 1;
      try {
        if (editor.getLastBufferRow() > max) {
          lineNum = _.uniq((function() {
            results1 = [];
            for (var l = 0; 0 <= max ? l <= max : l >= max; 0 <= max ? l++ : l--){ results1.push(l); }
            return results1;
          }).apply(this).concat((function() {
            results = [];
            for (var j = ref1 = editor.getLastBufferRow() - max, ref2 = editor.getLastBufferRow(); ref1 <= ref2 ? j <= ref2 : j >= ref2; ref1 <= ref2 ? j++ : j--){ results.push(j); }
            return results;
          }).apply(this)));
        } else {
          lineNum = (function() {
            results2 = [];
            for (var m = 0, ref3 = editor.getLastBufferRow(); 0 <= ref3 ? m <= ref3 : m >= ref3; 0 <= ref3 ? m++ : m--){ results2.push(m); }
            return results2;
          }).apply(this);
        }
        for (n = 0, len = lineNum.length; n < len; n++) {
          i = lineNum[n];
          opts = this.parseVimModeLine(editor.lineTextForBufferRow(i));
          if (opts) {
            options = _.extend({}, options || {}, opts);
          }
        }
      } catch (error1) {
        error = error1;
        console.error(error);
      }
      return options;
    },
    updateModelinePattern: function() {
      var prefix;
      prefix = atom.config.get('vim-modeline.prefix').join("|");
      return this.modelinePattern = new RegExp("(" + prefix + ")([<=>]?\\d+)*:\\s*(set*)*\\s+([^:]+)*\\s*:?");
    },
    parseVimModeLine: function(line) {
      var j, key, l, len, len1, matches, option, options, pair, ref1, ref2, ref3, value;
      matches = line.match(this.modelinePattern);
      options = null;
      if ((matches != null ? matches[4] : void 0) != null) {
        options = {};
        ref1 = matches[4].split(" ");
        for (j = 0, len = ref1.length; j < len; j++) {
          option = ref1[j];
          ref2 = option.split("="), key = ref2[0], value = ref2[1];
          if (this.shortOptions[key] !== void 0) {
            key = this.shortOptions[key];
          }
          if (this.alternativeOptions[key] !== void 0) {
            key = this.alternativeOptions[key];
          }
          if (this.alternativeValue[value] !== void 0) {
            value = this.alternativeValue[value];
          }
          ref3 = this.pairOptions;
          for (l = 0, len1 = ref3.length; l < len1; l++) {
            pair = ref3[l];
            if (key === pair.off && options[pair.on]) {
              delete options[pair.on];
            }
          }
          if (key !== "") {
            options[key] = value != null ? value : true;
          }
        }
      }
      return options;
    },
    setEncoding: function(editor, encoding) {
      if (!iconv.encodingExists(encoding)) {
        return false;
      }
      encoding = encoding.toLowerCase().replace(/[^0-9a-z]|:\d{4}$/g, '');
      if (editor != null) {
        editor.setEncoding(encoding);
      }
      return this.emitter.emit('did-set-encoding', {
        editor: editor,
        encoding: encoding
      }, this);
    },
    setLineEnding: function(editor, lineEnding) {
      var buffer;
      if (!lineEnding) {
        return;
      }
      buffer = editor != null ? editor.getBuffer() : void 0;
      if (!buffer) {
        return;
      }
      buffer.setPreferredLineEnding(lineEnding);
      buffer.setText(buffer.getText().replace(/\r\n|\r|\n/g, lineEnding));
      return this.emitter.emit('did-set-line-ending', {
        editor: editor,
        lineEnding: lineEnding
      }, this);
    },
    setFileType: function(editor, type) {
      var grammar;
      grammar = this.matchFileType(editor, type);
      if (grammar !== atom.grammars.nullGrammar) {
        atom.textEditors.setGrammarOverride(editor, grammar.scopeName);
        if (editor != null) {
          editor.setGrammar(grammar);
        }
        return this.emitter.emit('did-set-file-type', {
          editor: editor,
          grammar: grammar
        }, this);
      }
    },
    matchFileType: function(editor, type) {
      var content, detect, grammar, mapper, ref1, scores;
      mapper = this.getFileTypeMapper(type);
      if (typeof mapper === "string") {
        grammar = atom.grammars.grammarForScopeName(mapper);
      } else if (typeof mapper === "object" && mapper.length > 0) {
        content = editor != null ? (ref1 = editor.getBuffer()) != null ? ref1.getText() : void 0 : void 0;
        scores = mapper.map(function(scopeName) {
          var g;
          g = atom.grammars.grammarForScopeName(scopeName) || atom.grammars.nullGrammar;
          return {
            scopeName: scopeName,
            score: atom.grammars.getGrammarScore(g, editor.getPath(), content)
          };
        });
        detect = _.max(scores, function(score) {
          return score.score;
        });
        grammar = atom.grammars.grammarForScopeName(detect.scopeName);
      } else {
        grammar = atom.grammars.selectGrammar(type);
      }
      return grammar || atom.grammars.nullGrammar;
    },
    getFileTypeMapper: function(type) {
      var extra, ft, j, len, mapper, ref1;
      mapper = this.fileTypeMapper[type] || [];
      extra = atom.config.get("vim-modeline-filetypes") || {};
      if (typeof extra[type] === "string") {
        mapper = extra[type];
      } else if (typeof extra[type] === "object") {
        ref1 = extra[type];
        for (j = 0, len = ref1.length; j < len; j++) {
          ft = ref1[j];
          mapper.push(ft);
        }
      }
      return mapper;
    },
    setIndent: function(editor, options) {
      var softtab, tabstop;
      softtab = void 0;
      if (options.expandtab) {
        softtab = true;
      }
      if (options.noexpandtab) {
        softtab = false;
      }
      if (softtab !== void 0) {
        if (editor != null) {
          editor.setSoftTabs(softtab);
        }
        this.emitter.emit('did-set-softtabs', {
          editor: editor,
          softtab: softtab
        }, this);
      }
      if (options.tabstop) {
        tabstop = parseInt(options.tabstop, 10);
        if (editor != null) {
          editor.setTabLength(tabstop);
        }
        return this.emitter.emit('did-set-tab-length', {
          editor: editor,
          tabstop: tabstop
        }, this);
      }
    },
    setSpellCheck: function(editor, options) {
      var enabled, pkg, view;
      enabled = void 0;
      if (options.spell) {
        enabled = true;
      }
      if (options.nospell) {
        enabled = false;
      }
      if (enabled !== void 0) {
        pkg = atom.packages.getActivePackage("spell-check");
        view = pkg.mainModule.viewsByEditor.get(editor);
        if ((view.buffer !== null && enabled === false) || (view.buffer === null && enabled === true)) {
          return atom.commands.dispatch(document.querySelector('atom-workspace'), "spell-check:toggle");
        }
      }
    },
    insertModeLine: function() {
      var comment, currentPosition, editor, modeline, modelineRange, options, scope;
      editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        return;
      }
      options = this.getCurrentOptions(editor);
      modelineRange = [this.getInsertModelineRow(editor), 0];
      scope = editor.scopeDescriptorForBufferPosition(modelineRange);
      comment = atom.config.get("editor.commentStart", {
        scope: scope
      });
      if (comment) {
        modeline = "" + comment + (this.makeModeline(options));
        currentPosition = editor.getCursorBufferPosition();
        editor.setCursorBufferPosition(modelineRange);
        if (atom.config.get("vim-modeline.insertModelinePosition") === "first row" || atom.config.get("vim-modeline.insertModelinePosition") === "above cursor row") {
          editor.insertNewlineAbove();
        } else {
          editor.insertNewlineBelow();
        }
        editor.insertText(modeline);
        return editor.setCursorBufferPosition(currentPosition);
      } else {
        return console.error("'editor.commentStart' is undefined in this scope.");
      }
    },
    getCurrentOptions: function(editor) {
      var j, key, keys, len, options, property, ref1, scopeName;
      if (!editor) {
        editor = atom.workspace.getActiveTextEditor();
      }
      scopeName = (ref1 = editor.getGrammar()) != null ? ref1.scopeName.split(".") : void 0;
      keys = (function() {
        switch (atom.config.get("vim-modeline.insertModelineType")) {
          case "short":
            return ["fenc", "ff", "ft", "ts", "et"];
          case "long":
            return ["fileencoding", "fileformat", "filetype", "tabstop", "expandtab"];
          case "original":
            return ["encoding", "lineEnding", "grammar", "tabLength", "useSoftTabs"];
        }
      })();
      options = {};
      for (j = 0, len = keys.length; j < len; j++) {
        key = keys[j];
        property = key;
        if (this.shortOptions[key] !== void 0) {
          key = this.shortOptions[key];
        }
        if (this.alternativeOptions[key] !== void 0) {
          key = this.alternativeOptions[key];
        }
        options[property] = (function() {
          switch (key) {
            case "fileencoding":
              return editor.getEncoding();
            case "fileformat":
              return this.detectLineEnding(editor);
            case "filetype":
              return scopeName[scopeName.length - 1];
            case "tabstop":
              return editor.getTabLength();
            case "expandtab":
              return editor.getSoftTabs();
          }
        }).call(this);
      }
      return options;
    },
    makeModeline: function(options) {
      var prefix, settings;
      prefix = settings = _.map(options, function(v, k) {
        if (typeof v === "boolean") {
          return "" + (v ? "" : "no") + k;
        } else {
          return k + "=" + v;
        }
      }).join(" ");
      return (atom.config.get("vim-modeline.insertPrefix")) + ":set " + settings + ":";
    },
    getInsertModelineRow: function(editor) {
      if (!editor) {
        editor = atom.workspace.getActiveTextEditor();
      }
      switch (atom.config.get("vim-modeline.insertModelinePosition")) {
        case "first row":
          return 0;
        case "last row":
          return editor.getLastBufferRow();
        case "above cursor row":
          return editor.getCursorBufferPosition().row;
        case "below cursor row":
          return editor.getCursorBufferPosition().row;
      }
    },
    detectLineEnding: function(editor) {
      var buffer, key, lineEnding, ref1, val;
      if (!editor) {
        editor = atom.workspace.getActiveTextEditor();
      }
      buffer = editor != null ? editor.getBuffer() : void 0;
      if (!editor) {
        return;
      }
      lineEnding = buffer.lineEndingForRow(buffer.getLastRow() - 1);
      ref1 = this.lineEnding;
      for (key in ref1) {
        val = ref1[key];
        if (val === lineEnding) {
          return key;
        }
      }
      return void 0;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveGNmLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlbGluZS9saWIvdmltLW1vZGVsaW5lLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixLQUFBLEdBQVEsT0FBQSxDQUFRLFlBQVI7O0VBRVIsTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxxQkFBRCxFQUFVOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFdBQUEsR0FDZjtJQUFBLGFBQUEsRUFBZSxJQUFmO0lBQ0EsT0FBQSxFQUFTLElBRFQ7SUFFQSxlQUFBLEVBQWlCLElBRmpCO0lBR0EsWUFBQSxFQUFjO01BQ1osSUFBQSxFQUFNLGNBRE07TUFFWixFQUFBLEVBQU0sWUFGTTtNQUdaLEVBQUEsRUFBTSxVQUhNO01BSVosRUFBQSxFQUFNLFdBSk07TUFLWixFQUFBLEVBQU0sU0FMTTtNQU1aLEdBQUEsRUFBTSxhQU5NO01BT1osRUFBQSxFQUFNLFlBUE07TUFRWixJQUFBLEVBQU0sYUFSTTtLQUhkO0lBYUEsa0JBQUEsRUFBb0I7TUFDbEIsV0FBQSxFQUFhLFdBREs7TUFFbEIsU0FBQSxFQUFXLFNBRk87TUFHbEIsUUFBQSxFQUFVLGNBSFE7TUFJbEIsVUFBQSxFQUFZLFlBSk07TUFLbEIsT0FBQSxFQUFTLFVBTFM7TUFNbEIsTUFBQSxFQUFRLFVBTlU7S0FicEI7SUFxQkEsV0FBQSxFQUFhO01BQ1g7UUFBQyxFQUFBLEVBQUksV0FBTDtRQUFrQixHQUFBLEVBQUssYUFBdkI7T0FEVyxFQUVYO1FBQUMsRUFBQSxFQUFJLE9BQUw7UUFBYyxHQUFBLEVBQUssU0FBbkI7T0FGVztLQXJCYjtJQXlCQSxVQUFBLEVBQVk7TUFDVixJQUFBLEVBQU0sSUFESTtNQUVWLEdBQUEsRUFBTSxNQUZJO01BR1YsR0FBQSxFQUFNLElBSEk7S0F6Qlo7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O0FBQ2hCLFVBQUE7TUFBQSxJQUFBLENBQXFELE1BQXJEO1FBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxFQUFUOztNQUNBLE1BQUEsb0JBQVMsTUFBTSxDQUFFLFNBQVIsQ0FBQTtNQUNULElBQUEsQ0FBYyxNQUFkO0FBQUEsZUFBQTs7TUFFQSxVQUFBLEdBQWEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBQSxHQUFzQixDQUE5QztBQUNiO0FBQUEsV0FBQSxXQUFBOztRQUNFLElBQUcsR0FBQSxLQUFPLFVBQVY7QUFDRSxpQkFBTyxJQURUOztBQURGO0FBR0EsYUFBTztJQVRTLENBNVJsQjs7QUFORiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5pY29udiA9IHJlcXVpcmUgJ2ljb252LWxpdGUnXG5cbntFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID0gVmltTW9kZWxpbmUgPVxuICBzdWJzY3JpcHRpb25zOiBudWxsXG4gIGVtaXR0ZXI6IG51bGxcbiAgbW9kZWxpbmVQYXR0ZXJuOiBudWxsXG4gIHNob3J0T3B0aW9uczoge1xuICAgIGZlbmM6IFwiZmlsZWVuY29kaW5nXCJcbiAgICBmZjogICBcImZpbGVmb3JtYXRcIlxuICAgIGZ0OiAgIFwiZmlsZXR5cGVcIlxuICAgIGV0OiAgIFwiZXhwYW5kdGFiXCJcbiAgICB0czogICBcInRhYnN0b3BcIlxuICAgIHN0czogIFwic29mdHRhYnN0b3BcIlxuICAgIHN3OiAgIFwic2hpZnR3aWR0aFwiXG4gICAgbm9ldDogXCJub2V4cGFuZHRhYlwiXG4gIH1cbiAgYWx0ZXJuYXRpdmVPcHRpb25zOiB7XG4gICAgdXNlU29mdFRhYnM6IFwiZXhwYW5kdGFiXCJcbiAgICB0YWJMZW5ndGg6IFwidGFic3RvcFwiXG4gICAgZW5jb2Rpbmc6IFwiZmlsZWVuY29kaW5nXCJcbiAgICBsaW5lRW5kaW5nOiBcImZpbGVmb3JtYXRcIlxuICAgIGdyYW1tYXI6IFwiZmlsZXR5cGVcIlxuICAgIHN5bnRheDogXCJmaWxldHlwZVwiXG4gIH1cbiAgcGFpck9wdGlvbnM6IFtcbiAgICB7b246IFwiZXhwYW5kdGFiXCIsIG9mZjogXCJub2V4cGFuZHRhYlwifVxuICAgIHtvbjogXCJzcGVsbFwiLCBvZmY6IFwibm9zcGVsbFwifVxuICBdXG4gIGxpbmVFbmRpbmc6IHtcbiAgICB1bml4OiBcIlxcblwiXG4gICAgZG9zOiAgXCJcXHJcXG5cIlxuICAgIG1hYzogIFwiXFxyXCJcbiAgfVxuICBhbHRlcm5hdGl2ZVZhbHVlOiB7XG4gICAgbGY6IFwidW5peFwiXG4gICAgY3JsZjogXCJkb3NcIlxuICAgIGNyOiBcIm1hY1wiXG4gIH1cbiAgZmlsZVR5cGVNYXBwZXI6IHJlcXVpcmUgJy4vdmltLW1vZGVsaW5lLWZpbGV0eXBlJ1xuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAgIyBFdmVudHMgc3Vic2NyaWJlZCB0byBpbiBhdG9tJ3Mgc3lzdGVtIGNhbiBiZSBlYXNpbHkgY2xlYW5lZCB1cCB3aXRoIGEgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAndmltLW1vZGVsaW5lLnByZWZpeCcsID0+IEB1cGRhdGVNb2RlbGluZVBhdHRlcm4oKVxuICAgIEB1cGRhdGVNb2RlbGluZVBhdHRlcm4oKVxuXG4gICAgIyBSZWdpc3RlciBjb21tYW5kIHRoYXQgdG9nZ2xlcyB0aGlzIHZpZXdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLCAndmltLW1vZGVsaW5lOmRldGVjdCc6ID0+IEBkZXRlY3RBbmRBcHBseU1vZGVsaW5lU2V0dGluZyhudWxsLCB0cnVlKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsICd2aW0tbW9kZWxpbmU6aW5zZXJ0LW1vZGVsaW5lJzogPT4gQGluc2VydE1vZGVMaW5lKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT4gQGRldGVjdEFuZEFwcGx5TW9kZWxpbmVTZXR0aW5nKGVkaXRvciwgZmFsc2UpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG9uRGlkU2V0RW5jb2RpbmcgKHtlbmNvZGluZ30pID0+XG4gICAgICBwa2cgPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UgJ2F1dG8tZW5jb2RpbmcnXG4gICAgICBpZiBwa2c/Lm1haW5Nb2R1bGUuc3Vic2NyaXB0aW9ucz8gYW5kIG5vdCBAY29tbWFuZERpc3BhdGNoZWRcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgXCJXQVJOSU5HOiBhdXRvLWVuY29kaW5nIHBhY2thZ2UgaXMgZW5hYmxlZC4gSW4gdGhpcyBjYXNlLCBmaWxlIGVuY29kaW5nIGRvZXNuJ3QgbWF0Y2ggdGhlIG1vZGVsaW5lLiBJZiB5b3Ugd2FudCB1c2UgdmltLW1vZGVsaW5lIHBhcnNlIHJlc3VsdCwgcGxlYXNlIGludm9rZSAndmltLW1vZGVsaW5lOmRldGVjdCcgY29tbWFuZCBvciBzZWxlY3QgZW5jb2RpbmcgJyN7ZW5jb2Rpbmd9Jy5cIiwgZGlzbWlzc2FibGU6IHRydWVcblxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgb25EaWRQYXJzZTogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtcGFyc2UnLCBjYWxsYmFja1xuXG4gIG9uRGlkU2V0TGluZUVuZGluZzogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtc2V0LWxpbmUtZW5kaW5nJywgY2FsbGJhY2tcblxuICBvbkRpZFNldEZpbGVUeXBlOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1zZXQtZmlsZS10eXBlJywgY2FsbGJhY2tcblxuICBvbkRpZFNldEVuY29kaW5nOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1zZXQtZW5jb2RpbmcnLCBjYWxsYmFja1xuXG4gIG9uRGlkU2V0U29mdFRhYnM6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLXNldC1zb2Z0dGFicycsIGNhbGxiYWNrXG5cbiAgb25EaWRTZXRUYWJMZW5ndGg6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLXNldC10YWItbGVuZ3RoJywgY2FsbGJhY2tcblxuICBwcm92aWRlVmltTW9kZWxpbmVFdmVudEhhbmRsZXJWMTogLT5cbiAgICBvbkRpZFBhcnNlOiBAb25EaWRQYXJzZS5iaW5kKEApXG4gICAgb25EaWRTZXRMaW5lRW5kaW5nOiBAb25EaWRTZXRMaW5lRW5kaW5nLmJpbmQoQClcbiAgICBvbkRpZFNldEZpbGVUeXBlOiBAb25EaWRTZXRGaWxlVHlwZS5iaW5kKEApXG4gICAgb25EaWRTZXRFbmNvZGluZzogQG9uRGlkU2V0RW5jb2RpbmcuYmluZChAKVxuICAgIG9uRGlkU2V0U29mdFRhYnM6IEBvbkRpZFNldFNvZnRUYWJzLmJpbmQoQClcbiAgICBvbkRpZFNldFRhYkxlbmd0aDogQG9uRGlkU2V0VGFiTGVuZ3RoLmJpbmQoQClcblxuICBkZXRlY3RBbmRBcHBseU1vZGVsaW5lU2V0dGluZzogKGVkaXRvciA9IG51bGwsIEBjb21tYW5kRGlzcGF0Y2hlZCA9IGZhbHNlKSAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSBpZiBlZGl0b3IgaXMgbnVsbFxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yXG5cbiAgICBvcHRpb25zID0gQGRldGVjdFZpbU1vZGVMaW5lIGVkaXRvclxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1wYXJzZScsIHtlZGl0b3IsIG9wdGlvbnN9XG5cbiAgICBpZiBvcHRpb25zXG4gICAgICBAc2V0TGluZUVuZGluZyBlZGl0b3IsIEBsaW5lRW5kaW5nW29wdGlvbnMuZmlsZWZvcm1hdF1cbiAgICAgIEBzZXRGaWxlVHlwZSBlZGl0b3IsIG9wdGlvbnMuZmlsZXR5cGVcbiAgICAgIEBzZXRFbmNvZGluZyBlZGl0b3IsIG9wdGlvbnMuZmlsZWVuY29kaW5nXG4gICAgICBAc2V0SW5kZW50IGVkaXRvciwgb3B0aW9uc1xuICAgICAgaWYgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VBY3RpdmUgJ3NwZWxsLWNoZWNrJ1xuICAgICAgICBAc2V0U3BlbGxDaGVjayBlZGl0b3IsIG9wdGlvbnNcbiAgICAgIGVsc2VcbiAgICAgICAgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSAocGtnKSA9PlxuICAgICAgICAgIGlmIHBrZy5uYW1lIGlzICdzcGVsbC1jaGVjaydcbiAgICAgICAgICAgIEBzZXRTcGVsbENoZWNrIGVkaXRvciwgb3B0aW9uc1xuXG4gIGRldGVjdFZpbU1vZGVMaW5lOiAoZWRpdG9yKSAtPlxuICAgIG9wdGlvbnMgPSBmYWxzZVxuICAgIG1heCA9IGF0b20uY29uZmlnLmdldChcInZpbS1tb2RlbGluZS5yZWFkTGluZU51bVwiKSAtIDFcbiAgICB0cnlcbiAgICAgIGlmIGVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCkgPiBtYXhcbiAgICAgICAgbGluZU51bSA9IF8udW5pcShbMC4ubWF4XS5jb25jYXQgWyhlZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpIC0gbWF4KS4uZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKV0pXG4gICAgICBlbHNlXG4gICAgICAgIGxpbmVOdW0gPSBbMC4uZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKV1cbiAgICAgIGZvciBpIGluIGxpbmVOdW1cbiAgICAgICAgb3B0cyA9IEBwYXJzZVZpbU1vZGVMaW5lIGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhpKVxuICAgICAgICBvcHRpb25zID0gXy5leHRlbmQge30sIG9wdGlvbnMgfHwge30sIG9wdHMgaWYgb3B0c1xuICAgIGNhdGNoIGVycm9yXG4gICAgICBjb25zb2xlLmVycm9yIGVycm9yXG4gICAgb3B0aW9uc1xuXG4gIHVwZGF0ZU1vZGVsaW5lUGF0dGVybjogLT5cbiAgICBwcmVmaXggPSBhdG9tLmNvbmZpZy5nZXQoJ3ZpbS1tb2RlbGluZS5wcmVmaXgnKS5qb2luIFwifFwiXG4gICAgQG1vZGVsaW5lUGF0dGVybiA9IG5ldyBSZWdFeHAgXCIoI3twcmVmaXh9KShbPD0+XT9cXFxcZCspKjpcXFxccyooc2V0KikqXFxcXHMrKFteOl0rKSpcXFxccyo6P1wiXG5cbiAgcGFyc2VWaW1Nb2RlTGluZTogKGxpbmUpIC0+XG4gICAgbWF0Y2hlcyA9IGxpbmUubWF0Y2ggQG1vZGVsaW5lUGF0dGVyblxuICAgIG9wdGlvbnMgPSBudWxsXG4gICAgaWYgbWF0Y2hlcz9bNF0/XG4gICAgICBvcHRpb25zID0ge31cbiAgICAgIGZvciBvcHRpb24gaW4gbWF0Y2hlc1s0XS5zcGxpdCBcIiBcIlxuICAgICAgICBba2V5LCB2YWx1ZV0gPSBvcHRpb24uc3BsaXQgXCI9XCJcbiAgICAgICAga2V5ID0gQHNob3J0T3B0aW9uc1trZXldIGlmIEBzaG9ydE9wdGlvbnNba2V5XSBpc250IHVuZGVmaW5lZFxuICAgICAgICBrZXkgPSBAYWx0ZXJuYXRpdmVPcHRpb25zW2tleV0gaWYgQGFsdGVybmF0aXZlT3B0aW9uc1trZXldIGlzbnQgdW5kZWZpbmVkXG4gICAgICAgIHZhbHVlID0gQGFsdGVybmF0aXZlVmFsdWVbdmFsdWVdIGlmIEBhbHRlcm5hdGl2ZVZhbHVlW3ZhbHVlXSBpc250IHVuZGVmaW5lZFxuICAgICAgICBmb3IgcGFpciBpbiBAcGFpck9wdGlvbnNcbiAgICAgICAgICBkZWxldGUgb3B0aW9uc1twYWlyLm9uXSBpZiBrZXkgaXMgcGFpci5vZmYgYW5kIG9wdGlvbnNbcGFpci5vbl1cbiAgICAgICAgb3B0aW9uc1trZXldID0gdmFsdWUgPyB0cnVlIGlmIGtleSBpc250IFwiXCJcbiAgICBvcHRpb25zXG5cbiAgc2V0RW5jb2Rpbmc6IChlZGl0b3IsIGVuY29kaW5nKSAtPlxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgaWNvbnYuZW5jb2RpbmdFeGlzdHMgZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IGVuY29kaW5nLnRvTG93ZXJDYXNlKCkucmVwbGFjZSAvW14wLTlhLXpdfDpcXGR7NH0kL2csICcnXG4gICAgZWRpdG9yPy5zZXRFbmNvZGluZyBlbmNvZGluZ1xuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1zZXQtZW5jb2RpbmcnLCB7ZWRpdG9yLCBlbmNvZGluZ30sIEBcblxuICBzZXRMaW5lRW5kaW5nOiAoZWRpdG9yLCBsaW5lRW5kaW5nKSAtPlxuICAgIHJldHVybiB1bmxlc3MgbGluZUVuZGluZ1xuICAgIGJ1ZmZlciA9IGVkaXRvcj8uZ2V0QnVmZmVyKClcbiAgICByZXR1cm4gdW5sZXNzIGJ1ZmZlclxuICAgIGJ1ZmZlci5zZXRQcmVmZXJyZWRMaW5lRW5kaW5nIGxpbmVFbmRpbmdcbiAgICBidWZmZXIuc2V0VGV4dCBidWZmZXIuZ2V0VGV4dCgpLnJlcGxhY2UoL1xcclxcbnxcXHJ8XFxuL2csIGxpbmVFbmRpbmcpXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLXNldC1saW5lLWVuZGluZycsIHtlZGl0b3IsIGxpbmVFbmRpbmd9LCBAXG5cbiAgc2V0RmlsZVR5cGU6IChlZGl0b3IsIHR5cGUpIC0+XG4gICAgZ3JhbW1hciA9IEBtYXRjaEZpbGVUeXBlIGVkaXRvciwgdHlwZVxuICAgIGlmIGdyYW1tYXIgaXNudCBhdG9tLmdyYW1tYXJzLm51bGxHcmFtbWFyXG4gICAgICBhdG9tLnRleHRFZGl0b3JzLnNldEdyYW1tYXJPdmVycmlkZSBlZGl0b3IsIGdyYW1tYXIuc2NvcGVOYW1lXG4gICAgICBlZGl0b3I/LnNldEdyYW1tYXIgZ3JhbW1hclxuICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLXNldC1maWxlLXR5cGUnLCB7ZWRpdG9yLCBncmFtbWFyfSwgQFxuXG4gIG1hdGNoRmlsZVR5cGU6IChlZGl0b3IsIHR5cGUpIC0+XG4gICAgbWFwcGVyID0gQGdldEZpbGVUeXBlTWFwcGVyIHR5cGVcbiAgICBpZiB0eXBlb2YobWFwcGVyKSBpcyBcInN0cmluZ1wiXG4gICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKG1hcHBlcilcbiAgICBlbHNlIGlmIHR5cGVvZihtYXBwZXIpIGlzIFwib2JqZWN0XCIgYW5kIG1hcHBlci5sZW5ndGggPiAwXG4gICAgICBjb250ZW50ID0gZWRpdG9yPy5nZXRCdWZmZXIoKT8uZ2V0VGV4dCgpXG4gICAgICBzY29yZXMgPSBtYXBwZXIubWFwIChzY29wZU5hbWUpIC0+XG4gICAgICAgIGcgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoc2NvcGVOYW1lKSB8fCBhdG9tLmdyYW1tYXJzLm51bGxHcmFtbWFyXG4gICAgICAgIHtcbiAgICAgICAgICBzY29wZU5hbWU6IHNjb3BlTmFtZVxuICAgICAgICAgIHNjb3JlOiBhdG9tLmdyYW1tYXJzLmdldEdyYW1tYXJTY29yZShnLCBlZGl0b3IuZ2V0UGF0aCgpLCBjb250ZW50KVxuICAgICAgICB9XG4gICAgICBkZXRlY3QgPSBfLm1heCBzY29yZXMsIChzY29yZSkgLT5cbiAgICAgICAgc2NvcmUuc2NvcmVcbiAgICAgIGdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoZGV0ZWN0LnNjb3BlTmFtZSlcbiAgICBlbHNlXG4gICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5zZWxlY3RHcmFtbWFyKHR5cGUpXG4gICAgcmV0dXJuIGdyYW1tYXIgfHwgYXRvbS5ncmFtbWFycy5udWxsR3JhbW1hclxuXG4gIGdldEZpbGVUeXBlTWFwcGVyOiAodHlwZSkgLT5cbiAgICBtYXBwZXIgPSBAZmlsZVR5cGVNYXBwZXJbdHlwZV0gfHwgW11cbiAgICBleHRyYSA9IGF0b20uY29uZmlnLmdldChcInZpbS1tb2RlbGluZS1maWxldHlwZXNcIikgfHwge31cbiAgICBpZiB0eXBlb2YoZXh0cmFbdHlwZV0pIGlzIFwic3RyaW5nXCJcbiAgICAgIG1hcHBlciA9IGV4dHJhW3R5cGVdXG4gICAgZWxzZSBpZiB0eXBlb2YoZXh0cmFbdHlwZV0pIGlzIFwib2JqZWN0XCJcbiAgICAgIGZvciBmdCBpbiBleHRyYVt0eXBlXVxuICAgICAgICBtYXBwZXIucHVzaCBmdFxuICAgIG1hcHBlclxuXG4gIHNldEluZGVudDogKGVkaXRvciwgb3B0aW9ucykgLT5cbiAgICBzb2Z0dGFiID0gdW5kZWZpbmVkXG4gICAgc29mdHRhYiA9IHRydWUgaWYgb3B0aW9ucy5leHBhbmR0YWJcbiAgICBzb2Z0dGFiID0gZmFsc2UgaWYgb3B0aW9ucy5ub2V4cGFuZHRhYlxuICAgIGlmIHNvZnR0YWIgaXNudCB1bmRlZmluZWRcbiAgICAgIGVkaXRvcj8uc2V0U29mdFRhYnMgc29mdHRhYlxuICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLXNldC1zb2Z0dGFicycsIHtlZGl0b3IsIHNvZnR0YWJ9LCBAXG5cbiAgICAjIFRPRE86IHNvZnR0YWJzdG9wIGFuZCBzaGlmdHdpZHRoIHN1cHBvcnRcbiAgICAjaW5kZW50ID0gb3B0aW9ucy5zb2Z0dGFic3RvcFxuICAgICNpZiBpbmRlbnQgPD0gMFxuICAgICMgIGluZGVudCA9IG9wdGlvbnMuc2hpZnR3aWR0aFxuICAgICMgIGlmIGluZGVudCBpcyB1bmRlZmluZWQgb3IgaW5kZW50IGlzIFwiMFwiXG4gICAgIyAgICBpbmRlbnQgPSBvcHRpb25zLnRhYnN0b3BcbiAgICAjcmV0dXJuIHVubGVzcyBpbmRlbnRcbiAgICAjZWRpdG9yPy5zZXRUYWJMZW5ndGggaW5kZW50XG5cbiAgICBpZiBvcHRpb25zLnRhYnN0b3BcbiAgICAgIHRhYnN0b3AgPSBwYXJzZUludCBvcHRpb25zLnRhYnN0b3AsIDEwXG4gICAgICBlZGl0b3I/LnNldFRhYkxlbmd0aCB0YWJzdG9wXG4gICAgICBAZW1pdHRlci5lbWl0ICdkaWQtc2V0LXRhYi1sZW5ndGgnLCB7ZWRpdG9yLCB0YWJzdG9wfSwgQFxuXG4gIHNldFNwZWxsQ2hlY2s6IChlZGl0b3IsIG9wdGlvbnMpIC0+XG4gICAgZW5hYmxlZCA9IHVuZGVmaW5lZFxuICAgIGVuYWJsZWQgPSB0cnVlIGlmIG9wdGlvbnMuc3BlbGxcbiAgICBlbmFibGVkID0gZmFsc2UgaWYgb3B0aW9ucy5ub3NwZWxsXG4gICAgaWYgZW5hYmxlZCBpc250IHVuZGVmaW5lZFxuICAgICAgICBwa2cgPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UgXCJzcGVsbC1jaGVja1wiXG4gICAgICAgIHZpZXcgPSBwa2cubWFpbk1vZHVsZS52aWV3c0J5RWRpdG9yLmdldChlZGl0b3IpXG4gICAgICAgIGlmICh2aWV3LmJ1ZmZlciBpc250IG51bGwgYW5kIGVuYWJsZWQgaXMgZmFsc2UpIG9yICh2aWV3LmJ1ZmZlciBpcyBudWxsIGFuZCBlbmFibGVkIGlzIHRydWUpXG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdhdG9tLXdvcmtzcGFjZScpLCBcInNwZWxsLWNoZWNrOnRvZ2dsZVwiKVxuXG4gIGluc2VydE1vZGVMaW5lOiAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yXG4gICAgb3B0aW9ucyA9IEBnZXRDdXJyZW50T3B0aW9ucyBlZGl0b3JcblxuICAgIG1vZGVsaW5lUmFuZ2UgPSBbQGdldEluc2VydE1vZGVsaW5lUm93KGVkaXRvciksIDBdXG4gICAgc2NvcGUgPSBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24gbW9kZWxpbmVSYW5nZVxuICAgIGNvbW1lbnQgPSBhdG9tLmNvbmZpZy5nZXQoXCJlZGl0b3IuY29tbWVudFN0YXJ0XCIsIHtzY29wZX0pXG5cbiAgICBpZiBjb21tZW50XG4gICAgICBtb2RlbGluZSA9IFwiI3tjb21tZW50fSN7QG1ha2VNb2RlbGluZShvcHRpb25zKX1cIlxuICAgICAgY3VycmVudFBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiBtb2RlbGluZVJhbmdlXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoXCJ2aW0tbW9kZWxpbmUuaW5zZXJ0TW9kZWxpbmVQb3NpdGlvblwiKSBpcyBcImZpcnN0IHJvd1wiIG9yIGF0b20uY29uZmlnLmdldChcInZpbS1tb2RlbGluZS5pbnNlcnRNb2RlbGluZVBvc2l0aW9uXCIpIGlzIFwiYWJvdmUgY3Vyc29yIHJvd1wiXG4gICAgICAgIGVkaXRvci5pbnNlcnROZXdsaW5lQWJvdmUoKVxuICAgICAgZWxzZVxuICAgICAgICBlZGl0b3IuaW5zZXJ0TmV3bGluZUJlbG93KClcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IG1vZGVsaW5lXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24gY3VycmVudFBvc2l0aW9uXG4gICAgZWxzZVxuICAgICAgY29uc29sZS5lcnJvciBcIidlZGl0b3IuY29tbWVudFN0YXJ0JyBpcyB1bmRlZmluZWQgaW4gdGhpcyBzY29wZS5cIlxuXG4gIGdldEN1cnJlbnRPcHRpb25zOiAoZWRpdG9yKSAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSB1bmxlc3MgZWRpdG9yXG4gICAgc2NvcGVOYW1lID0gZWRpdG9yLmdldEdyYW1tYXIoKT8uc2NvcGVOYW1lLnNwbGl0KFwiLlwiKVxuXG4gICAga2V5cyA9IHN3aXRjaCBhdG9tLmNvbmZpZy5nZXQoXCJ2aW0tbW9kZWxpbmUuaW5zZXJ0TW9kZWxpbmVUeXBlXCIpXG4gICAgICB3aGVuIFwic2hvcnRcIiAgICB0aGVuIFtcImZlbmNcIiwgXCJmZlwiLCBcImZ0XCIsIFwidHNcIiwgXCJldFwiXVxuICAgICAgd2hlbiBcImxvbmdcIiAgICAgdGhlbiBbXCJmaWxlZW5jb2RpbmdcIiwgXCJmaWxlZm9ybWF0XCIsIFwiZmlsZXR5cGVcIiwgXCJ0YWJzdG9wXCIsIFwiZXhwYW5kdGFiXCJdXG4gICAgICB3aGVuIFwib3JpZ2luYWxcIiB0aGVuIFtcImVuY29kaW5nXCIsIFwibGluZUVuZGluZ1wiLCBcImdyYW1tYXJcIiwgXCJ0YWJMZW5ndGhcIiwgXCJ1c2VTb2Z0VGFic1wiXVxuXG4gICAgb3B0aW9ucyA9IHt9XG4gICAgZm9yIGtleSBpbiBrZXlzXG4gICAgICBwcm9wZXJ0eSA9IGtleVxuICAgICAga2V5ID0gQHNob3J0T3B0aW9uc1trZXldIGlmIEBzaG9ydE9wdGlvbnNba2V5XSBpc250IHVuZGVmaW5lZFxuICAgICAga2V5ID0gQGFsdGVybmF0aXZlT3B0aW9uc1trZXldIGlmIEBhbHRlcm5hdGl2ZU9wdGlvbnNba2V5XSBpc250IHVuZGVmaW5lZFxuICAgICAgb3B0aW9uc1twcm9wZXJ0eV0gPSBzd2l0Y2gga2V5XG4gICAgICAgIHdoZW4gXCJmaWxlZW5jb2RpbmdcIiB0aGVuIGVkaXRvci5nZXRFbmNvZGluZygpXG4gICAgICAgIHdoZW4gXCJmaWxlZm9ybWF0XCIgICB0aGVuIEBkZXRlY3RMaW5lRW5kaW5nKGVkaXRvcilcbiAgICAgICAgd2hlbiBcImZpbGV0eXBlXCIgICAgIHRoZW4gc2NvcGVOYW1lW3Njb3BlTmFtZS5sZW5ndGggLSAxXVxuICAgICAgICB3aGVuIFwidGFic3RvcFwiICAgICAgdGhlbiBlZGl0b3IuZ2V0VGFiTGVuZ3RoKClcbiAgICAgICAgd2hlbiBcImV4cGFuZHRhYlwiICAgIHRoZW4gZWRpdG9yLmdldFNvZnRUYWJzKClcbiAgICBvcHRpb25zXG5cbiAgbWFrZU1vZGVsaW5lOiAob3B0aW9ucykgLT5cbiAgICBwcmVmaXggPVxuICAgIHNldHRpbmdzID0gXy5tYXAob3B0aW9ucywgKHYsIGspIC0+XG4gICAgICBpZiB0eXBlb2YgdiBpcyBcImJvb2xlYW5cIlxuICAgICAgICByZXR1cm4gXCIje2lmIHYgdGhlbiBcIlwiIGVsc2UgXCJub1wifSN7a31cIlxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gXCIje2t9PSN7dn1cIlxuICAgICkuam9pbihcIiBcIilcbiAgICBcIiN7YXRvbS5jb25maWcuZ2V0KFwidmltLW1vZGVsaW5lLmluc2VydFByZWZpeFwiKX06c2V0ICN7c2V0dGluZ3N9OlwiXG5cbiAgZ2V0SW5zZXJ0TW9kZWxpbmVSb3c6IChlZGl0b3IpIC0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpIHVubGVzcyBlZGl0b3JcbiAgICBzd2l0Y2ggYXRvbS5jb25maWcuZ2V0IFwidmltLW1vZGVsaW5lLmluc2VydE1vZGVsaW5lUG9zaXRpb25cIlxuICAgICAgd2hlbiBcImZpcnN0IHJvd1wiICAgICAgICB0aGVuIDBcbiAgICAgIHdoZW4gXCJsYXN0IHJvd1wiICAgICAgICAgdGhlbiBlZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpXG4gICAgICB3aGVuIFwiYWJvdmUgY3Vyc29yIHJvd1wiIHRoZW4gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93XG4gICAgICB3aGVuIFwiYmVsb3cgY3Vyc29yIHJvd1wiIHRoZW4gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93XG5cbiAgZGV0ZWN0TGluZUVuZGluZzogKGVkaXRvciktPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSB1bmxlc3MgZWRpdG9yXG4gICAgYnVmZmVyID0gZWRpdG9yPy5nZXRCdWZmZXIoKVxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yXG5cbiAgICBsaW5lRW5kaW5nID0gYnVmZmVyLmxpbmVFbmRpbmdGb3JSb3coYnVmZmVyLmdldExhc3RSb3coKSAtIDEpXG4gICAgZm9yIGtleSwgdmFsIG9mIEBsaW5lRW5kaW5nXG4gICAgICBpZiB2YWwgaXMgbGluZUVuZGluZ1xuICAgICAgICByZXR1cm4ga2V5XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuIl19
