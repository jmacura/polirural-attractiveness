import attractivity from '../Attractivity.json';
import nuts from 'nuts';

export default ['Core', 'hs.utils.service', '$rootScope', '$http',
    function (Core, utils, $rootScope, $http) {
        var me = {
            factors: [
                {
                    name: 'Natural',
                    column: 'N_index',
                    weight: 1
                },
                {
                    name: 'Social & Human',
                    column: 'S_index',
                    weight: 1
                },
                {
                    name: 'Anthropic',
                    column: 'A_index',
                    weight: 1
                },
                {
                    name: 'Economical',
                    column: 'E_index',
                    weight: 1
                },
                {
                    name: 'Cultural',
                    column: 'C_index',
                    weight: 1
                },
                {
                    name: 'Institutional',
                    column: 'I_index',
                    weight: 1
                }
            ],
            attractivity,
            apply() {
                let max = 0;
                me.attractivity.forEach(a => {
                    var sum = 0;
                    me.factors.filter(f => f.weight > 0).forEach(f => {
                        sum += a[f.column] * f.weight
                    });
                    a.total = sum;
                    if (sum > max) max = sum;
                });
                let normalizer = 1 / max;
                me.attractivity.forEach(a => {
                    a.total *= normalizer;
                })
                nuts.nuts3Source.forEachFeature(feature => {
                    feature.set('total', me.nutsCodeRecordRelations[feature.get('NUTS_ID')].total);
                    ['N_index', 'S_index', 'A_index', 'E_index', 'C_index', 'I_index'].forEach(column => {
                        feature.set(column, (me.nutsCodeRecordRelations[feature.get('NUTS_ID')][column] * 100).toFixed(2))
                    })
                })
            }
        };
        me.nutsCodeRecordRelations = {};
        me.attractivity.forEach(a => {
            me.nutsCodeRecordRelations[a.NUTS_ID] = a;
            me.factors.forEach(f => {
                a[f.column] = parseFloat(a[f.column].replace(',', '.'));
            });
        })
        return me;
    }
]