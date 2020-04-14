'use strict';
import 'toolbar.module';
import 'print.module';
import 'query.module';
import 'search.module';
import 'add-layers.module';
import 'measure.module';
import 'permalink.module';
import 'info.module';
import 'datasource-selector.module';
import 'sidebar.module';
import 'draw.module';
import View from 'ol/View';
import { Tile } from 'ol/layer';
import { OSM } from 'ol/source';
import { Style, Stroke, Fill } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import './adjuster/adjuster.module';
import nuts from './nuts';

const module = angular.module('hs', [
  'hs.sidebar',
  'hs.draw',
  'hs.info',
  'hs.toolbar',
  'hs.layermanager',
  'hs.query',
  'hs.search', 'hs.print', 'hs.permalink',
  'hs.geolocation',
  'hs.datasource_selector',
  'hs.save-map',
  'hs.measure',
  'hs.addLayers',
  'pra.adjuster'
]);

module.directive('hs', ['config', 'Core', function (config, Core) {
  return {
    template: Core.hslayersNgTemplate,
    link: function (scope, element) {
      Core.fullScreenMap(element);
    }
  };
}]);

function getHostname () {
  const url = window.location.href;
  const urlArr = url.split('/');
  const domain = urlArr[2];
  return urlArr[0] + '//' + domain;
};

const stroke = new Stroke({
  color: '#3399CC',
  width: 0.25
});

function perc2color (perc) {
  perc = perc * 100;
  let r; let g; const b = 0;
  if (perc < 50) {
    r = 255;
    g = Math.round(5.1 * perc);
  } else {
    g = 255;
    r = Math.round(510 - 5.10 * perc);
  }
  // eslint-disable-next-line no-unused-vars
  const h = r * 0x10000 + g * 0x100 + b * 0x1;
  return `rgba(${r}, ${g}, ${b}, 0.7)`;
}

const styles = function (feature) {
  if (isNaN(feature.get('total'))) {
    return [new Style({
      fill: new Fill({
        color: '#FFF'
      }),
      stroke: stroke
    })];
  } else {
    return [new Style({
      fill: new Fill({
        color: perc2color(feature.get('total'))
      }),
      stroke: stroke
    })];
  }
};

const nuts2Layer = new VectorLayer({
  source: nuts.nuts2Source,
  visible: false,
  style: styles,
  title: 'NUTS2 regions'
});

const nuts3Layer = new VectorLayer({
  source: nuts.nuts3Source,
  visible: true,
  style: styles,
  title: 'NUTS3 regions'
});
nuts3Layer.set('hoveredKeys', ['NUTS_NAME', 'totalForHumans', 'Social & Human', 'Anthropic', 'Institutional', 'Economical', 'Natural', 'Cultural']);
nuts3Layer.set('hoveredKeysTranslations', { NUTS_NAME: 'Name', totalForHumans: 'Calculated score' });

module.value('config', {
  proxyPrefix: '../8085/',
  default_layers: [
    new Tile({
      source: new OSM(),
      title: 'Open street map',
      base: true,
      editor: { editable: false },
      removable: false
    }),
    nuts2Layer,
    nuts3Layer
  ],
  project_name: 'erra/map',
  default_view: new View({
    center: [2433348.3022471312, 7744501.813885343],
    zoom: 3.6,
    units: 'm'
  }),
  advanced_form: true,
  datasources: [],
  hostname: {
    default: {
      title: 'Default',
      type: 'default',
      editable: false,
      url: getHostname()
    }
  },
  panelWidths: {
  },
  panelsEnabled: {
    language: false,
    composition_browser: false,
    legend: false,
    ows: false,
    info: false,
    saveMap: false,
    draw: false
  },
  searchProvider: (q) => {
    return `/app/jupyter-test/8085/search/?q=${q}`;
  }
});

module.controller('Main', ['$scope', 'Core', '$compile', 'hs.layout.service', 'pra.adjuster.service',
  function ($scope, Core, $compile, layoutService, adjusterService) {
    $scope.Core = Core;
    $scope.panelVisible = layoutService.panelVisible;
    layoutService.sidebarRight = false;
    // layoutService.sidebarToggleable = false;
    Core.singleDatasources = true;
    layoutService.sidebarButtons = true;
    layoutService.setDefaultPanel('adjuster');
    $scope.$on('scope_loaded', function (event, args) {
      // eslint-disable-next-line eqeqeq
      if (args == 'Sidebar') {
        const el = angular.element('<pra.adjuster hs.draggable ng-if="Core.exists(\'pra.adjuster\')" ng-show="panelVisible(\'adjuster\', this)"></pra.adjuster>')[0];
        layoutService.panelListElement.appendChild(el);
        $compile(el)($scope);

        const toolbarButton = angular.element('<div pra.adjuster.sidebar-btn></div>')[0];
        layoutService.sidebarListElement.appendChild(toolbarButton);
        $compile(toolbarButton)(event.targetScope);
      }
    });
  }
]);
