const L = require('leaflet');

const Node = L.Marker.extend({
  _routeIdPrevious: undefined,
  _routeIdNext: undefined,
  _promoted: false,
  _demoted: true,

  options: {
    type: 'waypoint', // Or 'stopover',
    colorName: 'blue',
    opacity: 1,
    draggable: true,
  },

  initialize(latlng, options) {
    L.Marker.prototype.initialize.call(this, latlng, options);
    L.setOptions(this, options);
    this.setType(this.options.type);
  },

  setType(type) {
    this.options.type = type;

    if (type === 'stopover') {
      this.setIcon(
        L.AwesomeMarkers.icon({
          icon: 'pause-circle',
          markerColor: this.options.colorName,
          prefix: 'fa',
        }),
      );
    } else {
      this.setIcon(
        L.AwesomeMarkers.icon({
          icon: 'map-signs',
          markerColor: this.options.colorName,
          prefix: 'fa',
        }),
      );
    }
    return this;
  },

  setStyle(style) {
    L.Util.setOptions(this, style);

    if ('colorName' in style) {
      // Colors is set only via the icon and there's no setter on L.AwesomeMarkers
      this.setType(this.options.type);
    }
    if ('opacity' in style) {
      this.setOpacity(this.options.opacity);
    }

    return this;
  },
});

module.exports = {
  Node,
  node(latlng, options) {
    return new Node(latlng, options);
  },
};
