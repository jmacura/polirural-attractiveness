export default {
    template: require('./adjuster.directive.html'),
    controller: ['$scope', 'hs.map.service', 'Core', 'config', 'pra.adjuster.service',
        function ($scope, OlMap, Core, config, adjusterService) {
            $scope.loading = false;

            angular.extend($scope, {
                Core,
                adjusterService,
            })

            $scope.$emit('scope_loaded', "adjuster");
        }
    ]
}