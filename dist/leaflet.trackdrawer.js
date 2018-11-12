(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
"use strict";

var colorMap = {
  red: '#D63E2A',
  orange: '#F59630',
  green: '#72B026',
  blue: '#38AADD',
  purple: '#D252B9',
  darkred: '#A23336',
  darkblue: '#0067A3',
  darkgreen: '#728224',
  darkpurple: '#5B396B',
  cadetblue: '#436978',
  lightred: '#FF8E7F',
  beige: '#FFCB92',
  lightgreen: '#BBF970',
  lightblue: '#8ADAFF',
  pink: '#FF91EA',
  white: '#FBFBFB',
  lightgray: '#A3A3A3',
  gray: '#575757',
  black: '#303030'
};
var colors = ['blue', 'green', 'orange', 'purple', 'red', 'darkblue', 'darkpurple', 'lightblue', 'lightgreen', 'beige', 'pink', 'lightred']; // Colors supported by Leaflet AwesomeMarkers

Object.freeze(colorMap);
Object.freeze(colors);
module.exports = {
  nameOf: function nameOf(idx) {
    return colors[idx % colors.length];
  },
  rgbOf: function rgbOf(idx) {
    return colorMap[this.nameOf(idx)];
  },
  nameToRgb: function nameToRgb(name) {
    return colorMap[name];
  },
  rgbToName: function rgbToName(rgb) {
    return Object.keys(colorMap).find(function (key) {
      return colorMap[key] === rgb;
    });
  }
};

},{}],2:[function(_dereq_,module,exports){
(function (global){
"use strict";

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

module.exports = L.Marker.extend({
  _routeIdPrevious: undefined,
  _routeIdNext: undefined,
  _promoted: false,
  _demoted: true,
  options: {
    type: 'waypoint',
    // Or 'stopover',
    colorName: 'blue',
    opacity: 1,
    draggable: true
  },
  initialize: function initialize(latlng, options) {
    L.Marker.prototype.initialize.call(this, latlng, options);
    L.setOptions(this, options);
    this.setType(this.options.type);
  },
  setType: function setType(type) {
    this.options.type = type;

    if (type === 'stopover') {
      this.setIcon(L.AwesomeMarkers.icon({
        icon: 'pause-circle',
        markerColor: this.options.colorName,
        prefix: 'fa'
      }));
    } else {
      this.setIcon(L.AwesomeMarkers.icon({
        icon: 'map-signs',
        markerColor: this.options.colorName,
        prefix: 'fa'
      }));
    }

    return this;
  },
  setStyle: function setStyle(style) {
    L.Util.setOptions(this, style);

    if ('colorName' in style) {
      // Colors is set only via the icon and there's no setter on L.AwesomeMarkers
      this.setType(this.options.type);
    }

    if ('opacity' in style) {
      this.setOpacity(this.options.opacity);
    }

    return this;
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(_dereq_,module,exports){
(function (global){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var Colors = _dereq_('./Colors');

function ArrayOfFeatureGroups(arr) {
  return Object.assign([], arr || [], {
    getLayer: function getLayer(id) {
      var parentLayer = this.find(function (x) {
        return x.getLayer(id) !== undefined;
      });
      return parentLayer !== undefined ? parentLayer.getLayer(id) : undefined;
    },
    getLayerId: function getLayerId(layer) {
      var parentLayer = this.find(function (x) {
        return x.hasLayer(layer);
      });
      return parentLayer !== undefined ? parentLayer.getLayerId(layer) : undefined;
    },
    getLayerIndex: function getLayerIndex(layer) {
      return this.findIndex(function (x) {
        return x.hasLayer(layer);
      });
    }
  });
}

function encodeLatLngs(latlngs) {
  var array = [];
  var size = latlngs.length;

  for (var i = 0; i < size; i += 1) {
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
  var array = [];
  var size = latlngs.length;

  for (var i = 0; i < size; i += 2) {
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
    debug: true
  },
  _getPrevious: function _getPrevious(node) {
    var previousEdge = node !== undefined ? this._getEdge(node._routeIdPrevious) : undefined;
    var previousNode = previousEdge !== undefined ? this._getNode(previousEdge._startMarkerId) : undefined;
    return {
      previousEdge: previousEdge,
      previousNode: previousNode
    };
  },
  _getNext: function _getNext(node) {
    var nextEdge = node !== undefined ? this._getEdge(node._routeIdNext) : undefined;
    var nextNode = nextEdge !== undefined ? this._getNode(nextEdge._endMarkerId) : undefined;
    return {
      nextEdge: nextEdge,
      nextNode: nextNode
    };
  },
  _getNodeId: function _getNodeId(node) {
    return this._nodesContainers.getLayerId(node);
  },
  _getEdgeId: function _getEdgeId(edge) {
    return this._edgesContainers.getLayerId(edge);
  },
  _getNode: function _getNode(id) {
    return this._nodesContainers.getLayer(id);
  },
  _getEdge: function _getEdge(id) {
    return this._edgesContainers.getLayer(id);
  },
  _getNodeContainerIndex: function _getNodeContainerIndex(node) {
    return this._nodesContainers.getLayerIndex(node);
  },
  _getNodeContainer: function _getNodeContainer(node) {
    return this._nodesContainers[this._getNodeContainerIndex(node)];
  },
  _getEdgeContainerIndex: function _getEdgeContainerIndex(edge) {
    return this._edgesContainers.getLayerIndex(edge);
  },
  _getEdgeContainer: function _getEdgeContainer(edge) {
    return this._edgesContainers[this._getEdgeContainerIndex(edge)];
  },
  initialize: function initialize(options) {
    var _this = this;

    L.setOptions(this, options);
    L.LayerGroup.prototype.initialize.call(this);
    this._nodesContainers = ArrayOfFeatureGroups([L.featureGroup().addTo(this)]);
    this._edgesContainers = ArrayOfFeatureGroups([L.featureGroup().addTo(this)]);
    this._currentContainerIndex = 0;
    this._firstNodeId = undefined;
    this._lastNodeId = undefined;
    this._currentColorIndex = 0;
    this._fireEvents = true;

    if (this.options.router !== undefined) {
      this.options.routingCallback = function (previousMarker, marker, done) {
        _this.options.router.route([L.Routing.waypoint(previousMarker.getLatLng()), L.Routing.waypoint(marker.getLatLng())], function (err, result) {
          done(err, result ? result[0].coordinates : null);
        });
      };
    }
  },
  getNodes: function getNodes() {
    var nodes = [];

    this._nodesContainers.forEach(function (container) {
      var group = container.getLayers();
      if (group.length > 0) nodes.push({
        container: container,
        markers: group
      });
    });

    return nodes;
  },
  getSteps: function getSteps() {
    var steps = [];

    this._edgesContainers.forEach(function (container) {
      var group = container.getLayers();
      if (group.length > 0) steps.push({
        container: container,
        edges: group
      });
    });

    return steps;
  },
  getState: function getState() {
    var _this2 = this;

    var state = [];

    var currentNode = this._getNode(this._firstNodeId);

    this._nodesContainers.forEach(function () {
      var group = [];

      do {
        var _this2$_getNext = _this2._getNext(currentNode),
            nextEdge = _this2$_getNext.nextEdge,
            nextNode = _this2$_getNext.nextNode;

        if (currentNode === undefined || nextEdge === undefined) {
          break;
        }

        group.push({
          start: encodeLatLng(currentNode.getLatLng()),
          end: encodeLatLng(nextNode.getLatLng()),
          edge: encodeLatLngs(nextEdge.getLatLngs())
        });
        currentNode = nextNode;
      } while (currentNode.options.type !== 'stopover');

      if (group.length > 0) state.push(group);
    });

    return state;
  },
  clean: function clean() {
    var _this3 = this;

    this._edgesContainers[0].clearLayers();

    this._nodesContainers[0].clearLayers();

    this._edgesContainers.splice(1).forEach(function (x) {
      return x.removeFrom(_this3);
    });

    this._nodesContainers.splice(1).forEach(function (x) {
      return x.removeFrom(_this3);
    });

    this._firstNodeId = undefined;
    this._lastNodeId = undefined;
    this._currentContainerIndex = 0;
    this._currentColorIndex = 0;
    if (this._fireEvents) this.fire('TrackDrawer:done', {});
    return this;
  },
  restoreState: function () {
    var _restoreState = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(state, nodeCallback) {
      var _this4 = this;

      var oldValue, stopovers, routes, promises, previousSegment, lastState, marker;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              oldValue = this._fireEvents;
              this._fireEvents = false;
              this.clean();
              stopovers = [];
              routes = [];
              promises = [];
              state.forEach(function (group, i) {
                group.forEach(function (segment, j) {
                  var marker = nodeCallback.call(null, decodeLatLng(segment.start));

                  if (j === 0 && i > 0) {
                    stopovers.push(marker);
                  }

                  promises.push(_this4.addNode(marker, function (from, to, done) {
                    var edge = decodeLatLngs(previousSegment.edge);
                    routes.push({
                      from: from,
                      to: to,
                      edge: edge
                    });
                    done(null, edge);
                  }));
                  previousSegment = segment;
                });
              });
              lastState = state[state.length - 1][state[state.length - 1].length - 1];
              marker = nodeCallback.call(null, decodeLatLng(lastState.end));
              promises.push(this.addNode(marker, function (from, to, done) {
                var edge = decodeLatLngs(lastState.edge);
                routes.push({
                  from: from,
                  to: to,
                  edge: edge
                });
                done(null, edge);
              }));
              _context.next = 12;
              return Promise.all(promises);

            case 12:
              stopovers.forEach(function (m) {
                return _this4.promoteNodeToStopover(m);
              });
              this._fireEvents = oldValue;
              if (this._fireEvents) this.fire('TrackDrawer:done', {
                routes: routes
              });
              return _context.abrupt("return", this);

            case 16:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function restoreState(_x, _x2) {
      return _restoreState.apply(this, arguments);
    };
  }(),
  addLayer: function addLayer(layer) {
    if (layer instanceof L.Marker) {
      this.addNode(layer);
    } else {
      L.LayerGroup.prototype.addLayer.call(this, layer);
    }
  },
  addNode: function addNode(node, routingCallback) {
    var _this5 = this;

    var callback = routingCallback || this.options.routingCallback;
    var nodesContainer = this._nodesContainers[this._currentContainerIndex];
    var edgesContainer = this._edgesContainers[this._currentContainerIndex];

    if (this.options.debug) {
      node.on('tooltipopen', function () {
        var _this5$_getPrevious = _this5._getPrevious(node),
            previousEdge = _this5$_getPrevious.previousEdge,
            previousNode = _this5$_getPrevious.previousNode;

        var _this5$_getNext = _this5._getNext(node),
            nextEdge = _this5$_getNext.nextEdge,
            nextNode = _this5$_getNext.nextNode;

        node.setTooltipContent("id: ".concat(_this5._getNodeId(node), " (on #").concat(_this5._getNodeContainerIndex(node), ")<br>") + "previous edge: ".concat(_this5._getEdgeId(previousEdge)) + " (on #".concat(_this5._getEdgeContainerIndex(previousEdge), ") to ").concat(_this5._getNodeId(previousNode), "<br>") + "next edge: ".concat(_this5._getEdgeId(nextEdge)) + " (on #".concat(_this5._getEdgeContainerIndex(nextEdge), ") to ").concat(_this5._getNodeId(nextNode)));
      });
      node.bindTooltip('<>');
    }

    node.addTo(nodesContainer);
    return new Promise(function (resolve, reject) {
      var resolveImmediately = _this5._lastNodeId === undefined;

      if (_this5._lastNodeId !== undefined) {
        var previousNode = _this5._getNode(_this5._lastNodeId);

        node.setStyle({
          colorName: previousNode.options.colorName
        });
        callback.call(null, previousNode, node, function (err, route) {
          if (err !== null) {
            reject(err);
            return;
          } // Route can give different precision than initial markers
          // Use precision given by the route to be consistent


          previousNode.setLatLng(L.latLng(route[0]));
          node.setLatLng(L.latLng(route[route.length - 1]));
          var edge = L.polyline(route, {
            color: Colors.nameToRgb(node.options.colorName)
          }).addTo(edgesContainer);
          var id = edgesContainer.getLayerId(edge);
          previousNode._routeIdNext = id;
          node._routeIdPrevious = id;
          edge._startMarkerId = _this5._getNodeId(previousNode);
          edge._endMarkerId = _this5._getNodeId(node);

          if (_this5.options.debug) {
            edge.on('tooltipopen', function () {
              var startNodeId = edge._startMarkerId;
              var endNodeId = edge._endMarkerId;
              edge.setTooltipContent("id: ".concat(_this5._getEdgeId(edge), " (on #").concat(_this5._getEdgeContainerIndex(edge), ")<br>") + "previous node: ".concat(startNodeId) + " (on #".concat(_this5._getNodeContainerIndex(_this5._getNode(startNodeId)), ")<br>") + "next node: ".concat(endNodeId) + " (on #".concat(_this5._getNodeContainerIndex(_this5._getNode(endNodeId)), ")"));
            });
            edge.bindTooltip('<>');
          }

          if (_this5._fireEvents) {
            _this5.fire('TrackDrawer:done', {
              routes: [{
                from: previousNode,
                to: node,
                edge: edge
              }]
            });
          }

          resolve();
        });
      } else {
        node.setStyle({
          colorName: Colors.nameOf(_this5._currentColorIndex)
        });
      }

      _this5._lastNodeId = _this5._getNodeId(node);

      if (_this5._firstNodeId === undefined) {
        _this5._firstNodeId = _this5._lastNodeId;
      }

      var oldValue = _this5._fireEvents;
      _this5._fireEvents = false;

      if (node.options.type === 'stopover') {
        _this5.promoteNodeToStopover(node);
      }

      _this5._fireEvents = oldValue;

      if (resolveImmediately) {
        resolve();
      }
    });
  },
  onMoveNode: function onMoveNode(marker, routingCallback) {
    var _this6 = this;

    var callback = routingCallback || this.options.routingCallback;
    var promises = [];

    var _this$_getPrevious = this._getPrevious(marker),
        previousEdge = _this$_getPrevious.previousEdge,
        previousNode = _this$_getPrevious.previousNode;

    var _this$_getNext = this._getNext(marker),
        nextEdge = _this$_getNext.nextEdge,
        nextNode = _this$_getNext.nextNode;

    if (previousEdge !== undefined) {
      promises.push(new Promise(function (resolve, reject) {
        callback.call(null, previousNode, marker, function (err, route) {
          if (err !== null) {
            reject(err);
            return;
          }

          marker.setLatLng(L.latLng(route[route.length - 1]));
          previousEdge.setLatLngs(route);
          resolve({
            from: previousNode,
            to: marker,
            edge: previousEdge
          });
        });
      }));
    }

    if (nextEdge !== undefined) {
      promises.push(new Promise(function (resolve, reject) {
        callback.call(null, marker, nextNode, function (err, route) {
          if (err !== null) {
            reject(err);
            return;
          }

          marker.setLatLng(L.latLng(route[0]));
          nextEdge.setLatLngs(route);
          resolve({
            from: marker,
            to: nextNode,
            edge: nextEdge
          });
        });
      }));
    }

    return Promise.all(promises).then(function (values) {
      if (_this6._fireEvents && values.length > 0) {
        _this6.fire('TrackDrawer:done', {
          routes: values
        });
      }
    });
  },
  removeNode: function removeNode(node, routingCallback) {
    var _this7 = this;

    var callback = routingCallback || this.options.routingCallback;
    var promises = [];
    var oldValue = this._fireEvents;
    this._fireEvents = false;
    this.demoteNodeToWaypoint(node);
    this._fireEvents = oldValue;

    var nodeContainer = this._getNodeContainer(node);

    var nodeContainerIndex = this._nodesContainers.indexOf(nodeContainer);

    var _this$_getPrevious2 = this._getPrevious(node),
        previousEdge = _this$_getPrevious2.previousEdge,
        previousNode = _this$_getPrevious2.previousNode;

    var _this$_getNext2 = this._getNext(node),
        nextEdge = _this$_getNext2.nextEdge,
        nextNode = _this$_getNext2.nextNode;

    if (previousEdge !== undefined && nextEdge !== undefined) {
      // Intermediate marker
      promises.push(new Promise(function (resolve, reject) {
        callback.call(null, previousNode, nextNode, function (err, route) {
          if (err !== null) {
            reject(err);
            return;
          }

          previousEdge.setLatLngs(route);
          nextNode._routeIdPrevious = node._routeIdPrevious;
          previousEdge._endMarkerId = nextEdge._endMarkerId;
          nextEdge.removeFrom(_this7._getEdgeContainer(nextEdge));
          node.removeFrom(nodeContainer);
          resolve({
            from: previousNode,
            to: nextNode,
            edge: previousEdge
          });
        });
      }));
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

    return Promise.all(promises).then(function (routes) {
      if (nodeContainerIndex > 0 && nodeContainer.getLayers().length === 0) {
        // Last marker of this layer
        _this7._nodesContainers.splice(nodeContainerIndex, 1)[0].removeFrom(_this7);

        _this7._edgesContainers.splice(nodeContainerIndex, 1)[0].removeFrom(_this7);

        _this7._currentContainerIndex -= 1;
      }

      if (_this7._fireEvents) {
        _this7.fire('TrackDrawer:done', {
          routes: routes
        });
      }
    });
  },
  promoteNodeToStopover: function promoteNodeToStopover(node) {
    var _this8 = this;

    if (node._promoted) {
      return this;
    }

    if (this._getNodeId(node) === this._firstNodeId) {
      node.setType('stopover');
      node._promoted = true;
      node._demoted = false;
      return this;
    }

    var index = this._getNodeContainerIndex(node);

    var nodes = [];
    var edges = [];
    var currentNode = node;

    do {
      nodes.push(currentNode);

      var _this$_getNext3 = this._getNext(currentNode),
          nextEdge = _this$_getNext3.nextEdge,
          nextNode = _this$_getNext3.nextNode;

      if (nextEdge === undefined) {
        break;
      }

      nodes.push(currentNode);
      edges.push(nextEdge);
      currentNode = nextNode;
    } while (currentNode.options.type !== 'stopover');

    var newNodesContainer = L.featureGroup();
    var newEdgesContainer = L.featureGroup();

    this._nodesContainers.splice(index + 1, 0, newNodesContainer);

    this._edgesContainers.splice(index + 1, 0, newEdgesContainer);

    this._currentContainerIndex += 1;
    this._currentColorIndex += 1;
    nodes.forEach(function (e) {
      e.removeFrom(_this8._getNodeContainer(e)).addTo(newNodesContainer);
    });
    edges.forEach(function (e) {
      e.removeFrom(_this8._getEdgeContainer(e)).addTo(newEdgesContainer);
    });
    newNodesContainer.setStyle({
      colorName: Colors.nameOf(this._currentColorIndex)
    });
    newEdgesContainer.setStyle({
      color: Colors.rgbOf(this._currentColorIndex)
    });
    node.setType('stopover');
    node._promoted = true;
    node._demoted = false;
    newNodesContainer.addTo(this);
    newEdgesContainer.addTo(this);
    if (this._fireEvents) this.fire('TrackDrawer:done', {});
    return this;
  },
  demoteNodeToWaypoint: function demoteNodeToWaypoint(node) {
    var _this9 = this;

    if (node._demoted) {
      return this;
    }

    var index = this._getNodeContainerIndex(node);

    if (index === 0) {
      return this;
    }

    var nodes = [];
    var edges = [];
    var currentNode = node;

    do {
      nodes.push(currentNode);

      var _this$_getNext4 = this._getNext(currentNode),
          nextEdge = _this$_getNext4.nextEdge,
          nextNode = _this$_getNext4.nextNode;

      if (nextEdge === undefined) {
        break;
      }

      nodes.push(currentNode);
      edges.push(nextEdge);
      currentNode = nextNode;
    } while (currentNode.options.type !== 'stopover');

    var previousNodesContainer = this._nodesContainers[index - 1];
    var previousEdgesContainer = this._edgesContainers[index - 1];

    this._nodesContainers.splice(index, 1)[0].removeFrom(this);

    this._edgesContainers.splice(index, 1)[0].removeFrom(this);

    this._currentContainerIndex -= 1;
    nodes.forEach(function (e) {
      e.removeFrom(_this9._getNodeContainer(e)).addTo(previousNodesContainer);
    });
    edges.forEach(function (e) {
      e.removeFrom(_this9._getEdgeContainer(e)).addTo(previousEdgesContainer);
    });

    var _this$_getPrevious3 = this._getPrevious(nodes[0]),
        previousEdge = _this$_getPrevious3.previousEdge,
        previousNode = _this$_getPrevious3.previousNode;

    if (previousEdge !== undefined) {
      previousNodesContainer.setStyle({
        colorName: previousNode.options.colorName
      });
      previousEdgesContainer.setStyle({
        color: previousEdge.options.color
      });
    }

    node.setType('waypoint');
    node._promoted = false;
    node._demoted = true;
    if (this._fireEvents) this.fire('TrackDrawer:done', {});
    return this;
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Colors":1}],4:[function(_dereq_,module,exports){
(function (global){
"use strict";

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var Track = _dereq_('./Track');

var Node = _dereq_('./Node');

var colors = _dereq_('./Colors');

L.TrackDrawer = {
  Track: Track,
  Node: Node,
  colors: colors,
  track: function track(options) {
    return new Track(options);
  },
  node: function node(latlng, options) {
    return new Node(latlng, options);
  }
};
module.exports = L.TrackDrawer;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Colors":1,"./Node":2,"./Track":3}]},{},[4]);
