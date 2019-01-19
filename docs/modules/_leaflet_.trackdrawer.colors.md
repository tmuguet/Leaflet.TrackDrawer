[Leaflet.TrackDrawer](../README.md) > ["leaflet"](../modules/_leaflet_.md) > [TrackDrawer](../modules/_leaflet_.trackdrawer.md) > [colors](../modules/_leaflet_.trackdrawer.colors.md)

# Module: colors

Utilities for tracks and markers' colors

## Index

### Enumerations

* [ColorName](../enums/_leaflet_.trackdrawer.colors.colorname.md)

### Functions

* [nameOf](_leaflet_.trackdrawer.colors.md#nameof)
* [nameToRgb](_leaflet_.trackdrawer.colors.md#nametorgb)
* [rgbOf](_leaflet_.trackdrawer.colors.md#rgbof)
* [rgbToName](_leaflet_.trackdrawer.colors.md#rgbtoname)

---

## Functions

<a id="nameof"></a>

###  nameOf

▸ **nameOf**(idx: *`number`*): [ColorName](../enums/_leaflet_.trackdrawer.colors.colorname.md)

Gets the name of a color.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| idx | `number` |  Index in the table. If greater than the size of ColorName, will loop back. |

**Returns:** [ColorName](../enums/_leaflet_.trackdrawer.colors.colorname.md)

___
<a id="nametorgb"></a>

###  nameToRgb

▸ **nameToRgb**(name: *[ColorName](../enums/_leaflet_.trackdrawer.colors.colorname.md)*): `string`

Gets the RGB value of a color, as an hexadecimal value (e.g. `#D63E2A`).

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| name | [ColorName](../enums/_leaflet_.trackdrawer.colors.colorname.md) |  Name of the color |

**Returns:** `string`

___
<a id="rgbof"></a>

###  rgbOf

▸ **rgbOf**(idx: *`number`*): `string`

Gets the RGB value of a color, as an hexadecimal value (e.g. `#D63E2A`).

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| idx | `number` |  Index in the table. If greater than the size of ColorName, will loop back. |

**Returns:** `string`

___
<a id="rgbtoname"></a>

###  rgbToName

▸ **rgbToName**(rgb: *`string`*): [ColorName](../enums/_leaflet_.trackdrawer.colors.colorname.md)

Gets the name of a color.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| rgb | `string` |  RGV value of the color, as an hexadecimal value (e.g. \`#D63E2A\`) |

**Returns:** [ColorName](../enums/_leaflet_.trackdrawer.colors.colorname.md)

___

