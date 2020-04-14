export default {
  template: require('./adjuster.directive.html'),
  controller: ['$scope', 'hs.map.service', 'Core', 'config', 'pra.adjuster.service', 'hs.utils.service',
    function ($scope, OlMap, Core, config, adjusterService, utils) {
      $scope.loading = false;
      $scope.utils = utils;

      angular.extend($scope, {
        Core,
        adjusterService
      });

      $scope.$emit('scope_loaded', 'adjuster');
    }
  ]
};
