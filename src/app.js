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
import { transform, transformExtent } from 'ol/proj';
import { Tile, Group, Image as ImageLayer } from 'ol/layer';
import { TileWMS, WMTS, OSM, XYZ, TileArcGISRest } from 'ol/source';
import { Style, Icon, Stroke, Fill, Circle, Text } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import './adjuster/adjuster.module';
import nuts from 'nuts';

var module = angular.module('hs', [
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

function getHostname() {
    var url = window.location.href
    var urlArr = url.split("/");
    var domain = urlArr[2];
    return urlArr[0] + "//" + domain;
};


var stroke = new Stroke({
    color: '#3399CC',
    width: 0.25
});

function perc2color(perc) {
    perc = perc * 100;
	var r, g, b = 0;
	if(perc < 50) {
		r = 255;
		g = Math.round(5.1 * perc);
	}
	else {
		g = 255;
		r = Math.round(510 - 5.10 * perc);
	}
	var h = r * 0x10000 + g * 0x100 + b * 0x1;
	return `rgba(${r}, ${g}, ${b}, 0.7)`;
}

var styles = function(feature){
    if(isNaN(feature.get('total'))){
        return [new Style({
            fill:  new Fill({
                color: '#FFF'
            }),
            stroke: stroke
        })]
    } else
    return [new Style({
        fill:  new Fill({
            color: perc2color(feature.get('total'))
        }),
        stroke: stroke
    })]
};

var nuts2Layer = new VectorLayer({
    source: nuts.nuts2Source,
    visible: false,
    style: styles,
    title: 'NUTS2 regions'
});


var nuts3Layer = new VectorLayer({
    source: nuts.nuts3Source,
    visible: true,
    style: styles,
    title: 'NUTS3 regions',
});
nuts3Layer.set('hoveredKeys', ['NUTS_NAME', 'N_index', 'S_index', 'A_index', 'E_index', 'C_index', 'I_index']);
nuts3Layer.set('hoveredKeysTranslations', {'NUTS_NAME': 'Name', 'N_index':'Natural', 'S_index': 'Social & Health', 'A_index': 'Anthropic', 'E_index': 'Economical', 'C_index': 'Cultural', 'I_index': 'Institutional'});



module.value('config', {
    proxyPrefix: "/proxy/",
    default_layers: [
        new Tile({
            source: new OSM(),
            title: "Open street map",
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
        units: "m"
    }),
    advanced_form: true,
    datasources: [],
    hostname: {
        "default": {
            "title": "Default",
            "type": "default",
            "editable": false,
            "url": getHostname()
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
    }
});

module.controller('Main', ['$scope', 'Core', '$compile', 'hs.layout.service', 'pra.adjuster.service',
    function ($scope, Core, $compile, layoutService, adjusterService) {
        $scope.Core = Core;
        $scope.panelVisible = layoutService.panelVisible;
        layoutService.sidebarRight = false;
        //layoutService.sidebarToggleable = false;
        Core.singleDatasources = true;
        layoutService.sidebarButtons = true;
        layoutService.setDefaultPanel('adjuster');
        adjusterService.apply();
        $scope.$on("scope_loaded", function (event, args) {
            if (args == 'Sidebar') {
                var el = angular.element('<pra.adjuster hs.draggable ng-if="Core.exists(\'pra.adjuster\')" ng-show="panelVisible(\'adjuster\', this)"></pra.adjuster>')[0];
                document.querySelector('#panelplace').appendChild(el);
                $compile(el)($scope);

                var toolbar_button = angular.element('<div pra.adjuster.sidebar-btn></div>')[0];
                document.querySelector('.sidebar-list').appendChild(toolbar_button);
                $compile(toolbar_button)(event.targetScope);
            }
        })
    }
]);

