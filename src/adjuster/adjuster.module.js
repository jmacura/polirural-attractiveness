import adjusterComponent from './adjuster.component';
import adjusterService from './adjuster.service';

angular.module('pra.adjuster', ['hs.core', 'hs.map'])
  .directive('pra.adjuster.sidebarBtn', function () {
    return {
      template: require('./adjuster-sidebar-btn.directive.html')
    };
  })

  .service('pra.adjuster.service', adjusterService)

  .component('pra.adjuster', adjusterComponent);
