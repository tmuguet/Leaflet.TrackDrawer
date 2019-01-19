[Leaflet.TrackDrawer](../README.md) > ["leaflet"](../modules/_leaflet_.md) > [TrackDrawer](../modules/_leaflet_.trackdrawer.md) > [ToolBar](../classes/_leaflet_.trackdrawer.toolbar.md)

# Class: ToolBar

Toolbar that enables drawing (requires [Leaflet.EasyButton](https://github.com/CliffCloud/Leaflet.EasyButton))

Sample usage:

```javascript
L.TrackDrawer.toolBar(track, { mode: 'add' }).addTo(map);
```

## Hierarchy

 `any`

**↳ ToolBar**

## Index

### Constructors

* [constructor](_leaflet_.trackdrawer.toolbar.md#constructor)

### Methods

* [setMode](_leaflet_.trackdrawer.toolbar.md#setmode)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new ToolBar**(track: *[Track](_leaflet_.trackdrawer.track.md)*, options?: *[ToolBarOptions](../interfaces/_leaflet_.trackdrawer.toolbaroptions.md)*): [ToolBar](_leaflet_.trackdrawer.toolbar.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| track | [Track](_leaflet_.trackdrawer.track.md) |
| `Optional` options | [ToolBarOptions](../interfaces/_leaflet_.trackdrawer.toolbaroptions.md) |

**Returns:** [ToolBar](_leaflet_.trackdrawer.toolbar.md)

___

## Methods

<a id="setmode"></a>

###  setMode

▸ **setMode**(m: *[ToolBarMode](../interfaces/_leaflet_.trackdrawer.toolbarmode.md) | `null`*): `this`

Sets a new mode, or unselects all if `null`.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| m | [ToolBarMode](../interfaces/_leaflet_.trackdrawer.toolbarmode.md) | `null` |  New mode |

**Returns:** `this`

___

