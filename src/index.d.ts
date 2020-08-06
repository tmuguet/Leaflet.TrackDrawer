import * as L from 'leaflet';
import * as Routing from 'leaflet-routing-machine';
import * as geojson from 'geojson';

declare module 'leaflet' {
  /**
   * TrackDrawer
   *
   * Usage sample:
   * ```javascript
var track = L.TrackDrawer.track({
  routingCallback: function(markerStart, markerEnd, done) {
    // Do stuff
    var latlngs = [markerStart.getLatLng(), markerEnd.getLatLng()];
    done(null, latlngs, {my: 'metadata'});
  },
}).addTo(map);

// With Leaflet Routing Machine
var track = L.TrackDrawer.track({
  router: L.Routing.osrmv1(),
}).addTo(map);
```
   */
  module TrackDrawer {
    /**
     * Leaflet's internal layer ID
     */
    type LayerId = Number;
    /**
     * Layers handled by this plugin
     */
    type TrackLayer = Node | Edge;

    /**
     * Utilities for tracks and markers' colors
     */
    namespace colors {
      /**
       * List of supported colors for tracks and markers
       */
      enum ColorName {
        'blue',
        'green',
        'orange',
        'purple',
        'red',
        'darkblue',
        'darkpurple',
        'lightblue',
        'lightgreen',
        'beige',
        'pink',
        'lightred',
      }

      /**
       * Gets the name of a color.
       * @param idx Index in the table. If greater than the size of ColorName, will loop back.
       */
      function nameOf(idx: number): ColorName;
      /**
       * Gets the RGB value of a color, as an hexadecimal value (e.g. `#D63E2A`).
       * @param idx  Index in the table. If greater than the size of ColorName, will loop back.
       */
      function rgbOf(idx: number): string;
      /**
       * Gets the RGB value of a color, as an hexadecimal value (e.g. `#D63E2A`).
       * @param name Name of the color
       */
      function nameToRgb(name: ColorName): string;
      /**
       * Gets the name of a color.
       * @param rgb RGV value of the color, as an hexadecimal value (e.g. `#D63E2A`)
       */
      function rgbToName(rgb: string): ColorName;
    }

    enum NodeType {
      /**
       * Marker that is a simple waypoint in the segment
       */
      waypoint,
      /**
       * Marker that will start a new segment in the track
       */
      stopover,
    }

    interface NodeOptions extends MarkerOptions {
      /**
       * Type of the node, default value is `waypoint`
       */
      type?: NodeType;
      /**
       * Metadatas
       */
      metadata?: Object;
    }

    /**
     * Marker in the track
     */
    class Node extends Marker {
      /**
       * Creates a new node.
       *
       * You must call `Track.addNode()` after creating it.
       * @param latlng Geographical point
       * @param options Options
       */
      constructor(latlng: LatLngExpression, options?: NodeOptions);

      /**
       * Sets the type of the node.
       *
       * This function should not be called directly once the node has been added to a track.
       * Use `Track.promoteNodeToStopover` and `Track.demoteToWaypoint` instead.
       *
       * @param type Type
       */
      setType(type: NodeType): Node;
    }

    function node(latlng: LatLngExpression, options?: NodeOptions): Node;

    interface EdgeOptions extends PolylineOptions {
      /**
       * Metadatas
       */
      metadata?: Object;
    }

    /**
     * Path in the track
     */
    class Edge extends Polyline {
      /**
       * Creates a new path.
       *
       * @param latlngs Array of geographical point
       * @param options Options
       */
      private constructor(latlngs: LatLngExpression[], options?: EdgeOptions);
    }

    function edge(latlngs: LatLngExpression[], options?: PolylineOptions): Edge;

    /**
     * Wrapper around Array to manage the collections of Nodes or Edges
     */
    class LayerContainer<TrackLayer> extends Evented {
      private constructor(parent: Track);

      /**
       * Gets the collection for a specific track segment
       * @param i Index
       */
      get(i: number): FeatureGroup;

      private splice(number: number, deleteCount?: number, ...args: FeatureGroup[]): FeatureGroup[];

      forEach(cbFn: (currentValue: FeatureGroup, index?: number, array?: FeatureGroup[]) => void);

