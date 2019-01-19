[Leaflet.TrackDrawer](../README.md) > ["leaflet"](../modules/_leaflet_.md) > [TrackDrawer](../modules/_leaflet_.trackdrawer.md)

# Module: TrackDrawer

TrackDrawer

Usage sample:

```javascript
var track = L.TrackDrawer.track({
routingCallback: function(markerStart, markerEnd, done) {
// Do stuff
var latlngs = [markerStart.getLatLng(), markerEnd.getLatLng()];
done(null, latlngs);
},
}).addTo(map);

// With Leaflet Routing Machine
var track = L.TrackDrawer.track({
router: L.Routing.osrmv1(),
}).addTo(map);
```

## Index

### Modules

* [colors](_leaflet_.trackdrawer.colors.md)

### Enumerations

* [NodeType](../enums/_leaflet_.trackdrawer.nodetype.md)

### Classes

* [Edge](../classes/_leaflet_.trackdrawer.edge.md)
* [LayerContainer](../classes/_leaflet_.trackdrawer.layercontainer.md)
* [Node](../classes/_leaflet_.trackdrawer.node.md)
* [ToolBar](../classes/_leaflet_.trackdrawer.toolbar.md)
* [TraceModeBar](../classes/_leaflet_.trackdrawer.tracemodebar.md)
* [Track](../classes/_leaflet_.trackdrawer.track.md)

### Interfaces

* [EdgesList](../interfaces/_leaflet_.trackdrawer.edgeslist.md)
* [NodeOptions](../interfaces/_leaflet_.trackdrawer.nodeoptions.md)
* [NodesList](../interfaces/_leaflet_.trackdrawer.nodeslist.md)
* [RouteInfo](../interfaces/_leaflet_.trackdrawer.routeinfo.md)
* [ToolBarMode](../interfaces/_leaflet_.trackdrawer.toolbarmode.md)
* [ToolBarOptions](../interfaces/_leaflet_.trackdrawer.toolbaroptions.md)
* [TraceMode](../interfaces/_leaflet_.trackdrawer.tracemode.md)
* [TraceModeBarOptions](../interfaces/_leaflet_.trackdrawer.tracemodebaroptions.md)
* [TrackOptions](../interfaces/_leaflet_.trackdrawer.trackoptions.md)

### Type aliases

