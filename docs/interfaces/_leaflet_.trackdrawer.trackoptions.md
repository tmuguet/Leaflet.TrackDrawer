**[Leaflet.TrackDrawer](../README.md)**

> [Globals](../README.md) / ["leaflet"](../modules/_leaflet_.md) / [TrackDrawer](../modules/_leaflet_.trackdrawer.md) / TrackOptions

# Interface: TrackOptions

Available options.

Either `routingCallback` or `router` must be provided.
If `routing` is provided, `routingCallback` will be ignored.

## Hierarchy

* **TrackOptions**

## Index

### Properties

* [debug](_leaflet_.trackdrawer.trackoptions.md#debug)
* [router](_leaflet_.trackdrawer.trackoptions.md#router)
* [routingCallback](_leaflet_.trackdrawer.trackoptions.md#routingcallback)
* [undoDepth](_leaflet_.trackdrawer.trackoptions.md#undodepth)
* [undoable](_leaflet_.trackdrawer.trackoptions.md#undoable)

## Properties

### debug

• `Optional` **debug**: boolean

___

### router

• `Optional` **router**: Routing.IRouter

Back-end from [Leaflet Routing Machine](http://www.liedman.net/leaflet-routing-machine/) used to get the route between two markers.

___

### routingCallback

• `Optional` **routingCallback**: [RoutingCallback](../modules/_leaflet_.trackdrawer.md#routingcallback)

Callback used to get the route between two markers. This option is not necessary if `router` is specified.

___

### undoDepth

• `Optional` **undoDepth**: number

Number of states to keep in memory if `undoable` is `true`. Default is `30`

___

### undoable

• `Optional` **undoable**: boolean

If `true`, all actions are undoable via `undo` and `redo` methods. Default is `true`
