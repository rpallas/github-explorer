window.Github = Ember.Application.create({
//  LOG_TRANSITIONS: true,
  rootElement: '#github-app'
});

var devs = [
  { login: 'rpallas', name: 'Robbie Pallas' },
  { login: 'robconery', name: 'Rob Conery' },
  { login: 'shanselman', name: 'Scott Hanselman' },
  { login: 'tomdale', name: 'Tom Dale' },
  { login: 'wycats', name: 'Yehuda Katz' },
  { login: 'jongalloway', name: 'Jon Galloway' },
  { login: 'haacked', name: 'Phil Haack' }
];

var themes = [
  { name: "default", stylesheet: "default.css" },
  { name: "amelia", stylesheet: "amelia.css" },
  { name: "cerulean", stylesheet: "cerulean.css" },
  { name: "cosmo", stylesheet: "cosmo.css" },
  { name: "cyborg", stylesheet: "cyborg.css" },
  { name: "darkly", stylesheet: "darkly.css" },
  { name: "flatly", stylesheet: "flatly.css" },
  { name: "journal", stylesheet: "journal.css" },
  { name: "readable", stylesheet: "readable.css" },
  { name: "simplex", stylesheet: "simplex.css" },
  { name: "slate", stylesheet: "slate.css" },
  { name: "spacelab", stylesheet: "spacelab.css" },
  { name: "superhero", stylesheet: "superhero.css" },
  { name: "united", stylesheet: "united.css" },
  { name: "yeti", stylesheet: "yeti.css" }
];

Github.Router.map(function () {
  this.resource('user', { path: 'users/:login' }, function () {
    this.resource('repositories');
    this.resource('repository', { path: 'repositories/:reponame' }, function () {
      this.resource('commits');
      this.resource('issues');
      this.resource('forks');
    });
  });
});

Ember.Handlebars.registerBoundHelper('fromDate', function (theDate) {
  var today = moment();
  var target = moment(theDate);
  return target.from(today);
});

Github.ApplicationRoute = Ember.Route.extend({
  model: function(){ return themes; },
  actions: {
    setTheme: function (theme) {
      $('head link#bootstrap-theme').attr('href', 'css/vendor/themes/' + theme);
    }
  }
});

Github.IndexRoute = Ember.Route.extend({
  model: function(){ return devs; }
});

Github.UserRoute = Ember.Route.extend({
  model: function (params) {
    return Ember.$.getJSON('https://api.github.com/users/' + params.login);
  }
});

Github.UserIndexRoute = Ember.Route.extend({
  model: function () {
    return this.modelFor('user');
  }
});

Github.RepositoriesRoute = Ember.Route.extend({
  model: function () {
    var user = this.modelFor('user');
    return Ember.$.getJSON(user.repos_url);
  }
});

Github.RepositoryRoute = Ember.Route.extend({
  model: function (params) {
    var user = this.modelFor('user');
    // Build the url for the Repo call manually
    var url = 'https://api.github.com/repos/' + user.login + '/' + params.reponame;
    return Ember.$.getJSON(url);
  }
});

Github.CommitsRoute = Ember.Route.extend({
  model: function () {
    var repo = this.modelFor('repository');
    var url = repo.commits_url.replace('{/sha}', '');
    return Ember.$.getJSON(url);
  }
});

Github.IssuesRoute = Ember.Route.extend({
  model: function () {
    var repo = this.modelFor('repository');
    var url = repo.issues_url.replace('{/number}', '');
    return Ember.$.getJSON(url);
  }
});

Github.ForksRoute = Ember.Route.extend({
  model: function () {
    var repo = this.modelFor('repository');
    return Ember.$.getJSON(repo.forks_url);
  }
});

Github.RepositoriesController = Ember.ArrayController.extend({
  needs: ['user'],
  user: Ember.computed.alias('controllers.user')
});

Github.RepositoryController = Ember.ObjectController.extend({
  needs: ['user'],
  user: Ember.computed.alias('controllers.user'),
  forked: Ember.computed.alias('fork')
});