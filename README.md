# Leaflet TrackDrawer

Leaflet TrackDrawer is a plugin for [Leaflet](http://leafletjs.com/) to easily draw tracks while using custom routing algorithms.

`L.TrackDrawer.Track` provides the low-level APIs to add, move & delete waypoints. It also supports saving and restoring state, as well as undoing and redoing actions.

The plugin also comes with an optional toolbar `L.TrackDrawer.ToolBar` which implements all the interactions for you.

If you wish to have multiple routing algorithms, there is an additional toolbar `L.TrackDrawer.TraceModeBar` which lets the user easily switch between modes.

## Demo

A real-case usage of this plugin is for [map2gpx](http://map2gpx.eu/).

## Extending TrackDrawer

Other plugins are available to extend/use TrackDrawer:

- [Leaflet.TrackDrawer.FileLayer](https://github.com/tmuguet/Leaflet.TrackDrawer.FileLayer): enables loading GPX, KML, GeoJSON from the users's computer or from a URL
- [Leaflet.TrackStats](https://github.com/tmuguet/Leaflet.TrackStats): computes statistics (distance, altitude, slope, etc.) for Leaflet's Polyline objects and for TrackDrawer's Track objects
