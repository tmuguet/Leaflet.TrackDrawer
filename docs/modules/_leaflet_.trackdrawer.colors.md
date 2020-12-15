**[Leaflet.TrackDrawer](../README.md)**

> [Globals](../README.md) / ["leaflet"](_leaflet_.md) / [TrackDrawer](_leaflet_.trackdrawer.md) / colors

# Namespace: colors

Utilities for tracks and markers' colors

## Index

### Enumerations

* [ColorName](../enums/_leaflet_.trackdrawer.colors.colorname.md)

### Functions

* [nameOf](_leaflet_.trackdrawer.colors.md#nameof)
* [nameToRgb](_leaflet_.trackdrawer.colors.md#nametorgb)
* [rgbOf](_leaflet_.trackdrawer.colors.md#rgbof)
* [rgbToName](_leaflet_.trackdrawer.colors.md#rgbtoname)

## Functions

### nameOf

▸ **nameOf**(`idx`: number): [ColorName](../enums/_leaflet_.trackdrawer.colors.colorname.md)

Gets the name of a color.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`idx` | number | Index in the table. If greater than the size of ColorName, will loop back.  |

**Returns:** [ColorName](../enums/_leaflet_.trackdrawer.colors.colorname.md)

___

### nameToRgb

▸ **nameToRgb**(`name`: [ColorName](../enums/_leaflet_.trackdrawer.colors.colorname.md)): string

Gets the RGB value of a color, as an hexadecimal value (e.g. `#D63E2A`).

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`name` | [ColorName](../enums/_leaflet_.trackdrawer.colors.colorname.md) | Name of the color  |

**Returns:** string

___

### rgbOf

▸ **rgbOf**(`idx`: number): string

Gets the RGB value of a color, as an hexadecimal value (e.g. `#D63E2A`).

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`idx` | number | Index in the table. If greater than the size of ColorName, will loop back.  |

**Returns:** string

___

### rgbToName

▸ **rgbToName**(`rgb`: string): [ColorName](../enums/_leaflet_.trackdrawer.colors.colorname.md)

Gets the name of a color.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`rgb` | string | RGV value of the color, as an hexadecimal value (e.g. `#D63E2A`)  |

**Returns:** [ColorName](../enums/_leaflet_.trackdrawer.colors.colorname.md)
