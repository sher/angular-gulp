angular.module('MyApp').service('env', function () {
  'use strict';

  var env = this;
  env.apiUrl = 'http://api-dev.your.domain';
});