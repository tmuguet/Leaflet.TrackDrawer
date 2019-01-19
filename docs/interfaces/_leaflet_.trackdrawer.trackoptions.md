[Leaflet.TrackDrawer](../README.md) > ["leaflet"](../modules/_leaflet_.md) > [TrackDrawer](../modules/_leaflet_.trackdrawer.md) > [TrackOptions](../interfaces/_leaflet_.trackdrawer.trackoptions.md)

# Interface: TrackOptions

Available options.

Either `routingCallback` or `router` must be provided. If `routing` is provided, `routingCallback` will be ignored.

## Hierarchy

**TrackOptions**

## Index

### Properties

* [debug](_leaflet_.trackdrawer.trackoptions.md#debug)
* [router](_leaflet_.trackdrawer.trackoptions.md#router)
* [routingCallback](_leaflet_.trackdrawer.trackoptions.md#routingcallback)
* [undoDepth](_leaflet_.trackdrawer.trackoptions.md#undodepth)
* [undoable](_leaflet_.trackdrawer.trackoptions.md#undoable)

---

## Properties

<a id="debug"></a>

### `<Optional>` debug

**● debug**: *`boolean`*

___
<a id="router"></a>

### `<Optional>` router

**● router**: *`Routing.IRouter`*

Back-end from [Leaflet Routing Machine](http://www.liedman.net/leaflet-routing-machine/) used to get the route between two markers.

___
<a id="routingcallback"></a>

### `<Optional>` routingCallback

**● routingCallback**: *[RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback)*

Callback used to get the route between two markers. This option is not necessary if `router` is specified.

___
<a id="undodepth"></a>

### `<Optional>` undoDepth

**● undoDepth**: *`number`*

Number of states to keep in memory if `undoable` is `true`. Default is `30`

___
<a id="undoable"></a>

### `<Optional>` undoable

**● undoable**: *`boolean`*

If `true`, all actions are undoable via `undo` and `redo` methods. Default is `true`

___

