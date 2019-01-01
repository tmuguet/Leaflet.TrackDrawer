const L = require('leaflet');

if (L.Control.EasyBar === undefined) {
  module.exports = null;
} else {
  module.exports = L.Control.EasyBar.extend({
    options: {
      mode: null,
    },

    initialize(track, options) {
      this._track = track;

      L.Control.EasyBar.prototype.initialize.call(this, this._initializeButtons(), options);
      this.setMode(this.options.mode);

      this._track.getStepsContainer().on('click', (e) => {
        if (this.options.mode === 'insert') {
          const marker = L.TrackDrawer.node(e.latlng);
          const route = e.layer;

          this._track.insertNode(marker, route);
          this._bindMarkerEvents(marker);
        }
      });
    },

    setMode(m) {
      this.options.mode = m;
      this._addBtn.state('loaded');
      this._insertBtn.state('loaded');
      this._deleteBtn.state('loaded');
      this._promoteBtn.state('loaded');
      this._demoteBtn.state('loaded');

      switch (this.options.mode) {
        case 'add':
          this._addBtn.state('active');
          break;
        case 'insert':
          this._insertBtn.state('active');
          break;
        case 'delete':
          this._deleteBtn.state('active');
          break;
        case 'promote':
          this._promoteBtn.state('active');
          break;
        case 'demote':
          this._demoteBtn.state('active');
          break;
        default:
        // Do nothing
      }

      return this;
    },

    _initializeButtons() {
      this._addBtn = L.easyButton({
        states: [
          {
            stateName: 'loaded',
            icon: 'fa-plus',
            title: 'Add marker on click',
            onClick: () => {
              this.setMode('add');
            },
          },
          {
            stateName: 'active',
            icon: 'fa-plus',
            title: 'Add marker on click',
            onClick: () => {
              this.setMode(null);
            },
          },
        ],
      });
      this._insertBtn = L.easyButton({
        states: [
          {
            stateName: 'loaded',
            icon: 'fa-plus-circle',
            title: 'Insert marker when clicking on track',
            onClick: () => {
              this.setMode('insert');
            },
          },
          {
            stateName: 'active',
            icon: 'fa-plus-circle',
            title: 'Insert marker when clicking on track',
            onClick: () => {
              this.setMode(null);
            },
          },
        ],
      });
      this._closeLoop = L.easyButton({
        id: 'btn-closeloop',
        states: [
          {
            stateName: 'loaded',
            icon: 'fa-magic',
            title: 'Close the loop',
            onClick: () => {
              if (this._track.hasNodes(2)) {
                const nodes = this._track.getNodes();
                const marker = L.TrackDrawer.node(nodes[0].markers[0].getLatLng()).addTo(this._track);
                this._bindMarkerEvents(marker);
              }
            },
          },
        ],
      });
      this._deleteBtn = L.easyButton({
        states: [
          {
            stateName: 'loaded',
            icon: 'fa-eraser',
            title: 'Delete marker on click',
            onClick: () => {
              this.setMode('delete');
            },
          },
          {
            stateName: 'active',
            icon: 'fa-eraser',
            title: 'Delete marker on click',
            onClick: () => {
              this.setMode(null);
            },
          },
        ],
      });
      this._promoteBtn = L.easyButton({
        states: [
          {
            stateName: 'loaded',
            icon: 'fa-pause-circle',
            title: 'Promote to stopover on click',
            onClick: () => {
              this.setMode('promote');
            },
          },
          {
            stateName: 'active',
            icon: 'fa-pause-circle',
            title: 'Promote to stopover on click',
            onClick: () => {
              this.setMode(null);
            },
          },
        ],
      });
      this._demoteBtn = L.easyButton({
        states: [
          {
            stateName: 'loaded',
            icon: 'fa-map-signs',
            title: 'Demote to waypoint on click',
            onClick: () => {
              this.setMode('demote');
            },
          },
          {
            stateName: 'active',
            icon: 'fa-map-signs',
            title: 'Demote to waypoint on click',
            onClick: () => {
              this.setMode(null);
            },
          },
        ],
      });
      this._cleanBtn = L.easyButton({
        states: [
          {
            icon: 'fa-trash',
            title: 'Remove everything now',
            onClick: () => {
              this._track.clean();
            },
          },
        ],
      });

      return [
        this._addBtn,
        this._insertBtn,
        this._closeLoop,
        this._deleteBtn,
        this._promoteBtn,
        this._demoteBtn,
        this._cleanBtn,
      ];
    },

    _bindMarkerEvents(marker) {
      marker.on('dragstart', this._onMarkerDragStartHandler);
      marker.on('drag', this._onMarkerDragHandler);
      marker.on('moveend', this._onMarkerMoveEndHandler);
      marker.on('click', this._onMarkerClickHandler);
      return this;
    },

    onAdd(map) {
      this._onMarkerMoveEndHandler = (e) => {
        this._track.onMoveNode(e.target);
      };

      this._onMarkerDragStartHandler = (e) => {
        this._track.onDragStartNode(e.target);
      };

      this._onMarkerDragHandler = (e) => {
        this._track.onDragNode(e.target);
      };

      this._onMapClickHandler = (e) => {
        if (this.options.mode === 'add') {
          const marker = L.TrackDrawer.node(e.latlng).addTo(this._track);
          this._bindMarkerEvents(marker);
        }
      };

      this._onMarkerClickHandler = (e) => {
        const marker = e.target;
        if (this.options.mode === 'delete') this._track.removeNode(marker);
        else if (this.options.mode === 'promote') this._track.promoteNodeToStopover(marker);
        else if (this.options.mode === 'demote') this._track.demoteNodeToWaypoint(marker);
      };

      L.DomEvent.on(map, 'click', this._onMapClickHandler);
      return L.Control.EasyBar.prototype.onAdd.call(this, map);
    },

    onRemove(map) {
      L.DomEvent.off(map, 'click', this._onMapClickHandler);
      this._track.getNodes().forEach((nodes) => {
        nodes.markers.forEach((marker) => {
          marker.off('moveend', this._onMarkerMoveEndHandler);
          marker.off('click', this._onMarkerClickHandler);
        });
      });
    },
  });
}
