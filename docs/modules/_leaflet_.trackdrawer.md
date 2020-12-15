**[Leaflet.TrackDrawer](../README.md)**

> [Globals](../README.md) / ["leaflet"](_leaflet_.md) / TrackDrawer

# Namespace: TrackDrawer

TrackDrawer

Usage sample:
```javascript
var track = L.TrackDrawer.track({
routingCallback: function(markerStart, markerEnd, done) {
// Do stuff
var latlngs = [markerStart.getLatLng(), markerEnd.getLatLng()];
done(null, latlngs, {my: 'metadata'});
},
}).addTo(map);

// With Leaflet Routing Machine
var track = L.TrackDrawer.track({
router: L.Routing.osrmv1(),
}).addTo(map);
```

## Index

### Namespaces

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

* [EdgeOptions](../interfaces/_leaflet_.trackdrawer.edgeoptions.md)
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

* [edge](_leaflet_.trackdrawer.md#edge)
* [node](_leaflet_.trackdrawer.md#node)
* [toolBar](_leaflet_.trackdrawer.md#toolbar)
* [traceModeBar](_leaflet_.trackdrawer.md#tracemodebar)
* [track](_leaflet_.trackdrawer.md#track)

## Type aliases

### LayerId

Ƭ  **LayerId**: Number

Leaflet's internal layer ID

___

### NodeCreationCallback

Ƭ  **NodeCreationCallback**: (latlng: LatLngExpression) => [Node](../classes/_leaflet_.trackdrawer.node.md)

Function that can be implemented to create a custom node.

Color of the node will be (re)set by this plugin.

Example:
```javascript
function(latlng) {
var marker = L.TrackDrawer.node(latlng, { metadata: { hello: 'world' } });
ctrl._bindMarkerEvents(marker);
return marker;
}
```

___

### RoutingCallback

Ƭ  **RoutingCallback**: (previousMarker: [Node](../classes/_leaflet_.trackdrawer.node.md), marker: [Node](../classes/_leaflet_.trackdrawer.node.md), done: (err: null \| Routing.IError, result: LatLng[], metadata?: Object) => void) => void

Function to implement to compute the route between two markers.
Once computation is done, must call `done(null, <result>, <object>)` if successful, or `done(<error>)` if failure.

Example:
```javascript
function(previousMarker, marker, done) {
done(null, [previousMarker.getLatLng(), marker.getLatLng()], {hello: 'world'});
}
```

___

### State

Ƭ  **State**: object

___

### TrackLayer

Ƭ  **TrackLayer**: [Node](../classes/_leaflet_.trackdrawer.node.md) \| [Edge](../classes/_leaflet_.trackdrawer.edge.md)

Layers handled by this plugin

## Functions

### edge

▸ **edge**(`latlngs`: LatLngExpression[], `options?`: PolylineOptions): [Edge](../classes/_leaflet_.trackdrawer.edge.md)

#### Parameters:

Name | Type |
------ | ------ |
`latlngs` | LatLngExpression[] |
`options?` | PolylineOptions |

**Returns:** [Edge](../classes/_leaflet_.trackdrawer.edge.md)

___

### node

▸ **node**(`latlng`: LatLngExpression, `options?`: [NodeOptions](../interfaces/_leaflet_.trackdrawer.nodeoptions.md)): [Node](../classes/_leaflet_.trackdrawer.node.md)

#### Parameters:

Name | Type |
------ | ------ |
`latlng` | LatLngExpression |
`options?` | [NodeOptions](../interfaces/_leaflet_.trackdrawer.nodeoptions.md) |

**Returns:** [Node](../classes/_leaflet_.trackdrawer.node.md)

___

### toolBar

▸ **toolBar**(`track`: [Track](../classes/_leaflet_.trackdrawer.track.md), `options?`: [ToolBarOptions](../interfaces/_leaflet_.trackdrawer.toolbaroptions.md)): [ToolBar](../classes/_leaflet_.trackdrawer.toolbar.md)

#### Parameters:

Name | Type |
------ | ------ |
`track` | [Track](../classes/_leaflet_.trackdrawer.track.md) |
`options?` | [ToolBarOptions](../interfaces/_leaflet_.trackdrawer.toolbaroptions.md) |

**Returns:** [ToolBar](../classes/_leaflet_.trackdrawer.toolbar.md)

___

### traceModeBar

▸ **traceModeBar**(`track`: [Track](../classes/_leaflet_.trackdrawer.track.md), `modes`: [TraceMode](../interfaces/_leaflet_.trackdrawer.tracemode.md)[], `options?`: [TraceModeBarOptions](../interfaces/_leaflet_.trackdrawer.tracemodebaroptions.md)): [TraceModeBar](../classes/_leaflet_.trackdrawer.tracemodebar.md)

#### Parameters:

Name | Type |
------ | ------ |
`track` | [Track](../classes/_leaflet_.trackdrawer.track.md) |
`modes` | [TraceMode](../interfaces/_leaflet_.trackdrawer.tracemode.md)[] |
`options?` | [TraceModeBarOptions](../interfaces/_leaflet_.trackdrawer.tracemodebaroptions.md) |

**Returns:** [TraceModeBar](../classes/_leaflet_.trackdrawer.tracemodebar.md)

___

### track

▸ **track**(`options?`: [TrackOptions](../interfaces/_leaflet_.trackdrawer.trackoptions.md)): [Track](../classes/_leaflet_.trackdrawer.track.md)

#### Parameters:

Name | Type |
------ | ------ |
`options?` | [TrackOptions](../interfaces/_leaflet_.trackdrawer.trackoptions.md) |

**Returns:** [Track](../classes/_leaflet_.trackdrawer.track.md)
