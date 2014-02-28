angular.module('MyApp').config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
  'use strict';

  $urlRouterProvider.otherwise('/');
  $stateProvider.state('home', {
    url: '/',
    templateUrl: 'views/home.html',
    controller: 'HomeCtrl as ctrl'
  });
}]);
