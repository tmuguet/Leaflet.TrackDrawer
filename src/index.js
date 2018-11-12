const L = require('leaflet');
const Track = require('./Track');
const Node = require('./Node');
const colors = require('./Colors');

L.TrackDrawer = {
  Track,
  Node,
  colors,

  track(options) {
    return new Track(options);
  },
  node(latlng, options) {
    return new Node(latlng, options);
  },
};

module.exports = L.TrackDrawer;
