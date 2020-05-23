const L = require('leaflet');
const { Track, track } = require('./Track');
const { ToolBar, toolBar } = require('./ToolBar');
const { TraceModeBar, traceModeBar } = require('./TraceModeBar');
const LayerContainer = require('./LayerContainer');
const { Node, node } = require('./Node');
const { Edge, edge } = require('./Edge');
const colors = require('./Colors');
require('./Loader');

/** @module L.TrackDrawer */
L.TrackDrawer = {
  Track,
  track,
  ToolBar,
  toolBar,
  TraceModeBar,
  traceModeBar,
  LayerContainer,
  Node,
  node,
  Edge,
  edge,
  colors,
};

module.exports = L.TrackDrawer;