* [LayerId](_leaflet_.trackdrawer.md#layerid)
* [NodeCreationCallback](_leaflet_.trackdrawer.md#nodecreationcallback)
* [RoutingCallback](_leaflet_.trackdrawer.md#routingcallback)
* [State](_leaflet_.trackdrawer.md#state)
* [TrackLayer](_leaflet_.trackdrawer.md#tracklayer)

### Functions

* [edge](_leaflet_.trackdrawer.md#edge-1)
* [node](_leaflet_.trackdrawer.md#node-1)
* [toolBar](_leaflet_.trackdrawer.md#toolbar-1)
* [traceModeBar](_leaflet_.trackdrawer.md#tracemodebar-1)
* [track](_leaflet_.trackdrawer.md#track-1)

---

## Type aliases

<a id="layerid"></a>

###  LayerId

**Ƭ LayerId**: *`Number`*

Leaflet's internal layer ID

___
<a id="nodecreationcallback"></a>

###  NodeCreationCallback

**Ƭ NodeCreationCallback**: *`function`*

Function that can be implemented to create a custom node.

Color of the node will be (re)set by this plugin.

Example:

```javascript
function(latlng) {
var marker = L.TrackDrawer.node(latlng);
ctrl._bindMarkerEvents(marker);
return marker;
}
```

#### Type declaration
▸(latlng: *`LatLngExpression`*): [Node](../classes/_leaflet_.trackdrawer.node.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| latlng | `LatLngExpression` |

**Returns:** [Node](../classes/_leaflet_.trackdrawer.node.md)

___
<a id="routingcallback"></a>

###  RoutingCallback

**Ƭ RoutingCallback**: *`function`*

Function to implement to compute the route between two markers. Once computation is done, must call `done(null, <result>)` if successful, or `done(<error>)` if failure.

Example:

```javascript
function(previousMarker, marker, done) {
done(null, [previousMarker.getLatLng(), marker.getLatLng()]);
}
```

#### Type declaration
▸(previousMarker: *[Node](../classes/_leaflet_.trackdrawer.node.md)*, marker: *[Node](../classes/_leaflet_.trackdrawer.node.md)*, done: *`function`*): `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| previousMarker | [Node](../classes/_leaflet_.trackdrawer.node.md) |
| marker | [Node](../classes/_leaflet_.trackdrawer.node.md) |
| done | `function` |

**Returns:** `void`

___
<a id="state"></a>

###  State

**Ƭ State**: *`object`*

___
<a id="tracklayer"></a>

###  TrackLayer

**Ƭ TrackLayer**: *[Node](../classes/_leaflet_.trackdrawer.node.md) | [Edge](../classes/_leaflet_.trackdrawer.edge.md)*

Layers handled by this plugin

___

## Functions

<a id="edge-1"></a>

###  edge

▸ **edge**(latlngs: *`LatLngExpression`[]*, options?: *`PolylineOptions`*): [Edge](../classes/_leaflet_.trackdrawer.edge.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| latlngs | `LatLngExpression`[] |
| `Optional` options | `PolylineOptions` |

**Returns:** [Edge](../classes/_leaflet_.trackdrawer.edge.md)

___
<a id="node-1"></a>

###  node

▸ **node**(latlng: *`LatLngExpression`*, options?: *[NodeOptions](../interfaces/_leaflet_.trackdrawer.nodeoptions.md)*): [Node](../classes/_leaflet_.trackdrawer.node.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| latlng | `LatLngExpression` |
| `Optional` options | [NodeOptions](../interfaces/_leaflet_.trackdrawer.nodeoptions.md) |

**Returns:** [Node](../classes/_leaflet_.trackdrawer.node.md)

___
<a id="toolbar-1"></a>

###  toolBar

▸ **toolBar**(track: *[Track](../classes/_leaflet_.trackdrawer.track.md)*, options?: *[ToolBarOptions](../interfaces/_leaflet_.trackdrawer.toolbaroptions.md)*): [ToolBar](../classes/_leaflet_.trackdrawer.toolbar.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| track | [Track](../classes/_leaflet_.trackdrawer.track.md) |
| `Optional` options | [ToolBarOptions](../interfaces/_leaflet_.trackdrawer.toolbaroptions.md) |

**Returns:** [ToolBar](../classes/_leaflet_.trackdrawer.toolbar.md)

___
<a id="tracemodebar-1"></a>

###  traceModeBar

▸ **traceModeBar**(track: *[Track](../classes/_leaflet_.trackdrawer.track.md)*, modes: *[TraceMode](../interfaces/_leaflet_.trackdrawer.tracemode.md)[]*, options?: *[TraceModeBarOptions](../interfaces/_leaflet_.trackdrawer.tracemodebaroptions.md)*): [TraceModeBar](../classes/_leaflet_.trackdrawer.tracemodebar.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| track | [Track](../classes/_leaflet_.trackdrawer.track.md) |
| modes | [TraceMode](../interfaces/_leaflet_.trackdrawer.tracemode.md)[] |
| `Optional` options | [TraceModeBarOptions](../interfaces/_leaflet_.trackdrawer.tracemodebaroptions.md) |

**Returns:** [TraceModeBar](../classes/_leaflet_.trackdrawer.tracemodebar.md)

___
<a id="track-1"></a>

###  track

▸ **track**(options?: *[TrackOptions](../interfaces/_leaflet_.trackdrawer.trackoptions.md)*): [Track](../classes/_leaflet_.trackdrawer.track.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` options | [TrackOptions](../interfaces/_leaflet_.trackdrawer.trackoptions.md) |

**Returns:** [Track](../classes/_leaflet_.trackdrawer.track.md)

___

