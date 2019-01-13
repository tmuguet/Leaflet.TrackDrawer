const L = require('leaflet');

const Edge = L.Polyline.extend({
  _startMarkerId: undefined,
  _endMarkerId: undefined,
  _promoted: false,
  _demoted: true,
  _computation: 0,

  options: {},

  initialize(latlngs, options) {
    L.Polyline.prototype.initialize.call(this, latlngs, options);
    L.setOptions(this, options);
  },
});

module.exports = {
  Edge,
  edge(latlngs, options) {
    return new Edge(latlngs, options);
  },
};
