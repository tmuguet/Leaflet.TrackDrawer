const L = require('leaflet');
const { Track, track } = require('./Track');
const { Control, control } = require('./Control');
const { TraceModeBar, traceModeBar } = require('./TraceModeBar');
const LayerContainer = require('./LayerContainer');
const { Node, node } = require('./Node');
const colors = require('./Colors');

L.TrackDrawer = {
  Track,
  track,
  Control,
  control,
  TraceModeBar,
  traceModeBar,
  LayerContainer,
  Node,
  node,
  colors,
};

module.exports = L.TrackDrawer;
