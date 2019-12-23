const L = require('leaflet');
const Colors = require('./Colors');
const LayerContainer = require('./LayerContainer');
const { Edge } = require('./Edge');

function encodeLatLngs(latlngs) {
  const array = [];
  const size = latlngs.length;
  for (let i = 0; i < size; i += 1) {
    array.push(latlngs[i].lat);
    array.push(latlngs[i].lng);
  }
  return array;

  /* polyline with precision of 8 seems broken

    var array = latlngs.map(function(x) {
      return [x.lat, x.lng];
    });

    return polyline.encode(array, 8); //
    */
}

function decodeLatLngs(latlngs) {
  const array = [];
  const size = latlngs.length;
  for (let i = 0; i < size; i += 2) {
    array.push(L.latLng(latlngs[i], latlngs[i + 1]));
  }
  return array;

  /* polyline with precision of 8 seems broken

    var decoded = polyline.decode(latlngs, 8);

    return decoded.map(function(x) {
      return L.latLng(x[0], x[1]);
    });
    */
}

function encodeLatLng(latlng) {
  return [latlng.lat, latlng.lng];
}

function decodeLatLng(latlng) {
  return L.latLng(latlng[0], latlng[1]);
}

const Track = L.LayerGroup.extend({
  options: {
    routingCallback: undefined,
    router: undefined,
    debug: false,
    undoable: true,
    undoDepth: 30,
  },

  _getPrevious(node) {
    const previousEdge = node !== undefined ? this._getEdge(node._routeIdPrevious) : undefined;
    const previousNode = previousEdge !== undefined ? this._getNode(previousEdge._startMarkerId) : undefined;
    return { previousEdge, previousNode };
  },

  _getNext(node) {
    const nextEdge = node !== undefined ? this._getEdge(node._routeIdNext) : undefined;
    const nextNode = nextEdge !== undefined ? this._getNode(nextEdge._endMarkerId) : undefined;
    return { nextEdge, nextNode };
  },

  _getNodeId(node) {
    return this._nodesContainers.getLayerId(node);
  },
  _getEdgeId(edge) {
    return this._edgesContainers.getLayerId(edge);
  },
  _getNode(id) {
    return this._nodesContainers.getLayer(id);
  },
  _getEdge(id) {
    return this._edgesContainers.getLayer(id);
  },
  _getNodeContainerIndex(node) {
    return this._nodesContainers.getLayerIndex(node);
  },
  _getNodeContainer(node) {
    return this._nodesContainers.get(this._getNodeContainerIndex(node));
  },
  _getEdgeContainerIndex(edge) {
    return this._edgesContainers.getLayerIndex(edge);
  },
  _getEdgeContainer(edge) {
    return this._edgesContainers.get(this._getEdgeContainerIndex(edge));
  },

  initialize(options) {
    this.setOptions(options);
    L.LayerGroup.prototype.initialize.call(this);

    this._nodesContainers = new LayerContainer(this);
    this._edgesContainers = new LayerContainer(this);
    this._firstNodeId = undefined;
    this._lastNodeId = undefined;
    this._currentColorIndex = 0;
    this._fireEvents = true;
    this._computing = 0;

    this._states = null;
    this._currentStateIndex = null;

    if (this.options.undoable) {
      this._states = [];
      this._states.push(this.getState());
      this._currentStateIndex = 0;
    }
  },

  setOptions(options) {
    L.setOptions(this, options);

    if (this.options.router !== undefined) {
      this.options.routingCallback = (previousMarker, marker, done) => {
        this.options.router.route(
          [L.Routing.waypoint(previousMarker.getLatLng()), L.Routing.waypoint(marker.getLatLng())],
          (err, result) => {
            done(err, result ? result[0].coordinates : null);
          },
        );
      };
    }
  },

  hasNodes(count = 1) {
    let counter = 0;
    this._nodesContainers.forEach((container) => {
      const group = container.getLayers();
      counter += group.length;
    });
    return counter >= count;
  },

  getNodes() {
    const nodes = [];

    this._nodesContainers.forEach((container) => {
      const group = container.getLayers();
      if (group.length > 0) nodes.push({ container, markers: group });
    });

    return nodes;
  },
  getNodesContainer() {
    return this._nodesContainers;
  },

  getSteps() {
    const steps = [];

    this._edgesContainers.forEach((container) => {
      const group = container.getLayers();
      if (group.length > 0) steps.push({ container, edges: group });
    });

    return steps;
  },
  getStepsContainer() {
    return this._edgesContainers;
  },

  getBounds() {
    const bounds = L.latLngBounds([]);

    this._nodesContainers.forEach((container) => {
      bounds.extend(container.getBounds());
    });

    this._edgesContainers.forEach((container) => {
      bounds.extend(container.getBounds());
    });
    return bounds;
  },

  getLatLngs() {
    const hasTrackStats = L.TrackStats !== undefined;
    const latlngs = [];

    let currentNode = this._getNode(this._firstNodeId);
    this._nodesContainers.forEach(() => {
      const l = [];
      do {
        const { nextEdge, nextNode } = this._getNext(currentNode);
        if (currentNode === undefined || nextEdge === undefined) {
          break;
        }

        nextEdge.getLatLngs().forEach((e) => {
          l.push(hasTrackStats ? L.TrackStats.cache.getAll(e) : e);
        });

        currentNode = nextNode;
      } while (currentNode.options.type !== 'stopover');

      latlngs.push(JSON.parse(JSON.stringify(l)));
    });

    return latlngs;
  },

  toGeoJSON(exportStopovers = true, exportAsFlat = false) {
    const geojson = {
      type: 'FeatureCollection',
      features: [],
    };

    if (exportStopovers) {
      let currentNode = this._getNode(this._firstNodeId);
      const stopovers = [];
      if (currentNode !== undefined) {
        stopovers.push(currentNode);
      }
      this._nodesContainers.forEach(() => {
        do {
          const { nextEdge, nextNode } = this._getNext(currentNode);
          if (currentNode === undefined || nextEdge === undefined) {
            break;
          }

          currentNode = nextNode;
        } while (currentNode.options.type !== 'stopover');

        if (currentNode !== undefined) {
          stopovers.push(currentNode);
        }
      });

      const hasTrackStats = L.TrackStats !== undefined;
      stopovers.forEach((node, idx) => {
        const e = hasTrackStats ? L.TrackStats.cache.getAll(node.getLatLng()) : node.getLatLng();
        geojson.features.push({
          type: 'Feature',
          properties: { index: idx },
          geometry: {
            type: 'Point',
            coordinates: 'z' in e && e.z !== null ? [e.lng, e.lat, e.z] : [e.lng, e.lat],
          },
        });
      });
    }

    const latlngs = this.getLatLngs();

    if (exportAsFlat) {
      const feature = {
        type: 'Feature',
        properties: { index: 0 },
        geometry: {
          type: 'LineString',
          coordinates: [],
        },
      };
      latlngs.forEach((l) => {
        l.forEach((e) => {
          feature.geometry.coordinates.push('z' in e && e.z !== null ? [e.lng, e.lat, e.z] : [e.lng, e.lat]);
        });
      });
      geojson.features.push(feature);
    } else {
      latlngs.forEach((l, idx) => {
        const feature = {
          type: 'Feature',
          properties: { index: idx },
          geometry: {
            type: 'LineString',
            coordinates: l.map(e => ('z' in e && e.z !== null ? [e.lng, e.lat, e.z] : [e.lng, e.lat])),
          },
        };
        geojson.features.push(feature);
      });
    }

    return geojson;
  },

  getState() {
    const state = [
      {
        version: 1,
        start: undefined,
      },
    ];
    let currentNode = this._getNode(this._firstNodeId);

    if (currentNode !== undefined) {
      state[0].start = encodeLatLng(currentNode.getLatLng());
    }

    this._nodesContainers.forEach(() => {
      const group = [];

      do {
        const { nextEdge, nextNode } = this._getNext(currentNode);
        if (currentNode === undefined || nextEdge === undefined) {
          break;
        }

        group.push({
          end: encodeLatLng(nextNode.getLatLng()),
          edge: encodeLatLngs(nextEdge.getLatLngs()),
        });

        currentNode = nextNode;
      } while (currentNode.options.type !== 'stopover');

      if (group.length > 0) state.push(group);
    });

    return state;
  },

  _fireStart(payload = {}) {
    if (this._fireEvents && this._computing === 0) this.fire('TrackDrawer:start', payload);
    this._computing += 1;
  },

  _fireDone(payload = {}) {
    this._computing -= 1;
    // TODO: find a way to store states while computing
    if (this._fireEvents && this._computing === 0) this._pushState();
    if (this._fireEvents && this._computing === 0) this.fire('TrackDrawer:done', payload);
  },

  _fireFailed(error) {
    this._computing -= 1;
    if (this._fireEvents && this._computing === 0) this.fire('TrackDrawer:failed', { message: error.message });
  },

  clean() {
    this._fireStart();
    this._edgesContainers.clean();
    this._nodesContainers.clean();

    this._firstNodeId = undefined;
    this._lastNodeId = undefined;
    this._currentColorIndex = 0;

    this._fireDone();
    return this;
  },

  _createNode(latlng) {
    return L.TrackDrawer.node(latlng);
  },

  async restoreState(state, nodeCallback) {
    const callback = nodeCallback || this._createNode;
    this._fireStart();

    const oldValue = this._fireEvents;
    this._fireEvents = false;
    this.clean();

    const stopovers = [];
    const routes = [];
    const promises = [];

    state.forEach((group, i) => {
      if (i === 0) {
        if (group.start) {
          const marker = callback.call(null, decodeLatLng(group.start));
          promises.push(
            this.addNode(
              marker,
              () => {
                throw new Error('Should not be called');
              },
              true,
            ),
          );
        }
        return;
      }

      group.forEach((segment, j) => {
        const marker = callback.call(null, decodeLatLng(segment.end));
        if (j === group.length - 1 && i < state.length - 1) {
          stopovers.push(marker);
        }

        promises.push(
          this.addNode(
            marker,
            (from, to, done) => {
              const edge = decodeLatLngs(segment.edge);
              routes.push({ from, to, edge });
              done(null, edge);
            },
            true,
          ),
        );
      });
    });

    await Promise.all(promises);

    stopovers.forEach(m => this.promoteNodeToStopover(m));

    this._fireEvents = oldValue;
    this._fireDone({ routes });
    return this;
  },

  _pushState() {
    if (this.options.undoable && !this._undoing) {
      if (this._currentStateIndex + 1 !== this._states.length) {
        this._states.splice(this._currentStateIndex + 1);
      }
      this._currentStateIndex += 1;
      this._states.push(this.getState());

      if (this._states.length - 1 > this.options.undoDepth) {
        this._states.splice(0, 1);
        this._currentStateIndex -= 1;
      }
    }
  },

  async undo(nodeCallback) {
    if (this.isUndoable() && this._computing === 0) {
      this._currentStateIndex -= 1;
      this._undoing = true;
      await this.restoreState(this._states[this._currentStateIndex], nodeCallback);
      this._undoing = false;
      return true;
    }
    return false;
  },

  isUndoable() {
    return this.options.undoable && this._currentStateIndex > 0;
  },

  isRedoable() {
    return this.options.undoable && this._currentStateIndex < this._states.length - 1;
  },

  async redo(nodeCallback) {
    if (this.isRedoable() && this._computing === 0) {
      this._currentStateIndex += 1;
      this._undoing = true;
      await this.restoreState(this._states[this._currentStateIndex], nodeCallback);
      this._undoing = false;
      return true;
    }
    return false;
  },

  addLayer(layer) {
    if (layer instanceof L.Marker) {
      this.addNode(layer);
    } else {
      L.LayerGroup.prototype.addLayer.call(this, layer);
    }
  },

  _createEdge(previousNode, node) {
    const edgesContainer = this._edgesContainers.get(this._getNodeContainerIndex(previousNode));
    const edge = new Edge([previousNode.getLatLng(), node.getLatLng()], {
      color: Colors.nameToRgb(previousNode.options.colorName),
      dashArray: '4',
    }).addTo(edgesContainer);
    const id = edgesContainer.getLayerId(edge);

    previousNode._routeIdNext = id;
    node._routeIdPrevious = id;
    edge._startMarkerId = this._getNodeId(previousNode);
    edge._endMarkerId = this._getNodeId(node);
    edge._computation = 0;

    if (this.options.debug) {
      edge.on('tooltipopen', () => {
        const startNodeId = edge._startMarkerId;
        const endNodeId = edge._endMarkerId;

        edge.setTooltipContent(
          `id: ${this._getEdgeId(edge)} (on #${this._getEdgeContainerIndex(edge)})<br>`
          + `previous node: ${startNodeId}`
          + ` (on #${this._getNodeContainerIndex(this._getNode(startNodeId))})<br>`
          + `next node: ${endNodeId}`
          + ` (on #${this._getNodeContainerIndex(this._getNode(endNodeId))})`,
        );
      });
      edge.bindTooltip('<>');
    }

    return edge;
  },

  _prepareNode(node, nodesContainer) {
    if (this.options.debug) {
      node.on('tooltipopen', () => {
        const { previousEdge, previousNode } = this._getPrevious(node);
        const { nextEdge, nextNode } = this._getNext(node);

        node.setTooltipContent(
          `id: ${this._getNodeId(node)} (on #${this._getNodeContainerIndex(node)})<br>`
          + `previous edge: ${this._getEdgeId(previousEdge)}`
          + ` (on #${this._getEdgeContainerIndex(previousEdge)}) to ${this._getNodeId(previousNode)}<br>`
          + `next edge: ${this._getEdgeId(nextEdge)}`
          + ` (on #${this._getEdgeContainerIndex(nextEdge)}) to ${this._getNodeId(nextNode)}`,
        );
      });
      node.bindTooltip('<>');
    }

    if (nodesContainer.getLayers().length > 0) {
      const previousNode = nodesContainer.getLayers()[0];
      node.setStyle({ colorName: previousNode.options.colorName });
    } else {
      node.setStyle({ colorName: Colors.nameOf(this._currentColorIndex) });
    }

    if (node.options.draggable) {
      node.on('dragstart', e => this._onDragStartNode(e.target));
      node.on('drag', e => this._onDragNode(e.target));
      node.on('moveend', e => this.onMoveNode(e.target));
    }

    node.addTo(nodesContainer);

    return this;
  },

  addNode(node, routingCallback, skipChecks = false) {
    const callback = routingCallback || this.options.routingCallback;

    if (this._lastNodeId !== undefined && !skipChecks) {
      const previousNode = this._getNode(this._lastNodeId);
      if (previousNode.getLatLng().equals(node.getLatLng())) {
        return new Promise((resolve) => {
          resolve();
        });
      }
    }

    this._fireStart();

    const nodesContainer = this._nodesContainers.get(-1);
    this._prepareNode(node, nodesContainer);

    if (this._lastNodeId !== undefined) {
      const previousNode = this._getNode(this._lastNodeId);
      this._createEdge(previousNode, node);
    }

    const lastNodeId = this._lastNodeId;
    this._lastNodeId = this._getNodeId(node);
    if (this._firstNodeId === undefined) {
      this._firstNodeId = this._lastNodeId;
    }

    const oldValue = this._fireEvents;
    this._fireEvents = false;
    if (node.options.type === 'stopover') {
      this.promoteNodeToStopover(node);
    }
    this._fireEvents = oldValue;

    if (lastNodeId === undefined) {
      return new Promise((resolve) => {
        resolve();
      }).then(() => {
        this._fireDone({});
      });
    }

    const { previousEdge, previousNode } = this._getPrevious(node);
    previousEdge._computation += 1;
    const currentComputation = previousEdge._computation;

    return new Promise((resolve, reject) => {
      callback.call(null, previousNode, node, (err, route) => {
        if (err !== null) {
          reject(err);
          return;
        }

        if (previousEdge._computation === currentComputation) {
          // Route can give different precision than initial markers
          // Use precision given by the route to be consistent
          previousNode.setLatLng(L.latLng(route[0]));
          node.setLatLng(L.latLng(route[route.length - 1]));
          previousEdge.setLatLngs(route);
          previousEdge.setStyle({ dashArray: null });
        }

        resolve({ routes: [{ from: previousNode, to: node, previousEdge }] });
      });
    })
      .then((routes) => {
        this._fireDone({ routes });
      })
      .catch((e) => {
        this._fireFailed(e);
      });
  },

  insertNode(node, route, routingCallback) {
    const callback = routingCallback || this.options.routingCallback;

    const startMarker = this._getNode(route._startMarkerId);
    const endMarker = this._getNode(route._endMarkerId);

    route.removeFrom(this._getEdgeContainer(route));
    this._prepareNode(node, this._getNodeContainer(startMarker));

    const edge1 = this._createEdge(startMarker, node);
    const edge2 = this._createEdge(node, endMarker);

    this._fireStart();

    edge1._computation += 1;
    edge2._computation += 1;
    const currentComputation1 = edge1._computation;
    const currentComputation2 = edge2._computation;

    const promise1 = new Promise((resolve, reject) => {
      callback.call(null, startMarker, node, (err, route1) => {
        if (err !== null) {
          reject(err);
          return;
        }

        if (edge1._computation === currentComputation1) {
          startMarker.setLatLng(L.latLng(route1[0]));
          node.setLatLng(L.latLng(route1[route1.length - 1]));
          edge1.setLatLngs(route1);
          edge1.setStyle({ dashArray: null });
        }
        resolve({ from: startMarker, to: node, edge: edge1 });
      });
    });

    const promise2 = new Promise((resolve, reject) => {
      callback.call(null, node, endMarker, (err, route2) => {
        if (err !== null) {
          reject(err);
          return;
        }

        if (edge2._computation === currentComputation2) {
          node.setLatLng(L.latLng(route2[0]));
          endMarker.setLatLng(L.latLng(route2[route2.length - 1]));
          edge2.setLatLngs(route2);
          edge2.setStyle({ dashArray: null });
        }
        resolve({ from: node, to: endMarker, edge: edge2 });
      });
    });

    return Promise.all([promise1, promise2])
      .then((routes) => {
        this._fireDone({ routes });
      })
      .catch((e) => {
        this._fireFailed(e);
      });
  },

  _onDragStartNode(marker) {
    const { previousEdge } = this._getPrevious(marker);
    const { nextEdge } = this._getNext(marker);
    if (previousEdge !== undefined) {
      previousEdge.setStyle({ dashArray: '4' });
    }
    if (nextEdge !== undefined) {
      nextEdge.setStyle({ dashArray: '4' });
    }
    return this;
  },

  _onDragNode(marker) {
    const { previousEdge, previousNode } = this._getPrevious(marker);
    const { nextEdge, nextNode } = this._getNext(marker);
    if (previousEdge !== undefined) {
      previousEdge.setLatLngs([previousNode.getLatLng(), marker.getLatLng()]);
    }
    if (nextEdge !== undefined) {
      nextEdge.setLatLngs([nextNode.getLatLng(), marker.getLatLng()]);
    }
    return this;
  },

  onMoveNode(marker, routingCallback) {
    const callback = routingCallback || this.options.routingCallback;

    const promises = [];
    const { previousEdge, previousNode } = this._getPrevious(marker);
    const { nextEdge, nextNode } = this._getNext(marker);

    this._fireStart();
    this._onDragStartNode(marker);
    this._onDragNode(marker);

    if (previousEdge !== undefined) {
      previousEdge._computation += 1;
      const currentComputation = previousEdge._computation;

      promises.push(
        new Promise((resolve, reject) => {
          callback.call(null, previousNode, marker, (err, route) => {
            if (err !== null) {
              reject(err);
              return;
            }

            if (previousEdge._computation === currentComputation) {
              marker.setLatLng(L.latLng(route[route.length - 1]));
              previousEdge.setLatLngs(route);
              previousEdge.setStyle({ dashArray: null });
            }

            resolve({ from: previousNode, to: marker, edge: previousEdge });
          });
        }),
      );
    }

    if (nextEdge !== undefined) {
      nextEdge._computation += 1;
      const currentComputation = nextEdge._computation;

      promises.push(
        new Promise((resolve, reject) => {
          callback.call(null, marker, nextNode, (err, route) => {
            if (err !== null) {
              reject(err);
              return;
            }

            if (nextEdge._computation === currentComputation) {
              marker.setLatLng(L.latLng(route[0]));
              nextEdge.setLatLngs(route);
              nextEdge.setStyle({ dashArray: null });
            }

            resolve({ from: marker, to: nextNode, edge: nextEdge });
          });
        }),
      );
    }

    return Promise.all(promises)
      .then((routes) => {
        this._fireDone({ routes });
      })
      .catch((e) => {
        this._fireFailed(e);
      });
  },

  removeNode(node, routingCallback) {
    const callback = routingCallback || this.options.routingCallback;

    const promises = [];

    this._fireStart();

    const oldValue = this._fireEvents;
    this._fireEvents = false;
    this.demoteNodeToWaypoint(node);
    this._fireEvents = oldValue;

    const nodeContainer = this._getNodeContainer(node);

    const { previousEdge, previousNode } = this._getPrevious(node);
    const { nextEdge, nextNode } = this._getNext(node);

    if (previousEdge !== undefined && nextEdge !== undefined) {
      // Intermediate marker
      nextNode._routeIdPrevious = node._routeIdPrevious;
      previousEdge._endMarkerId = nextEdge._endMarkerId;

      nextEdge.removeFrom(this._getEdgeContainer(nextEdge));
      node.removeFrom(nodeContainer);
      previousEdge.setLatLngs([previousNode.getLatLng(), nextNode.getLatLng()]).setStyle({ dashArray: '4' });

      previousEdge._computation += 1;
      const currentComputation = previousEdge._computation;

      promises.push(
        new Promise((resolve, reject) => {
          callback.call(null, previousNode, nextNode, (err, route) => {
            if (err !== null) {
              reject(err);
              return;
            }

            if (previousEdge._computation === currentComputation) {
              previousEdge.setLatLngs(route).setStyle({ dashArray: null });
            }

            resolve({ from: previousNode, to: nextNode, edge: previousEdge });
          });
        }),
      );
    } else if (previousEdge !== undefined) {
      // Last marker of path
      previousNode._routeIdNext = undefined;
      this._lastNodeId = previousEdge._startMarkerId;
      previousEdge.removeFrom(this._getEdgeContainer(previousEdge));
      node.removeFrom(nodeContainer);
    } else if (nextEdge !== undefined) {
      // First marker of path
      nextNode._routeIdPrevious = undefined;
      this._firstNodeId = nextEdge._endMarkerId;
      nextEdge.removeFrom(this._getEdgeContainer(nextEdge));
      node.removeFrom(nodeContainer);
    } else {
      // Lonely marker
      this._lastNodeId = undefined;
      this._firstNodeId = undefined;
      node.removeFrom(nodeContainer);
    }

    return Promise.all(promises)
      .then((routes) => {
        this._fireDone({ routes });
      })
      .catch((e) => {
        this._fireFailed(e);
      });
  },

  promoteNodeToStopover(node) {
    if (node._promoted) {
      return this;
    }

    if (this._getNodeId(node) === this._firstNodeId) {
      node.setType('stopover');
      node._promoted = true;
      node._demoted = false;
      return this;
    }

    this._fireStart();

    const index = this._getNodeContainerIndex(node);

    const nodes = [];
    const edges = [];

    let currentNode = node;
    do {
      nodes.push(currentNode);
      const { nextEdge, nextNode } = this._getNext(currentNode);
      if (nextEdge === undefined) {
        break;
      }

      nodes.push(currentNode);
      edges.push(nextEdge);

      currentNode = nextNode;
    } while (currentNode.options.type !== 'stopover');

    const newNodesContainer = L.featureGroup();
    const newEdgesContainer = L.featureGroup();

    this._nodesContainers.splice(index + 1, 0, newNodesContainer);
    this._edgesContainers.splice(index + 1, 0, newEdgesContainer);
    this._currentColorIndex += 1;

    nodes.forEach((e) => {
      e.removeFrom(this._getNodeContainer(e)).addTo(newNodesContainer);
    });
    edges.forEach((e) => {
      e.removeFrom(this._getEdgeContainer(e)).addTo(newEdgesContainer);
    });

    newNodesContainer.setStyle({ colorName: Colors.nameOf(this._currentColorIndex) });
    newEdgesContainer.setStyle({ color: Colors.rgbOf(this._currentColorIndex) });

    node.setType('stopover');
    node._promoted = true;
    node._demoted = false;

    this._fireDone();
    return this;
  },

  demoteNodeToWaypoint(node) {
    if (node._demoted) {
      return this;
    }

    const index = this._getNodeContainerIndex(node);
    if (index === 0) {
      return this;
    }

    this._fireStart();

    const nodes = [];
    const edges = [];

    let currentNode = node;
    do {
      nodes.push(currentNode);
      const { nextEdge, nextNode } = this._getNext(currentNode);
      if (nextEdge === undefined) {
        break;
      }

      nodes.push(currentNode);
      edges.push(nextEdge);

      currentNode = nextNode;
    } while (currentNode.options.type !== 'stopover');

    const previousNodesContainer = this._nodesContainers.get(index - 1);
    const previousEdgesContainer = this._edgesContainers.get(index - 1);

    this._nodesContainers.splice(index, 1);
    this._edgesContainers.splice(index, 1);

    nodes.forEach((e) => {
      e.removeFrom(this._getNodeContainer(e)).addTo(previousNodesContainer);
    });
    edges.forEach((e) => {
      e.removeFrom(this._getEdgeContainer(e)).addTo(previousEdgesContainer);
    });

    const { previousEdge, previousNode } = this._getPrevious(nodes[0]);
    if (previousEdge !== undefined) {
      previousNodesContainer.setStyle({ colorName: previousNode.options.colorName });
      previousEdgesContainer.setStyle({ color: previousEdge.options.color });
    }

    node.setType('waypoint');
    node._promoted = false;
    node._demoted = true;

    this._fireDone();
    return this;
  },
});

module.exports = {
  Track,
  track(options) {
    return new Track(options);
  },
};
