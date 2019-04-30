(function() {
  var $, $$, CompositeDisposable, ProjectsView, Requester, ScrollView, SelectListView, gitlab, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $ = ref.$, $$ = ref.$$, ScrollView = ref.ScrollView, SelectListView = ref.SelectListView;

  CompositeDisposable = require('atom').CompositeDisposable;

  Requester = require('./requester');

  gitlab = new Requester;

  module.exports = ProjectsView = (function(superClass) {
    extend(ProjectsView, superClass);

    function ProjectsView() {
      return ProjectsView.__super__.constructor.apply(this, arguments);
    }

    ProjectsView.prototype.panel = null;

    ProjectsView.content = function() {
      return this.div({
        "class": 'gitlab'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'panel'
          }, function() {
            return _this.div({
              outlet: 'panelText',
              "class": 'padded'
            }, function() {
              _this.div({
                "class": 'block gitlab-title'
              }, function() {
                _this.h4({
                  "class": 'inline-block'
                }, 'GitLab');
                return _this.span({
                  "class": 'badge badge-large icon icon-repo gitlab-projects-count',
                  outlet: 'repoCount'
                }, 0);
              });
              return _this.div({
                "class": 'btn-toolbar'
              }, function() {
                return _this.div({
                  "class": 'block btn-group'
                }, function() {
                  _this.button({
                    "class": 'btn icon icon-repo-clone',
                    outlet: 'btnClone'
                  }, 'Clone');
                  _this.button({
                    "class": 'btn icon icon-repo-create',
                    outlet: 'btnCreate'
                  }, 'Create');
                  return _this.button({
                    "class": 'btn icon icon-repo-sync',
                    outlet: 'btnSync'
                  }, 'Sync');
                });
              });
            });
          });
        };
      })(this));
    };

    ProjectsView.prototype.initialize = function(state) {
      this.disposables = new CompositeDisposable;
      if (state != null ? state.attached : void 0) {
        return this.attach();
      }
    };

    ProjectsView.prototype.serialize = function() {
      return {
        attached: this.panel != null
      };
    };

    ProjectsView.prototype.deactivate = function() {
      this.disposables.dispose();
      if (this.panel != null) {
        return this.detach();
      }
    };

    ProjectsView.prototype.getTitle = function() {
      return "GitLab";
    };

    ProjectsView.prototype.updateProjectsCount = function() {
      return gitlab.getProjects().then((function(_this) {
        return function(projects) {
          _this.repoCount.context.style.display = void 0;
          return _this.repoCount.context.innerHTML = projects.length;
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          console.error(error);
          return _this.repoCount.context.style.display = 'none';
        };
      })(this));
    };

    ProjectsView.prototype.attach = function() {
      this.updateProjectsCount();
      if (atom.config.get('gitlab.position') === 'right') {
        return this.panel != null ? this.panel : this.panel = atom.workspace.addRightPanel({
          item: this
        });
      } else {
        return this.panel != null ? this.panel : this.panel = atom.workspace.addLeftPanel({
          item: this
        });
      }
    };

    ProjectsView.prototype.detach = function() {
      this.panel.destroy();
      return this.panel = null;
    };

    ProjectsView.prototype.toggle = function() {
      if (this.isVisible()) {
        return this.detach();
      } else {
        return this.attach();
      }
    };

    return ProjectsView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveGNmLy5hdG9tL3BhY2thZ2VzL2dpdGxhYi9saWIvcHJvamVjdHMtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDRGQUFBO0lBQUE7OztFQUFBLE1BQXNDLE9BQUEsQ0FBUSxzQkFBUixDQUF0QyxFQUFDLFNBQUQsRUFBSSxXQUFKLEVBQVEsMkJBQVIsRUFBb0I7O0VBQ25CLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFeEIsU0FBQSxHQUFZLE9BQUEsQ0FBUSxhQUFSOztFQUVaLE1BQUEsR0FBUyxJQUFJOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7MkJBQ0osS0FBQSxHQUFPOztJQUVQLFlBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7T0FBTCxFQUFzQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3BCLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE9BQVA7V0FBTCxFQUFxQixTQUFBO21CQUNuQixLQUFDLENBQUEsR0FBRCxDQUFLO2NBQUEsTUFBQSxFQUFRLFdBQVI7Y0FBcUIsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUE1QjthQUFMLEVBQTJDLFNBQUE7Y0FDekMsS0FBQyxDQUFBLEdBQUQsQ0FBSztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG9CQUFQO2VBQUwsRUFBa0MsU0FBQTtnQkFDaEMsS0FBQyxDQUFBLEVBQUQsQ0FBSTtrQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGNBQVA7aUJBQUosRUFBMkIsUUFBM0I7dUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTTtrQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHdEQUFQO2tCQUFpRSxNQUFBLEVBQVEsV0FBekU7aUJBQU4sRUFBNEYsQ0FBNUY7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QURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxNQUFELENBQUEsRUFIRjs7SUFETTs7OztLQWxEaUI7QUFSM0IiLCJzb3VyY2VzQ29udGVudCI6WyJ7JCwgJCQsIFNjcm9sbFZpZXcsIFNlbGVjdExpc3RWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuUmVxdWVzdGVyID0gcmVxdWlyZSgnLi9yZXF1ZXN0ZXInKVxuXG5naXRsYWIgPSBuZXcgUmVxdWVzdGVyXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFByb2plY3RzVmlldyBleHRlbmRzIFNjcm9sbFZpZXdcbiAgcGFuZWw6IG51bGxcblxuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnZ2l0bGFiJywgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdwYW5lbCcsID0+XG4gICAgICAgIEBkaXYgb3V0bGV0OiAncGFuZWxUZXh0JywgY2xhc3M6ICdwYWRkZWQnLCA9PlxuICAgICAgICAgIEBkaXYgY2xhc3M6ICdibG9jayBnaXRsYWItdGl0bGUnLCA9PlxuICAgICAgICAgICAgQGg0IGNsYXNzOiAnaW5saW5lLWJsb2NrJywgJ0dpdExhYidcbiAgICAgICAgICAgIEBzcGFuIGNsYXNzOiAnYmFkZ2UgYmFkZ2UtbGFyZ2UgaWNvbiBpY29uLXJlcG8gZ2l0bGFiLXByb2plY3RzLWNvdW50Jywgb3V0bGV0OiAncmVwb0NvdW50JywgMFxuICAgICAgICAgIEBkaXYgY2xhc3M6ICdidG4tdG9vbGJhcicsID0+XG4gICAgICAgICAgICBAZGl2IGNsYXNzOiAnYmxvY2sgYnRuLWdyb3VwJywgPT5cbiAgICAgICAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2J0biBpY29uIGljb24tcmVwby1jbG9uZScsIG91dGxldDogJ2J0bkNsb25lJywgJ0Nsb25lJ1xuICAgICAgICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYnRuIGljb24gaWNvbi1yZXBvLWNyZWF0ZScsIG91dGxldDogJ2J0bkNyZWF0ZScsICdDcmVhdGUnXG4gICAgICAgICAgICAgIEBidXR0b24gY2xhc3M6ICdidG4gaWNvbiBpY29uLXJlcG8tc3luYycsIG91dGxldDogJ2J0blN5bmMnLCAnU3luYydcblxuICBpbml0aWFsaXplOiAoc3RhdGUpIC0+XG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAYXR0YWNoKCkgaWYgc3RhdGU/LmF0dGFjaGVkXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIGF0dGFjaGVkOiBAcGFuZWw/XG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQGRldGFjaCgpIGlmIEBwYW5lbD9cblxuICBnZXRUaXRsZTogLT5cbiAgICBcIkdpdExhYlwiXG5cbiAgdXBkYXRlUHJvamVjdHNDb3VudDogLT5cbiAgICBnaXRsYWIuZ2V0UHJvamVjdHMoKVxuICAgICAgLnRoZW4gKHByb2plY3RzKSA9PlxuICAgICAgICBAcmVwb0NvdW50LmNvbnRleHQuc3R5bGUuZGlzcGxheSA9IHVuZGVmaW5lZDtcbiAgICAgICAgQHJlcG9Db3VudC5jb250ZXh0LmlubmVySFRNTCA9IHByb2plY3RzLmxlbmd0aFxuICAgICAgLmNhdGNoIChlcnJvcikgPT5cbiAgICAgICAgY29uc29sZS5lcnJvciBlcnJvclxuICAgICAgICBAcmVwb0NvdW50LmNvbnRleHQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICBhdHRhY2g6IC0+XG4gICAgQHVwZGF0ZVByb2plY3RzQ291bnQoKVxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0bGFiLnBvc2l0aW9uJykgPT0gJ3JpZ2h0J1xuICAgICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZFJpZ2h0UGFuZWwgaXRlbTogdGhpc1xuICAgIGVsc2VcbiAgICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRMZWZ0UGFuZWwgaXRlbTogdGhpc1xuXG4gIGRldGFjaDogLT5cbiAgICBAcGFuZWwuZGVzdHJveSgpXG4gICAgQHBhbmVsID0gbnVsbFxuXG4gIHRvZ2dsZTogLT5cbiAgICBpZiBAaXNWaXNpYmxlKClcbiAgICAgIEBkZXRhY2goKVxuICAgIGVsc2VcbiAgICAgIEBhdHRhY2goKVxuXG4gICMgVGVhciBkb3duIGFueSBzdGF0ZSBhbmQgZGV0YWNoXG4gICMgZGVzdHJveTogLT5cbiAgIyAgICMgQHJvb3QucmVtb3ZlKClcbiAgI1xuICAjIGdldEVsZW1lbnQ6IC0+XG4gICMgICBAcm9vdFxuIl19
