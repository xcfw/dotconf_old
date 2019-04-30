(function() {
  var Axios, GitLab, axios, conf;

  Axios = require('axios');

  conf = (function(_this) {
    return function() {
      return {
        url: atom.config.get('gitlab.serverUrl') + '/api/v3',
        token: atom.config.get('gitlab.privateToken')
      };
    };
  })(this);

  axios = (function(_this) {
    return function(c) {
      return Axios.create({
        baseURL: c.url,
        headers: {
          'PRIVATE-TOKEN': c.token
        }
      });
    };
  })(this);

  module.exports = GitLab = (function() {
    var inst, projects;

    inst = null;

    projects = [];

    function GitLab() {
      this.inst = axios(conf());
    }

    GitLab.prototype.getProjects = function() {
      return this.inst.get('/projects').then((function(_this) {
        return function(response) {
          return _this.projects = response.data;
        };
      })(this));
    };

    return GitLab;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveGNmLy5hdG9tL3BhY2thZ2VzL2dpdGxhYi9saWIvcmVxdWVzdGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztFQUVSLElBQUEsR0FBTyxDQUFBLFNBQUEsS0FBQTtXQUFBLFNBQUE7YUFDTDtRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0JBQWhCLENBQUEsR0FBc0MsU0FBM0M7UUFDQSxLQUFBLEVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHFCQUFoQixDQURQOztJQURLO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTs7RUFJUCxLQUFBLEdBQVEsQ0FBQSxTQUFBLEtBQUE7V0FBQSxTQUFDLENBQUQ7YUFDTixLQUFLLENBQUMsTUFBTixDQUNFO1FBQUEsT0FBQSxFQUFTLENBQUMsQ0FBQyxHQUFYO1FBQ0EsT0FBQSxFQUNFO1VBQUEsZUFBQSxFQUFpQixDQUFDLENBQUMsS0FBbkI7U0FGRjtPQURGO0lBRE07RUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBOztFQU1SLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixRQUFBOztJQUFBLElBQUEsR0FBTzs7SUFDUCxRQUFBLEdBQVc7O0lBRUUsZ0JBQUE7TUFDWCxJQUFDLENBQUEsSUFBRCxHQUFRLEtBQUEsQ0FBTSxJQUFBLENBQUEsQ0FBTjtJQURHOztxQkFHYixXQUFBLEdBQWEsU0FBQTthQUNYLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLFdBQVYsQ0FDRSxDQUFDLElBREgsQ0FDUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsUUFBRDtpQkFBYyxLQUFDLENBQUEsUUFBRCxHQUFZLFFBQVEsQ0FBQztRQUFuQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEUjtJQURXOzs7OztBQXBCZiIsInNvdXJjZXNDb250ZW50IjpbIlxuQXhpb3MgPSByZXF1aXJlICdheGlvcydcblxuY29uZiA9ICgpID0+XG4gIHVybDogYXRvbS5jb25maWcuZ2V0KCdnaXRsYWIuc2VydmVyVXJsJykgKyAnL2FwaS92MydcbiAgdG9rZW46IGF0b20uY29uZmlnLmdldCgnZ2l0bGFiLnByaXZhdGVUb2tlbicpXG5cbmF4aW9zID0gKGMpID0+XG4gIEF4aW9zLmNyZWF0ZVxuICAgIGJhc2VVUkw6IGMudXJsXG4gICAgaGVhZGVyczpcbiAgICAgICdQUklWQVRFLVRPS0VOJzogYy50b2tlblxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBHaXRMYWJcbiAgaW5zdCA9IG51bGxcbiAgcHJvamVjdHMgPSBbXVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBpbnN0ID0gYXhpb3MgY29uZigpXG5cbiAgZ2V0UHJvamVjdHM6IC0+XG4gICAgQGluc3QuZ2V0ICcvcHJvamVjdHMnXG4gICAgICAudGhlbiAocmVzcG9uc2UpID0+IEBwcm9qZWN0cyA9IHJlc3BvbnNlLmRhdGFcbiJdfQ==
