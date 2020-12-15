**[Leaflet.TrackDrawer](../README.md)**

> [Globals](../README.md) / ["leaflet"](../modules/_leaflet_.md) / [TrackDrawer](../modules/_leaflet_.trackdrawer.md) / TraceModeBar

# Class: TraceModeBar

Toolbar for using different custom routing modes (requires [Leaflet.EasyButton](https://github.com/CliffCloud/Leaflet.EasyButton))

Sample usage:
```javascript
L.TrackDrawer.traceModeBar(
track,
[
{
id: 'auto',
icon: 'fa-map-o',
name: 'Automatic route',
router: L.Routing.graphHopper('<my-api-key>', {
urlParameters: {
vehicle: 'foot',
},
},
},
{
id: 'line',
icon: 'fa-compass',
name: 'Straight route',
router: L.Routing.straightLine(),
},
],
{
direction: 'horizontal',
position: 'topcenter',
mode: 'auto',
},
).addTo(map);
```

## Hierarchy

* any

  ↳ **TraceModeBar**

## Index

### Constructors

* [constructor](_leaflet_.trackdrawer.tracemodebar.md#constructor)

### Methods

* [setMode](_leaflet_.trackdrawer.tracemodebar.md#setmode)

## Constructors

### constructor

\+ **new TraceModeBar**(`track`: [Track](_leaflet_.trackdrawer.track.md), `modes`: [TraceMode](../interfaces/_leaflet_.trackdrawer.tracemode.md)[], `options?`: [TraceModeBarOptions](../interfaces/_leaflet_.trackdrawer.tracemodebaroptions.md)): [TraceModeBar](_leaflet_.trackdrawer.tracemodebar.md)

#### Parameters:

Name | Type |
------ | ------ |
`track` | [Track](_leaflet_.trackdrawer.track.md) |
`modes` | [TraceMode](../interfaces/_leaflet_.trackdrawer.tracemode.md)[] |
`options?` | [TraceModeBarOptions](../interfaces/_leaflet_.trackdrawer.tracemodebaroptions.md) |

**Returns:** [TraceModeBar](_leaflet_.trackdrawer.tracemodebar.md)

## Methods

### setMode

▸ **setMode**(`m`: String \| null): this

Sets a new mode.
If `null` is provided, will switch back to the first mode (or second if first one was active).

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`m` | String \| null | New mode  |

**Returns:** this
