**[Leaflet.TrackDrawer](../README.md)**

> [Globals](../README.md) / ["leaflet"](../modules/_leaflet_.md) / [TrackDrawer](../modules/_leaflet_.trackdrawer.md) / Node

# Class: Node

Marker in the track

## Hierarchy

* any

  ↳ **Node**

## Index

### Constructors

* [constructor](_leaflet_.trackdrawer.node.md#constructor)

### Methods

* [setType](_leaflet_.trackdrawer.node.md#settype)

## Constructors

### constructor

\+ **new Node**(`latlng`: LatLngExpression, `options?`: [NodeOptions](../interfaces/_leaflet_.trackdrawer.nodeoptions.md)): [Node](_leaflet_.trackdrawer.node.md)

Creates a new node.

You must call `Track.addNode()` after creating it.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`latlng` | LatLngExpression | Geographical point |
`options?` | [NodeOptions](../interfaces/_leaflet_.trackdrawer.nodeoptions.md) | Options  |

**Returns:** [Node](_leaflet_.trackdrawer.node.md)

## Methods

### setType

▸ **setType**(`type`: [NodeType](../enums/_leaflet_.trackdrawer.nodetype.md)): [Node](_leaflet_.trackdrawer.node.md)

Sets the type of the node.

This function should not be called directly once the node has been added to a track.
Use `Track.promoteNodeToStopover` and `Track.demoteToWaypoint` instead.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`type` | [NodeType](../enums/_leaflet_.trackdrawer.nodetype.md) | Type  |

**Returns:** [Node](_leaflet_.trackdrawer.node.md)
