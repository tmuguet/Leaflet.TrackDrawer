'use strict';

const L = require('leaflet');
const { Track, track } = require('./Track');
const { ToolBar, toolBar } = require('./ToolBar');
const { TraceModeBar, traceModeBar } = require('./TraceModeBar');
const LayerContainer = require('./LayerContainer');
const { Node, node } = require('./Node');
const { Edge, edge } = require('./Edge');
const colors = require('./Colors');
require('./Loader');
const latlngutils = require('./LatLngUtils');

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
  latlngutils,
};

module.exports = L.TrackDrawer;
//# sourceMappingURL=leaflet.trackdrawer.cjs.js.map
