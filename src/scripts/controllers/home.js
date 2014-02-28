angular.module('MyApp.controllers')
  .controller('HomeCtrl', ['$scope', 'env',
    function($scope, env) {
      'use strict';

      $scope.apiUrl = env.apiUrl;
    }
  ]);
