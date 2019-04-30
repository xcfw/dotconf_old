(function() {
  var CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    subscriptions: null,
    activate: function(state) {
      var commands;
      this.subscriptions = new CompositeDisposable;
      commands = {
        'atom-vim-colon-command-on-command-pallete:w': (function(_this) {
          return function() {
            return _this.write();
          };
        })(this),
        'atom-vim-colon-command-on-command-pallete:write': (function(_this) {
          return function() {
            return _this.write();
          };
        })(this),
        'atom-vim-colon-command-on-command-pallete:q': (function(_this) {
          return function() {
            return _this.quit();
          };
        })(this),
        'atom-vim-colon-command-on-command-pallete:quit': (function(_this) {
          return function() {
            return _this.quit();
          };
        })(this),
        'atom-vim-colon-command-on-command-pallete:wq': (function(_this) {
          return function() {
            return _this.writeAndQuit();
          };
        })(this),
        'atom-vim-colon-command-on-command-pallete:x': (function(_this) {
          return function() {
            return _this.writeAndQuit();
          };
        })(this),
        'atom-vim-colon-command-on-command-pallete:tabnew': (function(_this) {
          return function() {
            return _this.openNewTab();
          };
        })(this),
        'w': (function(_this) {
          return function() {
            return _this.write();
          };
        })(this),
        'write': (function(_this) {
          return function() {
            return _this.write();
          };
        })(this),
        'q': (function(_this) {
          return function() {
            return _this.quit();
          };
        })(this),
        'quit': (function(_this) {
          return function() {
            return _this.quit();
          };
        })(this),
        'wq': (function(_this) {
          return function() {
            return _this.writeAndQuit();
          };
        })(this),
        'x': (function(_this) {
          return function() {
            return _this.writeAndQuit();
          };
        })(this),
        'tabnew': (function(_this) {
          return function() {
            return _this.openNewTab();
          };
        })(this)
      };
      return this.subscriptions.add(atom.commands.add('atom-text-editor', commands));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    serialize: function() {},
    write: function() {
      return atom.workspace.getActiveTextEditor().save();
    },
    quit: function() {
      return atom.workspace.destroyActivePaneItemOrEmptyPane();
    },
    writeAndQuit: function() {
      atom.workspace.getActiveTextEditor().save();
      return atom.workspace.destroyActivePaneItemOrEmptyPane();
    },
    openNewTab: function() {
      return atom.workspace.open();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveGNmLy5hdG9tL3BhY2thZ2VzL2F0b20tdmltLWNvbG9uLWNvbW1hbmQtb24tY29tbWFuZC1wYWxsZXRlL2xpYi9hdG9tLXZpbS1jb2xvbi1jb21tYW5kLW9uLWNvbW1hbmQtcGFsbGV0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFeEIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLGFBQUEsRUFBZSxJQUFmO0lBRUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtBQUVSLFVBQUE7TUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BRXJCLFFBQUEsR0FBVztRQUNULDZDQUFBLEVBQXNELENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLEtBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUQ3QztRQUVULGlEQUFBLEVBQXNELENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLEtBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUY3QztRQUdULDZDQUFBLEVBQXNELENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLElBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUg3QztRQUlULGdEQUFBLEVBQXNELENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLElBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUo3QztRQUtULDhDQUFBLEVBQXNELENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFlBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUw3QztRQU1ULDZDQUFBLEVBQXNELENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFlBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQU43QztRQU9ULGtEQUFBLEVBQXNELENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFVBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVA3QztRQVFULEdBQUEsRUFBc0QsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsS0FBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBUjdDO1FBU1QsT0FBQSxFQUFzRCxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxLQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FUN0M7UUFVVCxHQUFBLEVBQXNELENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLElBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVY3QztRQVdULE1BQUEsRUFBc0QsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsSUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBWDdDO1FBWVQsSUFBQSxFQUFzRCxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxZQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FaN0M7UUFhVCxHQUFBLEVBQXNELENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFlBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQWI3QztRQWNULFFBQUEsRUFBc0QsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsVUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBZDdDOzthQWdCWCxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGtCQUFsQixFQUFzQyxRQUF0QyxDQUFuQjtJQXBCUSxDQUZWO0lBd0JBLFVBQUEsRUFBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7SUFEVSxDQXhCWjtJQTJCQSxTQUFBLEVBQVcsU0FBQSxHQUFBLENBM0JYO0lBNkJBLEtBQUEsRUFBTyxTQUFBO2FBQ0wsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQW9DLENBQUMsSUFBckMsQ0FBQTtJQURLLENBN0JQO0lBZ0NBLElBQUEsRUFBTSxTQUFBO2FBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQ0FBZixDQUFBO0lBREksQ0FoQ047SUFtQ0EsWUFBQSxFQUFjLFNBQUE7TUFDWixJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBb0MsQ0FBQyxJQUFyQyxDQUFBO2FBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQ0FBZixDQUFBO0lBRlksQ0FuQ2Q7SUF1Q0EsVUFBQSxFQUFZLFNBQUE7YUFDVixJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBQTtJQURVLENBdkNaOztBQUhGIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuICBzdWJzY3JpcHRpb25zOiBudWxsXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICAjIEV2ZW50cyBzdWJzY3JpYmVkIHRvIGluIGF0b20ncyBzeXN0ZW0gY2FuIGJlIGVhc2lseSBjbGVhbmVkIHVwIHdpdGggYSBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgY29tbWFuZHMgPSB7XG4gICAgICAnYXRvbS12aW0tY29sb24tY29tbWFuZC1vbi1jb21tYW5kLXBhbGxldGU6dyc6ICAgICAgICA9PiBAd3JpdGUoKSxcbiAgICAgICdhdG9tLXZpbS1jb2xvbi1jb21tYW5kLW9uLWNvbW1hbmQtcGFsbGV0ZTp3cml0ZSc6ICAgID0+IEB3cml0ZSgpLFxuICAgICAgJ2F0b20tdmltLWNvbG9uLWNvbW1hbmQtb24tY29tbWFuZC1wYWxsZXRlOnEnOiAgICAgICAgPT4gQHF1aXQoKSxcbiAgICAgICdhdG9tLXZpbS1jb2xvbi1jb21tYW5kLW9uLWNvbW1hbmQtcGFsbGV0ZTpxdWl0JzogICAgID0+IEBxdWl0KCksXG4gICAgICAnYXRvbS12aW0tY29sb24tY29tbWFuZC1vbi1jb21tYW5kLXBhbGxldGU6d3EnOiAgICAgICA9PiBAd3JpdGVBbmRRdWl0KCksXG4gICAgICAnYXRvbS12aW0tY29sb24tY29tbWFuZC1vbi1jb21tYW5kLXBhbGxldGU6eCc6ICAgICAgICA9PiBAd3JpdGVBbmRRdWl0KCksXG4gICAgICAnYXRvbS12aW0tY29sb24tY29tbWFuZC1vbi1jb21tYW5kLXBhbGxldGU6dGFibmV3JzogICA9PiBAb3Blbk5ld1RhYigpLFxuICAgICAgJ3cnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPT4gQHdyaXRlKCksXG4gICAgICAnd3JpdGUnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9PiBAd3JpdGUoKSxcbiAgICAgICdxJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0+IEBxdWl0KCksXG4gICAgICAncXVpdCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9PiBAcXVpdCgpLFxuICAgICAgJ3dxJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPT4gQHdyaXRlQW5kUXVpdCgpXG4gICAgICAneCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9PiBAd3JpdGVBbmRRdWl0KClcbiAgICAgICd0YWJuZXcnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0+IEBvcGVuTmV3VGFiKClcbiAgICB9XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJywgY29tbWFuZHNcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gIHNlcmlhbGl6ZTogLT5cblxuICB3cml0ZTogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuc2F2ZSgpXG5cbiAgcXVpdDogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5kZXN0cm95QWN0aXZlUGFuZUl0ZW1PckVtcHR5UGFuZSgpXG5cbiAgd3JpdGVBbmRRdWl0OiAtPlxuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKS5zYXZlKClcbiAgICBhdG9tLndvcmtzcGFjZS5kZXN0cm95QWN0aXZlUGFuZUl0ZW1PckVtcHR5UGFuZSgpXG5cbiAgb3Blbk5ld1RhYjogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKClcbiJdfQ==
