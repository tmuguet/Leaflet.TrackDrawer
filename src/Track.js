const L = require('leaflet');
const Colors = require('./Colors');

function ArrayOfFeatureGroups(arr) {
  return Object.assign([], arr || [], {
    getLayer(id) {
      const parentLayer = this.find(x => x.getLayer(id) !== undefined);
      return parentLayer !== undefined ? parentLayer.getLayer(id) : undefined;
    },
    getLayerId(layer) {
      const parentLayer = this.find(x => x.hasLayer(layer));
      return parentLayer !== undefined ? parentLayer.getLayerId(layer) : undefined;
    },
    getLayerIndex(layer) {
      return this.findIndex(x => x.hasLayer(layer));
    },
  });
}

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

module.exports = L.LayerGroup.extend({
  options: {
    routingCallback: undefined,
    router: undefined,
    debug: true,
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
    return this._nodesContainers[this._getNodeContainerIndex(node)];
  },
  _getEdgeContainerIndex(edge) {
    return this._edgesContainers.getLayerIndex(edge);
  },
  _getEdgeContainer(edge) {
    return this._edgesContainers[this._getEdgeContainerIndex(edge)];
  },

  initialize(options) {
    L.setOptions(this, options);
    L.LayerGroup.prototype.initialize.call(this);

    this._nodesContainers = ArrayOfFeatureGroups([L.featureGroup().addTo(this)]);
    this._edgesContainers = ArrayOfFeatureGroups([L.featureGroup().addTo(this)]);
    this._currentContainerIndex = 0;
    this._firstNodeId = undefined;
    this._lastNodeId = undefined;
    this._currentColorIndex = 0;
    this._fireEvents = true;
    this._computing = 0;

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

  getNodes() {
    const nodes = [];

    this._nodesContainers.forEach((container) => {
      const group = container.getLayers();
      if (group.length > 0) nodes.push({ container, markers: group });
    });

    return nodes;
  },

  getSteps() {
    const steps = [];

    this._edgesContainers.forEach((container) => {
      const group = container.getLayers();
      if (group.length > 0) steps.push({ container, edges: group });
    });

    return steps;
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

  toGeoJSON() {
    const geojson = {
      type: 'FeatureCollection',
      features: [],
    };

    this._nodesContainers.forEach((container) => {
      geojson.features.push(...container.toGeoJSON().features);
    });

    const latlngs = this.getLatLngs();

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

    return geojson;
  },

  getState() {
    const state = [];
    let currentNode = this._getNode(this._firstNodeId);

    this._nodesContainers.forEach(() => {
      const group = [];

      do {
        const { nextEdge, nextNode } = this._getNext(currentNode);
        if (currentNode === undefined || nextEdge === undefined) {
          break;
        }

        group.push({
          start: encodeLatLng(currentNode.getLatLng()),
          end: encodeLatLng(nextNode.getLatLng()),
          edge: encodeLatLngs(nextEdge.getLatLngs()),
        });

        currentNode = nextNode;
      } while (currentNode.options.type !== 'stopover');

      if (group.length > 0) state.push(group);
    });

    return state;
  },

  clean() {
    this._edgesContainers[0].clearLayers();
    this._nodesContainers[0].clearLayers();

    this._edgesContainers.splice(1).forEach(x => x.removeFrom(this));
    this._nodesContainers.splice(1).forEach(x => x.removeFrom(this));

    this._firstNodeId = undefined;
    this._lastNodeId = undefined;
    this._currentContainerIndex = 0;
    this._currentColorIndex = 0;

    if (this._fireEvents) this.fire('TrackDrawer:done', {});

    return this;
  },

  async restoreState(state, nodeCallback) {
    const oldValue = this._fireEvents;
    this._fireEvents = false;
    this.clean();

    const stopovers = [];
    const routes = [];
    const promises = [];
    let previousSegment;

    state.forEach((group, i) => {
      group.forEach((segment, j) => {
        const marker = nodeCallback.call(null, decodeLatLng(segment.start));
        if (j === 0 && i > 0) {
          stopovers.push(marker);
        }

        promises.push(
          this.addNode(marker, (from, to, done) => {
            const edge = decodeLatLngs(previousSegment.edge);
            routes.push({ from, to, edge });
            done(null, edge);
          }),
        );
        previousSegment = segment;
      });
    });

    const lastState = state[state.length - 1][state[state.length - 1].length - 1];
    const marker = nodeCallback.call(null, decodeLatLng(lastState.end));
    promises.push(
      this.addNode(marker, (from, to, done) => {
        const edge = decodeLatLngs(lastState.edge);
        routes.push({ from, to, edge });
        done(null, edge);
      }),
    );

    await Promise.all(promises);

    stopovers.forEach(m => this.promoteNodeToStopover(m));

    this._fireEvents = oldValue;
    if (this._fireEvents) this.fire('TrackDrawer:done', { routes });

    return this;
  },

  addLayer(layer) {
    if (layer instanceof L.Marker) {
      this.addNode(layer);
    } else {
      L.LayerGroup.prototype.addLayer.call(this, layer);
    }
  },

  addNode(node, routingCallback) {
    const callback = routingCallback || this.options.routingCallback;

    const lastNodeId = this._lastNodeId;

    if (lastNodeId !== undefined) {
      const previousNode = this._getNode(this._lastNodeId);
      if (previousNode.getLatLng().equals(node.getLatLng())) {
        return new Promise((resolve) => {
          resolve();
        });
      }
    }

    const nodesContainer = this._nodesContainers[this._currentContainerIndex];
    const edgesContainer = this._edgesContainers[this._currentContainerIndex];

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
    node.addTo(nodesContainer);

    if (lastNodeId !== undefined) {
      const previousNode = this._getNode(lastNodeId);
      node.setStyle({ colorName: previousNode.options.colorName });

      const edge = L.polyline([previousNode.getLatLng(), node.getLatLng()], {
        color: Colors.nameToRgb(node.options.colorName),
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

      if (this._fireEvents && this._computing === 0) {
        this.fire('TrackDrawer:start', {});
      }
    } else {
      node.setStyle({ colorName: Colors.nameOf(this._currentColorIndex) });
    }

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
      });
    }

    this._computing += 1;
    const { previousEdge, previousNode } = this._getPrevious(node);
    previousEdge._computation += 1;
    const currentComputation = previousEdge._computation;

    return new Promise((resolve, reject) => {
      callback.call(null, previousNode, node, (err, route) => {
        this._computing -= 1;

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

        if (this._fireEvents && this._computing === 0) {
          this.fire('TrackDrawer:done', { routes: [{ from: previousNode, to: node, previousEdge }] });
        }
        resolve();
      });
    });
  },

  onMoveNode(marker, routingCallback) {
    const callback = routingCallback || this.options.routingCallback;

    const promises = [];
    const { previousEdge, previousNode } = this._getPrevious(marker);
    const { nextEdge, nextNode } = this._getNext(marker);

    if (this._fireEvents && this._computing === 0) {
      this.fire('TrackDrawer:start', {});
    }

    this._computing += 1;

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
            }

            resolve({ from: marker, to: nextNode, edge: nextEdge });
          });
        }),
      );
    }

    return Promise.all(promises)
      .finally(() => {
        this._computing -= 1;
      })
      .then((values) => {
        if (this._fireEvents && values.length > 0 && this._computing === 0) {
          this.fire('TrackDrawer:done', { routes: values });
        }
      });
  },

  removeNode(node, routingCallback) {
    const callback = routingCallback || this.options.routingCallback;

    const promises = [];

    if (this._fireEvents && this._computing === 0) {
      this.fire('TrackDrawer:start', {});
    }
    this._computing += 1;

    const oldValue = this._fireEvents;
    this._fireEvents = false;
    this.demoteNodeToWaypoint(node);
    this._fireEvents = oldValue;

    const nodeContainer = this._getNodeContainer(node);
    const nodeContainerIndex = this._nodesContainers.indexOf(nodeContainer);

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
      .finally(() => {
        this._computing -= 1;
      })
      .then((routes) => {
        if (this._fireEvents && this._computing === 0) {
          this.fire('TrackDrawer:done', { routes });
        }
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

    if (this._fireEvents && this._computing === 0) {
      this.fire('TrackDrawer:start', {});
    }

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
    this._currentContainerIndex += 1;
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

    newNodesContainer.addTo(this);
    newEdgesContainer.addTo(this);

    if (this._fireEvents && this._computing === 0) {
      this.fire('TrackDrawer:done', {});
    }

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

    if (this._fireEvents && this._computing === 0) {
      this.fire('TrackDrawer:start', {});
    }

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

    const previousNodesContainer = this._nodesContainers[index - 1];
    const previousEdgesContainer = this._edgesContainers[index - 1];

    this._nodesContainers.splice(index, 1)[0].removeFrom(this);
    this._edgesContainers.splice(index, 1)[0].removeFrom(this);
    this._currentContainerIndex -= 1;

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

    if (this._fireEvents && this._computing === 0) {
      this.fire('TrackDrawer:done', {});
    }

    return this;
  },
});