      private clean(): this;

      /**
       * Returns the layer with the given internal ID.
       * @param id Leaflet internal ID
       */
      getLayer(id: LayerId): TrackLayer;

      /**
       * Returns the internal ID of the layer.
       * @param layer Layer
       */
      getLayerId(layer: TrackLayer): LayerId;

      /**
       * Returns the index of the FeatureGroup that has this layer (accessible via `get`).
       * @param layer Layer to find
       */
      getLayerIndex(layer: TrackLayer): number;

      /**
       * Size of the array
       */
      length: number;
    }

    type State = object;

    interface RouteInfo {
      from: Node;
      to: Node;
      edge: Edge;
    }

    /**
     * Function to implement to compute the route between two markers.
     * Once computation is done, must call `done(null, <result>, <object>)` if successful, or `done(<error>)` if failure.
     *
     * Example:
     * ```javascript
function(previousMarker, marker, done) {
  done(null, [previousMarker.getLatLng(), marker.getLatLng()], {hello: 'world'});
}
     * ```
     */
    type RoutingCallback = (
      previousMarker: Node,
      marker: Node,
      done: (err: null | Routing.IError, result: LatLng[], metadata?: Object) => void,
    ) => void;
    /**
     * Function that can be implemented to create a custom node.
     *
     * Color of the node will be (re)set by this plugin.
     *
     * Example:
     * ```javascript
function(latlng) {
  var marker = L.TrackDrawer.node(latlng, { metadata: { hello: 'world' } });
  ctrl._bindMarkerEvents(marker);
  return marker;
}
     * ```
     */
    type NodeCreationCallback = (latlng: LatLngExpression) => Node;

    /**
     * Available options.
     *
     * Either `routingCallback` or `router` must be provided.
     * If `routing` is provided, `routingCallback` will be ignored.
     */
    interface TrackOptions {
      /** Callback used to get the route between two markers. This option is not necessary if `router` is specified. */
      routingCallback?: RoutingCallback;
      /** Back-end from [Leaflet Routing Machine](http://www.liedman.net/leaflet-routing-machine/) used to get the route between two markers. */
      router?: Routing.IRouter;
      debug?: boolean;
      /** If `true`, all actions are undoable via `undo` and `redo` methods. Default is `true` */
      undoable?: boolean;
      /** Number of states to keep in memory if `undoable` is `true`. Default is `30` */
      undoDepth?: number;
    }
    interface NodesList {
      container: FeatureGroup;
      markers: Node[];
    }
    interface EdgesList {
      container: FeatureGroup;
      edges: Edge[];
    }

    /**
     * Main entry point.
     *
     * @emits TrackDrawer:start Fired when an edit has started
     * @emits TrackDrawer:done Fired when all pending edits are done
     * @emits TrackDrawer:failed Fired if an error occured
     */
    class Track extends LayerGroup {
      constructor(options?: TrackOptions);

      /**
       * Apply options.
       * @param options
       */
      setOptions(options: TrackOptions): this;

      /** Returns `true` if the track has at least `count` nodes. */
      hasNodes(count?: number): boolean;

      getNodes(): NodesList[];

      getNodesContainer(): LayerContainer<Node>;

      getSteps(): EdgesList[];

      getStepsContainer(): LayerContainer<Edge>;

      /** Returns the LatLngBounds of the track. */
      getBounds(): LatLngBounds;

      /** Returns an array of the points in the track. */
      getLatLngs(): LatLng[];

      /**
       * Returns a GeoJSON representation of the track.
       * @param exportStopovers `true` to also export stop-over markers (default), `false` to ignore them
       * @param exportAsFlat `true` to export as one unique Feature, `false` to export as-is (default)
       */
      toGeoJSON(
        exportStopovers: boolean,
        exportAsFlat: boolean,
      ): geojson.FeatureCollection<geojson.GeometryObject, any>;

      /** Gets the serializable state of the track. */
      getState(): State;

      /**
       * Refreshes all routes in the track
       * @param routingCallback
       */
      refreshEdges(routingCallback?: RoutingCallback): Promise<Track>;

      /** Removes everything from the track. */
      clean(): this;

