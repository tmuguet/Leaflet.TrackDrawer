[Leaflet.TrackDrawer](../README.md) > ["leaflet"](../modules/_leaflet_.md) > [TrackDrawer](../modules/_leaflet_.trackdrawer.md) > [Track](../classes/_leaflet_.trackdrawer.track.md)

# Class: Track

Main entry point.
*__emits__*: TrackDrawer:start Fired when an edit has started

*__emits__*: TrackDrawer:done Fired when all pending edits are done

*__emits__*: TrackDrawer:failed Fired if an error occured

## Hierarchy

 `any`

**↳ Track**

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
* [onDragNode](_leaflet_.trackdrawer.track.md#ondragnode)
* [onDragStartNode](_leaflet_.trackdrawer.track.md#ondragstartnode)
* [onMoveNode](_leaflet_.trackdrawer.track.md#onmovenode)
* [promoteNodeToStopover](_leaflet_.trackdrawer.track.md#promotenodetostopover)
* [removeNode](_leaflet_.trackdrawer.track.md#removenode)
* [restoreState](_leaflet_.trackdrawer.track.md#restorestate)
* [setOptions](_leaflet_.trackdrawer.track.md#setoptions)
* [toGeoJSON](_leaflet_.trackdrawer.track.md#togeojson)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Track**(options?: *[TrackOptions](../interfaces/_leaflet_.trackdrawer.trackoptions.md)*): [Track](_leaflet_.trackdrawer.track.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` options | [TrackOptions](../interfaces/_leaflet_.trackdrawer.trackoptions.md) |

**Returns:** [Track](_leaflet_.trackdrawer.track.md)

___

## Methods

<a id="addlayer"></a>

###  addLayer

▸ **addLayer**(layer: *`Layer`*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| layer | `Layer` |

**Returns:** `this`

___
<a id="addnode"></a>

###  addNode

▸ **addNode**(node: *[Node](_leaflet_.trackdrawer.node.md)*, routingCallback?: *[RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback)*, skipChecks?: *`boolean`*): `Promise`<[RouteInfo](../interfaces/_leaflet_.trackdrawer.routeinfo.md)[]>

Adds a node at the end of the track.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| node | [Node](_leaflet_.trackdrawer.node.md) |  Node to add |
| `Optional` routingCallback | [RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback) |  Callback to determine path between previous node and this one |
| `Optional` skipChecks | `boolean` |  If \`true\`, skips proximity checks (defaults to \`false\`). |

**Returns:** `Promise`<[RouteInfo](../interfaces/_leaflet_.trackdrawer.routeinfo.md)[]>

___
<a id="clean"></a>

###  clean

▸ **clean**(): `this`

Removes everything from the track.

**Returns:** `this`

___
<a id="demotenodetowaypoint"></a>

###  demoteNodeToWaypoint

▸ **demoteNodeToWaypoint**(node: *[Node](_leaflet_.trackdrawer.node.md)*): `this`

Demotes a stop-over node to a simple waypoint (e.g. merges two segments)

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| node | [Node](_leaflet_.trackdrawer.node.md) |  Node to demote |

**Returns:** `this`

___
<a id="getbounds"></a>

###  getBounds

▸ **getBounds**(): `LatLngBounds`

Returns the LatLngBounds of the track.

**Returns:** `LatLngBounds`

___
<a id="getlatlngs"></a>

###  getLatLngs

▸ **getLatLngs**(): `LatLng`[]

Returns an array of the points in the track.

**Returns:** `LatLng`[]

___
<a id="getnodes"></a>

###  getNodes

▸ **getNodes**(): [NodesList](../interfaces/_leaflet_.trackdrawer.nodeslist.md)[]

**Returns:** [NodesList](../interfaces/_leaflet_.trackdrawer.nodeslist.md)[]

___
<a id="getnodescontainer"></a>

###  getNodesContainer

▸ **getNodesContainer**(): [LayerContainer](_leaflet_.trackdrawer.layercontainer.md)<[Node](_leaflet_.trackdrawer.node.md)>

**Returns:** [LayerContainer](_leaflet_.trackdrawer.layercontainer.md)<[Node](_leaflet_.trackdrawer.node.md)>

___
<a id="getstate"></a>

###  getState

▸ **getState**(): [State](../modules/_leaflet_.trackdrawer.md#state)

Gets the serializable state of the track.

**Returns:** [State](../modules/_leaflet_.trackdrawer.md#state)

___
<a id="getsteps"></a>

###  getSteps

▸ **getSteps**(): [EdgesList](../interfaces/_leaflet_.trackdrawer.edgeslist.md)[]

**Returns:** [EdgesList](../interfaces/_leaflet_.trackdrawer.edgeslist.md)[]

___
<a id="getstepscontainer"></a>

###  getStepsContainer

▸ **getStepsContainer**(): [LayerContainer](_leaflet_.trackdrawer.layercontainer.md)<[Edge](_leaflet_.trackdrawer.edge.md)>

**Returns:** [LayerContainer](_leaflet_.trackdrawer.layercontainer.md)<[Edge](_leaflet_.trackdrawer.edge.md)>

___
<a id="hasnodes"></a>

###  hasNodes

▸ **hasNodes**(count?: *`number`*): `boolean`

Returns `true` if the track has at least `count` nodes.

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| `Default value` count | `number` | 1 |

**Returns:** `boolean`

___
<a id="insertnode"></a>

###  insertNode

▸ **insertNode**(node: *[Node](_leaflet_.trackdrawer.node.md)*, route: *[Edge](_leaflet_.trackdrawer.edge.md)*, routingCallback?: *[RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback)*): `Promise`<[RouteInfo](../interfaces/_leaflet_.trackdrawer.routeinfo.md)[]>

Inserts a node within an edge.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| node | [Node](_leaflet_.trackdrawer.node.md) |  Node to insert |
| route | [Edge](_leaflet_.trackdrawer.edge.md) |  Edge to split |
| `Optional` routingCallback | [RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback) |  Callback to determine paths between previous/next nodes and this one |

**Returns:** `Promise`<[RouteInfo](../interfaces/_leaflet_.trackdrawer.routeinfo.md)[]>

___
<a id="ondragnode"></a>

###  onDragNode

▸ **onDragNode**(marker: *[Node](_leaflet_.trackdrawer.node.md)*): `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| marker | [Node](_leaflet_.trackdrawer.node.md) |

**Returns:** `void`

___
<a id="ondragstartnode"></a>

###  onDragStartNode

▸ **onDragStartNode**(marker: *[Node](_leaflet_.trackdrawer.node.md)*): `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| marker | [Node](_leaflet_.trackdrawer.node.md) |

**Returns:** `void`

___
<a id="onmovenode"></a>

###  onMoveNode

▸ **onMoveNode**(marker: *[Node](_leaflet_.trackdrawer.node.md)*, routingCallback?: *[RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback)*): `Promise`<[RouteInfo](../interfaces/_leaflet_.trackdrawer.routeinfo.md)[]>

Handler to call when a node has been moved

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| marker | [Node](_leaflet_.trackdrawer.node.md) |  Node which moved |
| `Optional` routingCallback | [RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback) |  Callback to determine paths between previous/next nodes and this one |

**Returns:** `Promise`<[RouteInfo](../interfaces/_leaflet_.trackdrawer.routeinfo.md)[]>

___
<a id="promotenodetostopover"></a>

###  promoteNodeToStopover

▸ **promoteNodeToStopover**(node: *[Node](_leaflet_.trackdrawer.node.md)*): `this`

Promotes a waypoint node to a stop-over (e.g. creates a new segment)

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| node | [Node](_leaflet_.trackdrawer.node.md) |  Node to promote |

**Returns:** `this`

___
<a id="removenode"></a>

###  removeNode

▸ **removeNode**(marker: *[Node](_leaflet_.trackdrawer.node.md)*, routingCallback?: *[RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback)*): `Promise`<[RouteInfo](../interfaces/_leaflet_.trackdrawer.routeinfo.md)[]>

Removes a node.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| marker | [Node](_leaflet_.trackdrawer.node.md) |  Node to remove |
| `Optional` routingCallback | [RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback) |  Callback to determine paths between previous and next nodes |

**Returns:** `Promise`<[RouteInfo](../interfaces/_leaflet_.trackdrawer.routeinfo.md)[]>

___
<a id="restorestate"></a>

###  restoreState

▸ **restoreState**(state: *[State](../modules/_leaflet_.trackdrawer.md#state)*, nodeCallback?: *[NodeCreationCallback](../modules/_leaflet_.trackdrawer.md#nodecreationcallback)*): `Promise`<[Track](_leaflet_.trackdrawer.track.md)>

Restores a state saved via `getState`.
*__see__*: getState

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| state | [State](../modules/_leaflet_.trackdrawer.md#state) |  \- |
| `Optional` nodeCallback | [NodeCreationCallback](../modules/_leaflet_.trackdrawer.md#nodecreationcallback) |  \- |

**Returns:** `Promise`<[Track](_leaflet_.trackdrawer.track.md)>

___
<a id="setoptions"></a>

###  setOptions

▸ **setOptions**(options: *[TrackOptions](../interfaces/_leaflet_.trackdrawer.trackoptions.md)*): `this`

Apply options.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| options | [TrackOptions](../interfaces/_leaflet_.trackdrawer.trackoptions.md) |   |

**Returns:** `this`

___
<a id="togeojson"></a>

###  toGeoJSON

▸ **toGeoJSON**(): `geojson.FeatureCollection`<`geojson.GeometryObject`, `P`>

Returns a GeoJSON representation of the track.

**Returns:** `geojson.FeatureCollection`<`geojson.GeometryObject`, `P`>

___

