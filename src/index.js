const L = require('leaflet');
const Track = require('./Track');
const LayerContainer = require('./LayerContainer');
const Node = require('./Node');
const colors = require('./Colors');

L.TrackDrawer = {
  Track,
  LayerContainer,
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
