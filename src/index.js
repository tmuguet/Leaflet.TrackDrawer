const L = require('leaflet');
const Track = require('./Track');
const Control = require('./Control');
const LayerContainer = require('./LayerContainer');
const Node = require('./Node');
const colors = require('./Colors');

L.TrackDrawer = {
  Track,
  Control,
  LayerContainer,
  Node,
  colors,

  track(options) {
    return new Track(options);
  },
  control(track, options) {
    return new Control(track, options);
  },
  node(latlng, options) {
    return new Node(latlng, options);
  },
};

module.exports = L.TrackDrawer;
