angular.module('MyApp.controllers')
  .controller('AppCtrl', ['$rootScope', 'env',
    function($rootScope, env) {
      'use strict';

      $rootScope.message = "AngularJS Gulp starter kit v2.0";
      $rootScope.apiUrl = env.apiUrl;
    }
  ]);
