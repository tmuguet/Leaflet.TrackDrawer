/* eslint-disable arrow-parens */
const L = require('leaflet');
const corslite = require('@mapbox/corslite');
const { Track } = require('./Track');
const latlngutils = require('./LatLngUtils');

if (L.FileLayer !== undefined) {
  Track.include({
    _createFileLoader() {
      this._fileLoader = L.FileLayer.fileLoader(null, {
        addToMap: false,
        fileSizeLimit: this.options.fileSizeLimit || 1024,
        formats: this.options.fileFormat || ['.geojson', '.json', '.kml', '.gpx'],
      });
    },

    createFileLoaderControl(insertWaypoints = false) {
      this._fileLoaderController = L.Control.fileLayerLoad({
        addToMap: false,
        fileSizeLimit: this.options.fileSizeLimit || 1024,
        formats: this.options.fileFormat || ['.geojson', '.json', '.kml', '.gpx'],
      }).addTo(this._map);

      this._fileLoaderController.loader.on('data:loaded', (event) => {
        this._dataLoadedHandler(event.layer, insertWaypoints);
      });

      return this._fileLoaderController;
    },

    async _dataLoadedHandler(layer, insertWaypoints = false) {
      this._fireStart();

      const oldValue = this._fireEvents;
      this._fireEvents = false;
      this.clean();

      const latlngs = insertWaypoints
        ? latlngutils.featureGroupToLatLngs(layer).map(l => [latlngutils.splitLatLngs(l[0]), l[1]])
        : latlngutils.featureGroupToLatLngs(layer).map(l => [[l[0]], l[1]]);

      let lastMarker;
      const hasToolbar = this._toolbar !== undefined;
      /* eslint-disable no-await-in-loop */
      for (let i = 0; i < latlngs.length; i += 1) {
        const properties = latlngs[i][1];
        for (let j = 0; j < latlngs[i][0].length; j += 1) {
          const l = latlngs[i][0][j];
          if (l.length > 0) {
            if (lastMarker === undefined) {
              lastMarker = L.TrackDrawer.node(l[0]);
              await this.addNode(lastMarker, undefined, true);
              if (hasToolbar) this._bindMarkerEvents(lastMarker);
            }

            lastMarker = L.TrackDrawer.node(l[l.length - 1], {
              type: j === latlngs[i][0].length - 1 ? 'stopover' : 'waypoint',
            });
            await this.addNode(
              lastMarker,
              (_n1, _n2, cb) => {
                cb(null, l, properties);
              },
              true,
            );
            if (hasToolbar) this._bindMarkerEvents(lastMarker);
          }
        }
      }
      /* eslint-enable no-await-in-loop */

      this._fireEvents = oldValue;
      this._fireDone();
    },

    loadData(data, name, ext, insertWaypoints = false) {
      return new Promise((resolve, reject) => {
        this._fileLoader.on('data:loaded', async (event) => {
          await this._dataLoadedHandler(event.layer, insertWaypoints);
          this._fileLoader.off();
          resolve();
        });
        this._fileLoader.on('data:error', (error) => {
          this._fileLoader.off();
          reject(error.error);
        });

        this._fileLoader.loadData(data, name, ext);
      });
    },

    loadFile(file, insertWaypoints = false) {
      return new Promise((resolve, reject) => {
        this._fileLoader.on('data:loaded', async (event) => {
          await this._dataLoadedHandler(event.layer, insertWaypoints);
          this._fileLoader.off();
          resolve();
        });
        this._fileLoader.on('data:error', (error) => {
          this._fileLoader.off();
          reject(error.error);
        });

        this._fileLoader.load(file);
      });
    },

    loadUrl(url, useProxy = false, insertWaypoints = false) {
      const filename = url.split('/').pop();
      const ext = filename.split('.').pop();

      const proxiedUrl = useProxy ? `fetch.php?url=${encodeURI(url)}` : url;

      return new Promise((resolve, reject) => {
        corslite(
          proxiedUrl,
          (err, resp) => {
            if (!err) {
              try {
                this._fileLoader.on('data:loaded', async (event) => {
                  await this._dataLoadedHandler(event.layer, insertWaypoints);
                  this._fileLoader.off();
                  resolve();
                });
                this._fileLoader.on('data:error', (error) => {
                  this._fileLoader.off();
                  reject(error.error);
                });
                this._fileLoader.loadData(resp.responseText, filename, ext);
              } catch (ex) {
                reject(ex);
              }
            } else if (err.responseText) {
              try {
                // Check if response is JSON
                const data = JSON.parse(err.responseText);
                reject(new Error(data.error));
              } catch (ex) {
                reject(new Error(err.statusText));
              }
            } else if (err.statusText) {
              reject(new Error(err.statusText));
            } else {
              reject(new Error(err));
            }
          },
          false,
        );
      });
    },
  });

  Track.addInitHook('_createFileLoader');
}
