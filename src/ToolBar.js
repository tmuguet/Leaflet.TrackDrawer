const L = require('leaflet');

if (L.Control.EasyBar === undefined) {
  module.exports = {
    ToolBar: undefined,
    toolBar: undefined,
  };
} else {
  const ToolBar = L.Control.EasyBar.extend({
    options: {
      mode: null,
      labelAddMarker: 'Add marker on click',
      labelInsertMarker: 'Insert marker when clicking on track',
      labelCloseLoop: 'Close the loop',
      labelDeleteMarker: 'Delete marker on click',
      labelPromoteMarker: 'Promote to stopover on click',
      labelDemoteMarker: 'Demote to waypoint on click',
      labelClean: 'Remove everything now',
      labelUndo: 'Undo',
      labelRedo: 'Redo',
    },

    initialize(track, options) {
      this._track = track;

      L.Util.setOptions(this, options);
      L.Control.EasyBar.prototype.initialize.call(this, this._initializeButtons(), options);
      this.setMode(this.options.mode);

      this._track.getStepsContainer().on('click', (e) => {
        if (this.options.mode === 'insert') {
          const marker = L.TrackDrawer.node(e.latlng);
          const route = e.layer;

          route.setStyle({ weight: 3 });
          this._track.insertNode(marker, route);
          this._bindMarkerEvents(marker);
        }
      });

      this._track.getStepsContainer().on('mouseover', (e) => {
        if (this.options.mode === 'insert') {
          e.layer.setStyle({ weight: 5 });
        }
      });

      this._track.getStepsContainer().on('mouseout', (e) => {
        if (this.options.mode === 'insert') {
          e.layer.setStyle({ weight: 3 });
        }
      });

      this._track._toolbar = this;
      this._track._bindMarkerEvents = (marker) => {
        this._bindMarkerEvents(marker);
      };
    },

    setMode(m) {
      this.options.mode = m;
      this._addBtn.state('loaded');
      this._insertBtn.state('loaded');
      this._deleteBtn.state('loaded');
      this._promoteBtn.state('loaded');
      this._demoteBtn.state('loaded');

      if (this._map) {
        this._map.getContainer().style.cursor = '';
      }

      switch (this.options.mode) {
        case 'add': {
          this._addBtn.state('active');
          if (this._map) {
            this._map.getContainer().style.cursor = 'pointer';
          }
          break;
        }
        case 'insert': {
          this._insertBtn.state('active');
          break;
        }
        case 'delete': {
          this._deleteBtn.state('active');
          break;
        }
        case 'promote': {
          this._promoteBtn.state('active');
          break;
        }
        case 'demote': {
          this._demoteBtn.state('active');
          break;
        }
        default:
        // Do nothing
      }

      return this;
    },

    _initializeButtons() {
      const buttons = [];
      this._addBtn = L.easyButton({
        id: 'trackdrawer-add',
        states: [
          {
            stateName: 'loaded',
            icon: 'fa-plus',
            title: this.options.labelAddMarker,
            onClick: () => {
              this.setMode('add');
            },
          },
          {
            stateName: 'active',
            icon: 'fa-plus',
            title: this.options.labelAddMarker,
            onClick: () => {
              this.setMode(null);
            },
          },
        ],
      });
      buttons.push(this._addBtn);
      this._insertBtn = L.easyButton({
        id: 'trackdrawer-insert',
        states: [
          {
            stateName: 'loaded',
            icon: 'fa-plus-circle',
            title: this.options.labelInsertMarker,
            onClick: () => {
              this.setMode('insert');
            },
          },
          {
            stateName: 'active',
            icon: 'fa-plus-circle',
            title: this.options.labelInsertMarker,
            onClick: () => {
              this.setMode(null);
            },
          },
        ],
      });
      buttons.push(this._insertBtn);
      this._closeLoop = L.easyButton({
        id: 'trackdrawer-closeloop',
        states: [
          {
            stateName: 'loaded',
            icon: 'fa-magic',
            title: this.options.labelCloseLoop,
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
      buttons.push(this._closeLoop);
      this._deleteBtn = L.easyButton({
        id: 'trackdrawer-delete',
        states: [
          {
            stateName: 'loaded',
            icon: 'fa-eraser',
            title: this.options.labelDeleteMarker,
            onClick: () => {
              this.setMode('delete');
            },
          },
          {
            stateName: 'active',
            icon: 'fa-eraser',
            title: this.options.labelDeleteMarker,
            onClick: () => {
              this.setMode(null);
            },
          },
        ],
      });
      buttons.push(this._deleteBtn);
      this._promoteBtn = L.easyButton({
        id: 'trackdrawer-promote',
        states: [
          {
            stateName: 'loaded',
            icon: 'fa-pause-circle',
            title: this.options.labelPromoteMarker,
            onClick: () => {
              this.setMode('promote');
            },
          },
          {
            stateName: 'active',
            icon: 'fa-pause-circle',
            title: this.options.labelPromoteMarker,
            onClick: () => {
              this.setMode(null);
            },
          },
        ],
      });
      buttons.push(this._promoteBtn);
      this._demoteBtn = L.easyButton({
        id: 'trackdrawer-demote',
        states: [
          {
            stateName: 'loaded',
            icon: 'fa-map-signs',
            title: this.options.labelDemoteMarker,
            onClick: () => {
              this.setMode('demote');
            },
          },
          {
            stateName: 'active',
            icon: 'fa-map-signs',
            title: this.options.labelDemoteMarker,
            onClick: () => {
              this.setMode(null);
            },
          },
        ],
      });
      buttons.push(this._demoteBtn);
      this._cleanBtn = L.easyButton({
        id: 'trackdrawer-clean',
        states: [
          {
            icon: 'fa-trash',
            title: this.options.labelClean,
            onClick: () => {
              this._track.clean();
            },
          },
        ],
      });
      buttons.push(this._cleanBtn);

      if (this._track.options.undoable) {
        this._undoBtn = L.easyButton({
          id: 'trackdrawer-undo',
          states: [
            {
              icon: 'fa-undo',
              title: this.options.labelUndo,
              onClick: () => {
                this._track.undo((latlng) => {
                  const marker = L.TrackDrawer.node(latlng);
                  this._bindMarkerEvents(marker);
                  return marker;
                });
              },
            },
          ],
        });
        buttons.push(this._undoBtn);
        this._redoBtn = L.easyButton({
          id: 'trackdrawer-redo',
          states: [
            {
              icon: 'fa-repeat',
              title: this.options.labelRedo,
              onClick: () => {
                this._track.redo((latlng) => {
                  const marker = L.TrackDrawer.node(latlng);
                  this._bindMarkerEvents(marker);
                  return marker;
                });
              },
            },
          ],
        });
        buttons.push(this._redoBtn);
      }

      this._track.on('TrackDrawer:start', () => {
        if (this._track.options.undoable) {
          this._undoBtn.disable();
          this._redoBtn.disable();
        }
      });

      this._track.on('TrackDrawer:done', () => {
        if (this._track.hasNodes(2)) {
          this._closeLoop.enable();
        } else {
          this._closeLoop.disable();
        }

        if (this._track.hasNodes()) {
          this._insertBtn.enable();
          this._deleteBtn.enable();
          this._promoteBtn.enable();
          this._demoteBtn.enable();
          this._cleanBtn.enable();
        } else {
          this._insertBtn.disable();
          this._deleteBtn.disable();
          this._promoteBtn.disable();
          this._demoteBtn.disable();
          this._cleanBtn.disable();
        }

        if (this._track.options.undoable) {
          if (this._track.isUndoable()) {
            this._undoBtn.enable();
          } else {
            this._undoBtn.disable();
          }
          if (this._track.isRedoable()) {
            this._redoBtn.enable();
          } else {
            this._redoBtn.disable();
          }
        }
      });

      return buttons;
    },

    _bindMarkerEvents(marker) {
      marker.on('click', this._onMarkerClickHandler);
      marker.on('mouseover', this._onMarkerMouseOverHandler);
      marker.on('mouseout', this._onMarkerMouseOutHandler);
      return this;
    },

    onAdd(map) {
      this._onMapClickHandler = (e) => {
        if (this.options.mode === 'add') {
          const marker = L.TrackDrawer.node(e.latlng).addTo(this._track);
          this._bindMarkerEvents(marker);
        }
      };

      this._onMarkerClickHandler = (e) => {
        const marker = e.target;
        switch (this.options.mode) {
          case 'delete': {
            const { previousEdge } = this._track._getPrevious(marker);
            const { nextEdge } = this._track._getNext(marker);

            if (previousEdge) previousEdge.setStyle({ weight: 3 });
            if (nextEdge) nextEdge.setStyle({ weight: 3 });

            this._track.removeNode(marker);
            break;
          }
          case 'promote': {
            this._track.promoteNodeToStopover(marker);
            break;
          }
          case 'demote': {
            this._track.demoteNodeToWaypoint(marker);
            break;
          }
          default:
        }
      };

      this._onMarkerMouseOverHandler = (e) => {
        if (this.options.mode === 'delete' || this.options.mode === 'promote' || this.options.mode === 'demote') {
          const marker = e.target;
          const { previousEdge } = this._track._getPrevious(marker);
          const { nextEdge } = this._track._getNext(marker);

          if (previousEdge) previousEdge.setStyle({ weight: 5 });
          if (nextEdge) nextEdge.setStyle({ weight: 5 });
        }
      };

      this._onMarkerMouseOutHandler = (e) => {
        const marker = e.target;
        const { previousEdge } = this._track._getPrevious(marker);
        const { nextEdge } = this._track._getNext(marker);

        if (previousEdge) previousEdge.setStyle({ weight: 3 });
        if (nextEdge) nextEdge.setStyle({ weight: 3 });
      };

      L.DomEvent.on(map, 'click', this._onMapClickHandler);
      return L.Control.EasyBar.prototype.onAdd.call(this, map);
    },

    onRemove(map) {
      if (this.options.mode === 'add') map.getContainer().style.cursor = '';

      L.DomEvent.off(map, 'click', this._onMapClickHandler);
      this._track.getNodes().forEach((nodes) => {
        nodes.markers.forEach((marker) => {
          marker.off('click', this._onMarkerClickHandler);
          marker.off('mouseover', this._onMarkerMouseOverHandler);
          marker.off('mouseout', this._onMarkerMouseOutHandler);
        });
      });
    },
  });

  module.exports = {
    ToolBar,
    toolBar(track, options) {
      return new ToolBar(track, options);
    },
  };
}