      /**
       * Restores a state saved via `getState`.
       * @param state
       * @param nodeCallback
       * @see getState
       */
      restoreState(state: State, nodeCallback?: NodeCreationCallback): Promise<Track>;

      addLayer(layer: Layer): this;

      /**
       * Adds a node at the end of the track.
       * @param node Node to add
       * @param routingCallback Callback to determine path between previous node and this one
       * @param skipChecks If `true`, skips proximity checks (defaults to `false`).
       */
      addNode(node: Node, routingCallback?: RoutingCallback, skipChecks?: boolean): Promise<RouteInfo[]>;

      /**
       * Inserts a node within an edge.
       * @param node Node to insert
       * @param route Edge to split
       * @param routingCallback Callback to determine paths between previous/next nodes and this one
       */
      insertNode(node: Node, route: Edge, routingCallback?: RoutingCallback): Promise<RouteInfo[]>;

      onDragStartNode(marker: Node): void;

      onDragNode(marker: Node): void;

      /**
       * Handler to call when a node has been moved
       * @param marker Node which moved
       * @param routingCallback Callback to determine paths between previous/next nodes and this one
       */
      onMoveNode(marker: Node, routingCallback?: RoutingCallback): Promise<RouteInfo[]>;

      /**
       * Removes a node.
       * @param marker Node to remove
       * @param routingCallback Callback to determine paths between previous and next nodes
       */
      removeNode(marker: Node, routingCallback?: RoutingCallback): Promise<RouteInfo[]>;

      /**
       * Promotes a waypoint node to a stop-over (e.g. creates a new segment)
       * @param node Node to promote
       */
      promoteNodeToStopover(node: Node): this;

      /**
       * Demotes a stop-over node to a simple waypoint (e.g. merges two segments)
       * @param node Node to demote
       */
      demoteNodeToWaypoint(node: Node): this;
    }

    function track(options?: TrackOptions): Track;

    interface ToolBarMode {
      add;
      insert;
      delete;
      promote;
      demote;
    }
    interface ToolBarOptions extends EasyBarOptions {
      mode: ToolBarMode | null;
      labelAddMarker: String;
      labelInsertMarker: String;
      labelCloseLoop: String;
      labelDeleteMarker: String;
      labelPromoteMarker: String;
      labelDemoteMarker: String;
      labelClean: String;
      labelUndo: String;
      labelRedo: String;
    }

    /**
     * Toolbar that enables drawing (requires [Leaflet.EasyButton](https://github.com/CliffCloud/Leaflet.EasyButton))
     *
     * Sample usage:
     * ```javascript
L.TrackDrawer.toolBar(track, { mode: 'add' }).addTo(map);
     * ```
     */
    class ToolBar extends Control.EasyBar {
      constructor(track: Track, options?: ToolBarOptions);

      /**
       * Sets a new mode, or unselects all if `null`.
       * @param m New mode
       */
      setMode(m: ToolBarMode | null): this;
    }

    function toolBar(track: Track, options?: ToolBarOptions): ToolBar;

    interface TraceMode {
      /** Unique identifier (used for `setMode` for instance) */
      id: String;
      /** Icon supported by Leaflet AwesomeMarker (e.g. `fa-map-o`) */
      icon: String;
      /** Label of the button */
      name: String;
      /** Router to enable when this button is selected */
      router: Routing.IRouter;
    }

    interface TraceModeBarOptions extends EasyBarOptions {
      /** Id of the default mode */
      mode: String;
    }

    /**
     * Toolbar for using different custom routing modes (requires [Leaflet.EasyButton](https://github.com/CliffCloud/Leaflet.EasyButton))
     *
     * Sample usage:
     * ```javascript
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
     * ```
     */
    class TraceModeBar extends Control.EasyBar {
      constructor(track: Track, modes: TraceMode[], options?: TraceModeBarOptions);

      /**
       * Sets a new mode.
       * If `null` is provided, will switch back to the first mode (or second if first one was active).
       * @param m New mode
       */
      setMode(m: String | null): this;
    }

    function traceModeBar(track: Track, modes: TraceMode[], options?: TraceModeBarOptions): TraceModeBar;
  }
}
