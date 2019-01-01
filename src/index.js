const L = require('leaflet');
const Track = require('./Track');
const Control = require('./Control');
const TraceModeBar = require('./TraceModeBar');
const LayerContainer = require('./LayerContainer');
const Node = require('./Node');
const colors = require('./Colors');

L.TrackDrawer = {
  Track,
  Control,
  TraceModeBar,
  LayerContainer,
  Node,
  colors,

  track(options) {
    return new Track(options);
  },
  control(track, options) {
    return new Control(track, options);
  },
  traceModeBar(track, modes, options) {
    return new TraceModeBar(track, modes, options);
  },
  node(latlng, options) {
    return new Node(latlng, options);
  },
};

module.exports = L.TrackDrawer;
