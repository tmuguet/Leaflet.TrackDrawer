**[Leaflet.TrackDrawer](../README.md)**

> [Globals](../README.md) / ["leaflet"](../modules/_leaflet_.md) / [TrackDrawer](../modules/_leaflet_.trackdrawer.md) / Track

# Class: Track

Main entry point.

**`emits`** TrackDrawer:start Fired when an edit has started

**`emits`** TrackDrawer:done Fired when all pending edits are done

**`emits`** TrackDrawer:failed Fired if an error occured

## Hierarchy

* any

  ↳ **Track**

## Index

### Constructors

* [constructor](_leaflet_.trackdrawer.track.md#constructor)

### Methods

* [addLayer](_leaflet_.trackdrawer.track.md#addlayer)
* [addNode](_leaflet_.trackdrawer.track.md#addnode)
* [clean](_leaflet_.trackdrawer.track.md#clean)
* [demoteNodeToWaypoint](_leaflet_.trackdrawer.track.md#demotenodetowaypoint)
* [getBounds](_leaflet_.trackdrawer.track.md#getbounds)
* [getLatLngs](_leaflet_.trackdrawer.track.md#getlatlngs)
* [getNodes](_leaflet_.trackdrawer.track.md#getnodes)
* [getNodesContainer](_leaflet_.trackdrawer.track.md#getnodescontainer)
* [getState](_leaflet_.trackdrawer.track.md#getstate)
* [getSteps](_leaflet_.trackdrawer.track.md#getsteps)
* [getStepsContainer](_leaflet_.trackdrawer.track.md#getstepscontainer)
* [hasNodes](_leaflet_.trackdrawer.track.md#hasnodes)
* [insertNode](_leaflet_.trackdrawer.track.md#insertnode)
* [loadData](_leaflet_.trackdrawer.track.md#loaddata)
* [loadFile](_leaflet_.trackdrawer.track.md#loadfile)
* [loadUrl](_leaflet_.trackdrawer.track.md#loadurl)
* [onDragNode](_leaflet_.trackdrawer.track.md#ondragnode)
* [onDragStartNode](_leaflet_.trackdrawer.track.md#ondragstartnode)
* [onMoveNode](_leaflet_.trackdrawer.track.md#onmovenode)
* [promoteNodeToStopover](_leaflet_.trackdrawer.track.md#promotenodetostopover)
* [refreshEdges](_leaflet_.trackdrawer.track.md#refreshedges)
* [removeNode](_leaflet_.trackdrawer.track.md#removenode)
* [restoreState](_leaflet_.trackdrawer.track.md#restorestate)
* [setOptions](_leaflet_.trackdrawer.track.md#setoptions)
* [toGeoJSON](_leaflet_.trackdrawer.track.md#togeojson)

## Constructors

### constructor

\+ **new Track**(`options?`: [TrackOptions](../interfaces/_leaflet_.trackdrawer.trackoptions.md)): [Track](_leaflet_.trackdrawer.track.md)

#### Parameters:

Name | Type |
------ | ------ |
`options?` | [TrackOptions](../interfaces/_leaflet_.trackdrawer.trackoptions.md) |

**Returns:** [Track](_leaflet_.trackdrawer.track.md)

## Methods

### addLayer

▸ **addLayer**(`layer`: Layer): this

#### Parameters:

Name | Type |
------ | ------ |
`layer` | Layer |

**Returns:** this

___

### addNode

▸ **addNode**(`node`: [Node](_leaflet_.trackdrawer.node.md), `routingCallback?`: [RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback), `skipChecks?`: boolean): Promise<[RouteInfo](../interfaces/_leaflet_.trackdrawer.routeinfo.md)[]\>

Adds a node at the end of the track.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`node` | [Node](_leaflet_.trackdrawer.node.md) | Node to add |
`routingCallback?` | [RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback) | Callback to determine path between previous node and this one |
`skipChecks?` | boolean | If `true`, skips proximity checks (defaults to `false`).  |

**Returns:** Promise<[RouteInfo](../interfaces/_leaflet_.trackdrawer.routeinfo.md)[]\>

___

### clean

▸ **clean**(): this

Removes everything from the track.

**Returns:** this

___

### demoteNodeToWaypoint

▸ **demoteNodeToWaypoint**(`node`: [Node](_leaflet_.trackdrawer.node.md)): this

Demotes a stop-over node to a simple waypoint (e.g. merges two segments)

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`node` | [Node](_leaflet_.trackdrawer.node.md) | Node to demote  |

**Returns:** this

___

### getBounds

▸ **getBounds**(): LatLngBounds

Returns the LatLngBounds of the track.

**Returns:** LatLngBounds

___

### getLatLngs

▸ **getLatLngs**(): LatLng[]

Returns an array of the points in the track.

**Returns:** LatLng[]

___

### getNodes

▸ **getNodes**(): [NodesList](../interfaces/_leaflet_.trackdrawer.nodeslist.md)[]

**Returns:** [NodesList](../interfaces/_leaflet_.trackdrawer.nodeslist.md)[]

___

### getNodesContainer

▸ **getNodesContainer**(): [LayerContainer](_leaflet_.trackdrawer.layercontainer.md)<[Node](_leaflet_.trackdrawer.node.md)\>

**Returns:** [LayerContainer](_leaflet_.trackdrawer.layercontainer.md)<[Node](_leaflet_.trackdrawer.node.md)\>

___

### getState

▸ **getState**(): [State](../modules/_leaflet_.trackdrawer.md#state)

Gets the serializable state of the track.

**Returns:** [State](../modules/_leaflet_.trackdrawer.md#state)

___

### getSteps

▸ **getSteps**(): [EdgesList](../interfaces/_leaflet_.trackdrawer.edgeslist.md)[]

**Returns:** [EdgesList](../interfaces/_leaflet_.trackdrawer.edgeslist.md)[]

___

### getStepsContainer

▸ **getStepsContainer**(): [LayerContainer](_leaflet_.trackdrawer.layercontainer.md)<[Edge](_leaflet_.trackdrawer.edge.md)\>

**Returns:** [LayerContainer](_leaflet_.trackdrawer.layercontainer.md)<[Edge](_leaflet_.trackdrawer.edge.md)\>

___

### hasNodes

▸ **hasNodes**(`count?`: number): boolean

Returns `true` if the track has at least `count` nodes.

#### Parameters:

Name | Type |
------ | ------ |
`count?` | number |

**Returns:** boolean

___

### insertNode

▸ **insertNode**(`node`: [Node](_leaflet_.trackdrawer.node.md), `route`: [Edge](_leaflet_.trackdrawer.edge.md), `routingCallback?`: [RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback)): Promise<[RouteInfo](../interfaces/_leaflet_.trackdrawer.routeinfo.md)[]\>

Inserts a node within an edge.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`node` | [Node](_leaflet_.trackdrawer.node.md) | Node to insert |
`route` | [Edge](_leaflet_.trackdrawer.edge.md) | Edge to split |
`routingCallback?` | [RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback) | Callback to determine paths between previous/next nodes and this one  |

**Returns:** Promise<[RouteInfo](../interfaces/_leaflet_.trackdrawer.routeinfo.md)[]\>

___

### loadData

▸ **loadData**(`data`: string, `name`: string, `ext`: string, `insertWaypoints?`: booleau): Promise<void\>

Creates a track from a string

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`data` | string | Raw data (JSON, GPX, KML) |
`name` | string | Name of the track |
`ext` | string | Extension of the data (json, gpx, kml) |
`insertWaypoints?` | booleau | If `true`, insert waypoints on the track every 100m (defaults to `false`)  |

**Returns:** Promise<void\>

___

### loadFile

▸ **loadFile**(`file`: Blob, `insertWaypoints?`: booleau): Promise<void\>

Creates a track from a file or blob object

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`file` | Blob | File to import (JSON, GPX, KML) |
`insertWaypoints?` | booleau | If `true`, insert waypoints on the track every 100m (defaults to `false`)  |

**Returns:** Promise<void\>

___

### loadUrl

▸ **loadUrl**(`url`: string, `useProxy?`: boolean, `insertWaypoints?`: booleau): Promise<void\>

Creates a track from a URL

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`url` | string | URL to import |
`useProxy?` | boolean | If `true`, use proxy to bypass CORS restrictions (see `fetch.php`) (defaults to `false`) |
`insertWaypoints?` | booleau | If `true`, insert waypoints on the track every 100m (defaults to `false`)  |

**Returns:** Promise<void\>

___

### onDragNode

▸ **onDragNode**(`marker`: [Node](_leaflet_.trackdrawer.node.md)): void

#### Parameters:

Name | Type |
------ | ------ |
`marker` | [Node](_leaflet_.trackdrawer.node.md) |

**Returns:** void

___

### onDragStartNode

▸ **onDragStartNode**(`marker`: [Node](_leaflet_.trackdrawer.node.md)): void

#### Parameters:

Name | Type |
------ | ------ |
`marker` | [Node](_leaflet_.trackdrawer.node.md) |

**Returns:** void

___

### onMoveNode

▸ **onMoveNode**(`marker`: [Node](_leaflet_.trackdrawer.node.md), `routingCallback?`: [RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback)): Promise<[RouteInfo](../interfaces/_leaflet_.trackdrawer.routeinfo.md)[]\>

Handler to call when a node has been moved

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`marker` | [Node](_leaflet_.trackdrawer.node.md) | Node which moved |
`routingCallback?` | [RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback) | Callback to determine paths between previous/next nodes and this one  |

**Returns:** Promise<[RouteInfo](../interfaces/_leaflet_.trackdrawer.routeinfo.md)[]\>

___

### promoteNodeToStopover

▸ **promoteNodeToStopover**(`node`: [Node](_leaflet_.trackdrawer.node.md)): this

Promotes a waypoint node to a stop-over (e.g. creates a new segment)

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`node` | [Node](_leaflet_.trackdrawer.node.md) | Node to promote  |

**Returns:** this

___

### refreshEdges

▸ **refreshEdges**(`routingCallback?`: [RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback)): Promise<[Track](_leaflet_.trackdrawer.track.md)\>

Refreshes all routes in the track

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`routingCallback?` | [RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback) |   |

**Returns:** Promise<[Track](_leaflet_.trackdrawer.track.md)\>

___

### removeNode

▸ **removeNode**(`marker`: [Node](_leaflet_.trackdrawer.node.md), `routingCallback?`: [RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback)): Promise<[RouteInfo](../interfaces/_leaflet_.trackdrawer.routeinfo.md)[]\>

Removes a node.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`marker` | [Node](_leaflet_.trackdrawer.node.md) | Node to remove |
`routingCallback?` | [RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback) | Callback to determine paths between previous and next nodes  |

**Returns:** Promise<[RouteInfo](../interfaces/_leaflet_.trackdrawer.routeinfo.md)[]\>

___

### restoreState

▸ **restoreState**(`state`: [State](../modules/_leaflet_.trackdrawer.md#state), `nodeCallback?`: [NodeCreationCallback](../modules/_leaflet_.trackdrawer.md#nodecreationcallback)): Promise<[Track](_leaflet_.trackdrawer.track.md)\>

Restores a state saved via `getState`.

**`see`** getState

#### Parameters:

Name | Type |
------ | ------ |
`state` | [State](../modules/_leaflet_.trackdrawer.md#state) |
`nodeCallback?` | [NodeCreationCallback](../modules/_leaflet_.trackdrawer.md#nodecreationcallback) |

**Returns:** Promise<[Track](_leaflet_.trackdrawer.track.md)\>

___

### setOptions

▸ **setOptions**(`options`: [TrackOptions](../interfaces/_leaflet_.trackdrawer.trackoptions.md)): this

Apply options.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`options` | [TrackOptions](../interfaces/_leaflet_.trackdrawer.trackoptions.md) |   |

**Returns:** this

___

### toGeoJSON

▸ **toGeoJSON**(`exportStopovers`: boolean, `exportAsFlat`: boolean): geojson.FeatureCollection<geojson.GeometryObject, any\>

Returns a GeoJSON representation of the track.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`exportStopovers` | boolean | `true` to also export stop-over markers (default), `false` to ignore them |
`exportAsFlat` | boolean | `true` to export as one unique Feature, `false` to export as-is (default)  |

**Returns:** geojson.FeatureCollection<geojson.GeometryObject, any\>
