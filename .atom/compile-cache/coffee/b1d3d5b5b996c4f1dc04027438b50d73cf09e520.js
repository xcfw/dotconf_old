(function() {
  var CompositeDisposable, Config, GitLab, ProjectsView;

  CompositeDisposable = require('atom').CompositeDisposable;

  Config = require('../config/settings');

  ProjectsView = require('./projects-view');

  module.exports = GitLab = {
    projectsView: null,
    config: Config,
    activate: function(state) {
      var base;
      this.state = state;
      this.disposables = new CompositeDisposable;
      if (this.shouldAttach()) {
        if ((base = this.state).attached == null) {
          base.attached = true;
        }
      }
      if (this.state.attached) {
        this.createViews();
      }
      return this.disposables.add(atom.commands.add('atom-workspace', {
        'gitlab:toggle-projects': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
    },
    deactivate: function() {
      var ref;
      this.disposables.dispose();
      if ((ref = this.projectsView) != null) {
        ref.deactivate();
      }
      return this.projectsView = null;
    },
    serialize: function() {
      var ref;
      return {
        projectsViewState: (ref = this.projectsView) != null ? ref.serialize() : void 0
      };
    },
    createViews: function() {
      if (this.projectsView == null) {
        this.projectsView = new ProjectsView(this.state.projectsViewState);
      }
      return this.projectsView;
    },
    shouldAttach: function() {
      return true;
    },
    toggle: function() {
      var ref;
      if ((ref = this.projectsView) != null ? ref.isVisible() : void 0) {
        return this.projectsView.toggle();
      } else {
        this.createViews();
        return this.projectsView.attach();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveGNmLy5hdG9tL3BhY2thZ2VzL2dpdGxhYi9saWIvZ2l0bGFiLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUUsc0JBQXdCLE9BQUEsQ0FBUSxNQUFSOztFQUMxQixNQUFBLEdBQVMsT0FBQSxDQUFRLG9CQUFSOztFQUNULFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVI7O0VBRWYsTUFBTSxDQUFDLE9BQVAsR0FBaUIsTUFBQSxHQUNmO0lBQUEsWUFBQSxFQUFjLElBQWQ7SUFDQSxNQUFBLEVBQVEsTUFEUjtJQUdBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7QUFDUixVQUFBO01BRFMsSUFBQyxDQUFBLFFBQUQ7TUFDVCxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBMkIsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUEzQjs7Y0FBTSxDQUFDLFdBQVk7U0FBbkI7O01BRUEsSUFBa0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUF6QjtRQUFBLElBQUMsQ0FBQSxXQUFELENBQUEsRUFBQTs7YUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztRQUFBLHdCQUFBLEVBQTBCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQjtPQUFwQyxDQUFqQjtJQU5RLENBSFY7SUFXQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7TUFBQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTs7V0FDYSxDQUFFLFVBQWYsQ0FBQTs7YUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQjtJQUhOLENBWFo7SUFnQkEsU0FBQSxFQUFXLFNBQUE7QUFDVCxVQUFBO2FBQUE7UUFBQSxpQkFBQSx5Q0FBZ0MsQ0FBRSxTQUFmLENBQUEsVUFBbkI7O0lBRFMsQ0FoQlg7SUFtQkEsV0FBQSxFQUFhLFNBQUE7TUFDWCxJQUFPLHlCQUFQO1FBQ0UsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBSSxZQUFKLENBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsaUJBQXhCLEVBRGxCOzthQUdBLElBQUMsQ0FBQTtJQUpVLENBbkJiO0lBeUJBLFlBQUEsRUFBYyxTQUFBO2FBQ1o7SUFEWSxDQXpCZDtJQTRCQSxNQUFBLEVBQVEsU0FBQTtBQUNOLFVBQUE7TUFBQSwyQ0FBZ0IsQ0FBRSxTQUFmLENBQUEsVUFBSDtlQUNFLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxDQUFBLEVBREY7T0FBQSxNQUFBO1FBR0UsSUFBQyxDQUFBLFdBQUQsQ0FBQTtlQUNBLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxDQUFBLEVBSkY7O0lBRE0sQ0E1QlI7O0FBTEYiLCJzb3VyY2VzQ29udGVudCI6WyJ7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSA9IHJlcXVpcmUgJ2F0b20nXG5Db25maWcgPSByZXF1aXJlICcuLi9jb25maWcvc2V0dGluZ3MnXG5Qcm9qZWN0c1ZpZXcgPSByZXF1aXJlICcuL3Byb2plY3RzLXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID0gR2l0TGFiID1cbiAgcHJvamVjdHNWaWV3OiBudWxsXG4gIGNvbmZpZzogQ29uZmlnXG5cbiAgYWN0aXZhdGU6IChAc3RhdGUpIC0+XG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3RhdGUuYXR0YWNoZWQgPz0gdHJ1ZSBpZiBAc2hvdWxkQXR0YWNoKClcblxuICAgIEBjcmVhdGVWaWV3cygpIGlmIEBzdGF0ZS5hdHRhY2hlZFxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0bGFiOnRvZ2dsZS1wcm9qZWN0cyc6ID0+IEB0b2dnbGUoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIEBwcm9qZWN0c1ZpZXc/LmRlYWN0aXZhdGUoKVxuICAgIEBwcm9qZWN0c1ZpZXcgPSBudWxsXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIHByb2plY3RzVmlld1N0YXRlOiBAcHJvamVjdHNWaWV3Py5zZXJpYWxpemUoKVxuXG4gIGNyZWF0ZVZpZXdzOiAtPlxuICAgIHVubGVzcyBAcHJvamVjdHNWaWV3P1xuICAgICAgQHByb2plY3RzVmlldyA9IG5ldyBQcm9qZWN0c1ZpZXcgQHN0YXRlLnByb2plY3RzVmlld1N0YXRlXG5cbiAgICBAcHJvamVjdHNWaWV3XG5cbiAgc2hvdWxkQXR0YWNoOiAtPlxuICAgIHRydWVcblxuICB0b2dnbGU6IC0+XG4gICAgaWYgQHByb2plY3RzVmlldz8uaXNWaXNpYmxlKClcbiAgICAgIEBwcm9qZWN0c1ZpZXcudG9nZ2xlKClcbiAgICBlbHNlXG4gICAgICBAY3JlYXRlVmlld3MoKVxuICAgICAgQHByb2plY3RzVmlldy5hdHRhY2goKVxuIl19
