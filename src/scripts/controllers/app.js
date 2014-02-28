angular.module('MyApp.controllers')
  .controller('AppCtrl', ['$rootScope', 'env',
    function($rootScope, env) {
      'use strict';

      $rootScope.message = "AngularJS Gulp starter kit";
      $rootScope.apiUrl = env.apiUrl;
    }
  ]);
