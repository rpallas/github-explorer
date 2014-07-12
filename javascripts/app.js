window.Github = Ember.Application.create({
  LOG_TRANSITIONS: true,
  rootElement: '#github-app'
});

var apiUrl = 'https://api.github.com/';

/**
 * Data
 */

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

/**
 * Routes
 */

Github.Router.map(function () {
  this.resource('user', { path: 'users/:login' }, function () {
    this.resource('repositories');
    this.resource('repository', { path: 'repositories/:reponame' }, function () {
      this.resource('commits');
      this.resource('issues');
      this.resource('forks');
      this.route('newissue');
    });
  });
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
    return Ember.$.getJSON(apiUrl + 'users/' + params.login);
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
    var url = apiUrl + 'repos/' + user.login + '/' + params.reponame;
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

/**
 * Controllers
 */

Github.RepositoriesController = Ember.ArrayController.extend({
  needs: ['user'],
  user: Ember.computed.alias('controllers.user')
});

Github.RepositoryController = Ember.ObjectController.extend({
  needs: ['user'],
  user: Ember.computed.alias('controllers.user'),
  forked: Ember.computed.alias('fork')
});

Github.RepositoryNewissueController = Ember.Controller.extend({
  needs: ['repository'],
  repo: Ember.computed.alias("controllers.repository"),
  actions: {
    submitIssue: function () {
      var title = $('#new-issue-title').val();
      var body = $('#new-issue-body').val();
      var url = this.get('repo').get('issues_url').replace('{/number}', '');
      Ember.$.ajax({
        url: url,
        type:'POST',
        contentType: 'application/vnd.github.v3+json',
        data: { title: title, body: body }
      }).done(function (result) {
        this.transitionToRoute('issues');
        console.log('Submitted ' + title + ' to ' + url);
      }).fail(function (jqXHR, textStatus, message) {
        Ember.Logger.error('Create issue failed:', textStatus, message);
      });
    }
  }
});

/**
 * Helpers
 */

Ember.Handlebars.registerBoundHelper('fromDate', function (theDate) {
  var today = moment();
  var target = moment(theDate);
  return target.from(today);
});
