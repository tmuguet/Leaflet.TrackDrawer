**[Leaflet.TrackDrawer](../README.md)**

> [Globals](../README.md) / ["leaflet"](../modules/_leaflet_.md) / [TrackDrawer](../modules/_leaflet_.trackdrawer.md) / LayerContainer

# Class: LayerContainer\<TrackLayer>

Wrapper around Array to manage the collections of Nodes or Edges

## Type parameters

Name |
------ |
`TrackLayer` |

## Hierarchy

* any

  ↳ **LayerContainer**

## Index

### Constructors

* [constructor](_leaflet_.trackdrawer.layercontainer.md#constructor)

### Properties

* [length](_leaflet_.trackdrawer.layercontainer.md#length)

### Methods

* [clean](_leaflet_.trackdrawer.layercontainer.md#clean)
* [forEach](_leaflet_.trackdrawer.layercontainer.md#foreach)
* [get](_leaflet_.trackdrawer.layercontainer.md#get)
* [getLayer](_leaflet_.trackdrawer.layercontainer.md#getlayer)
* [getLayerId](_leaflet_.trackdrawer.layercontainer.md#getlayerid)
* [getLayerIndex](_leaflet_.trackdrawer.layercontainer.md#getlayerindex)
* [splice](_leaflet_.trackdrawer.layercontainer.md#splice)

## Constructors

### constructor

\+ `Private`**new LayerContainer**(`parent`: [Track](_leaflet_.trackdrawer.track.md)): [LayerContainer](_leaflet_.trackdrawer.layercontainer.md)

#### Parameters:

Name | Type |
------ | ------ |
`parent` | [Track](_leaflet_.trackdrawer.track.md) |

**Returns:** [LayerContainer](_leaflet_.trackdrawer.layercontainer.md)

## Properties

### length

•  **length**: number

Size of the array

## Methods

### clean

▸ `Private`**clean**(): this

**Returns:** this

___

### forEach

▸ **forEach**(`cbFn`: (currentValue: FeatureGroup, index?: number, array?: FeatureGroup[]) => void): any

#### Parameters:

Name | Type |
------ | ------ |
`cbFn` | (currentValue: FeatureGroup, index?: number, array?: FeatureGroup[]) => void |

**Returns:** any

___

### get

▸ **get**(`i`: number): FeatureGroup

Gets the collection for a specific track segment

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`i` | number | Index  |

**Returns:** FeatureGroup

___

### getLayer

▸ **getLayer**(`id`: [LayerId](../modules/_leaflet_.trackdrawer.md#layerid)): TrackLayer

Returns the layer with the given internal ID.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`id` | [LayerId](../modules/_leaflet_.trackdrawer.md#layerid) | Leaflet internal ID  |

**Returns:** TrackLayer

___

### getLayerId

▸ **getLayerId**(`layer`: TrackLayer): [LayerId](../modules/_leaflet_.trackdrawer.md#layerid)

Returns the internal ID of the layer.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`layer` | TrackLayer | Layer  |

**Returns:** [LayerId](../modules/_leaflet_.trackdrawer.md#layerid)

___

### getLayerIndex

▸ **getLayerIndex**(`layer`: TrackLayer): number

Returns the index of the FeatureGroup that has this layer (accessible via `get`).

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`layer` | TrackLayer | Layer to find  |

**Returns:** number

___

### splice

▸ `Private`**splice**(`number`: number, `deleteCount?`: number, ...`args`: FeatureGroup[]): FeatureGroup[]

#### Parameters:

Name | Type |
------ | ------ |
`number` | number |
`deleteCount?` | number |
`...args` | FeatureGroup[] |

**Returns:** FeatureGroup[]
