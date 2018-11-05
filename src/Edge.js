const L = require('leaflet');

module.exports = L.Polyline.extend({
  _startMarkerId: undefined,
  _endMarkerId: undefined,

  options: {},

  initialize(latlngs, options) {
    L.Polyline.prototype.initialize.call(this, latlngs, options);
    L.setOptions(this, options);
  },
});
