(function() {
  module.exports = {
    activate: function() {
      return atom.commands.add('atom-text-editor', {
        'vim-mode-zz:close': (function(_this) {
          return function() {
            return _this.close();
          };
        })(this),
        'vim-mode-zz:saveAndClose': (function(_this) {
          return function() {
            return _this.saveAndClose();
          };
        })(this)
      });
    },
    close: function() {
      var editor, pack, selected, treeView;
      pack = atom.packages.activePackages['tree-view'];
      treeView = pack != null ? pack.mainModule.treeView : void 0;
      selected = treeView != null ? treeView.selectedEntry() : void 0;
      editor = atom.workspace.getActiveTextEditor();
      if (editor != null) {
        editor.destroy();
      }
      if (treeView && !atom.workspace.getActivePane().getActiveItem()) {
        treeView.selectEntry(selected);
        return treeView.focus();
      }
    },
    saveAndClose: function() {
      var editor;
      editor = atom.workspace.getActiveTextEditor();
      if (editor.getPath() && editor.isModified()) {
        return editor.save().done((function(_this) {
          return function() {
            return _this.close();
          };
        })(this));
      } else {
        return this.close(editor);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveGNmLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXp6L2xpYi92aW0tbW9kZS16ei5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNJO0lBQUEsUUFBQSxFQUFVLFNBQUE7YUFDTixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0Isa0JBQWxCLEVBQXNDO1FBQ2xDLG1CQUFBLEVBQXFCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLEtBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURhO1FBRWxDLDBCQUFBLEVBQTRCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFlBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZNO09BQXRDO0lBRE0sQ0FBVjtJQU1BLEtBQUEsRUFBTyxTQUFBO0FBQ0gsVUFBQTtNQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWUsQ0FBQSxXQUFBO01BQ3BDLFFBQUEsa0JBQVcsSUFBSSxDQUFFLFVBQVUsQ0FBQztNQUU1QixRQUFBLHNCQUFXLFFBQVEsQ0FBRSxhQUFWLENBQUE7TUFFWCxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBOztRQUNULE1BQU0sQ0FBRSxPQUFSLENBQUE7O01BRUEsSUFBRyxRQUFBLElBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQSxDQUE4QixDQUFDLGFBQS9CLENBQUEsQ0FBakI7UUFDSSxRQUFRLENBQUMsV0FBVCxDQUFxQixRQUFyQjtlQUNBLFFBQVEsQ0FBQyxLQUFULENBQUEsRUFGSjs7SUFURyxDQU5QO0lBbUJBLFlBQUEsRUFBYyxTQUFBO0FBQ1YsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7TUFDVCxJQUFHLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBQSxJQUFxQixNQUFNLENBQUMsVUFBUCxDQUFBLENBQXhCO2VBQ0ksTUFBTSxDQUFDLElBQVAsQ0FBQSxDQUFhLENBQUMsSUFBZCxDQUFtQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxLQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkIsRUFESjtPQUFBLE1BQUE7ZUFFSyxJQUFDLENBQUEsS0FBRCxDQUFPLE1BQVAsRUFGTDs7SUFGVSxDQW5CZDs7QUFESiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbiAgICBhY3RpdmF0ZTogLT5cbiAgICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgICAgICAgICAndmltLW1vZGUteno6Y2xvc2UnOiA9PiBAY2xvc2UoKVxuICAgICAgICAgICAgJ3ZpbS1tb2RlLXp6OnNhdmVBbmRDbG9zZSc6ID0+IEBzYXZlQW5kQ2xvc2UoKVxuICAgICAgICB9KVxuXG4gICAgY2xvc2U6IC0+XG4gICAgICAgIHBhY2sgPSBhdG9tLnBhY2thZ2VzLmFjdGl2ZVBhY2thZ2VzWyd0cmVlLXZpZXcnXVxuICAgICAgICB0cmVlVmlldyA9IHBhY2s/Lm1haW5Nb2R1bGUudHJlZVZpZXdcblxuICAgICAgICBzZWxlY3RlZCA9IHRyZWVWaWV3Py5zZWxlY3RlZEVudHJ5KClcblxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgZWRpdG9yPy5kZXN0cm95KClcblxuICAgICAgICBpZiB0cmVlVmlldyBhbmQgIWF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5nZXRBY3RpdmVJdGVtKClcbiAgICAgICAgICAgIHRyZWVWaWV3LnNlbGVjdEVudHJ5KHNlbGVjdGVkKVxuICAgICAgICAgICAgdHJlZVZpZXcuZm9jdXMoKVxuXG4gICAgc2F2ZUFuZENsb3NlOiAtPlxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgaWYgZWRpdG9yLmdldFBhdGgoKSBhbmQgZWRpdG9yLmlzTW9kaWZpZWQoKVxuICAgICAgICAgICAgZWRpdG9yLnNhdmUoKS5kb25lKD0+IEBjbG9zZSgpKVxuICAgICAgICBlbHNlIEBjbG9zZShlZGl0b3IpXG4iXX0=
