/* eslint-disable arrow-parens */
const L = require('leaflet');
const corslite = require('@mapbox/corslite');
const { Track } = require('./Track');

function split(polyline, distance = 100) {
  if (distance <= 0) throw new Error('`distance` must be positive');

  const latlngs = polyline.getLatLngs();
  if (latlngs.length === 0) return [[]];

  let result = [];
  if (Array.isArray(latlngs[0])) {
    for (let j = 0; j < latlngs.length; j += 1) {
      result = result.concat(split(latlngs[j], distance));
    }

    return result;
  }

  let tmp = latlngs.splice(0, 1);
  while (latlngs.length > 0) {
    const [latlng] = latlngs.splice(0, 1);
    tmp.push(latlng);
    if (L.latLng(latlng).distanceTo(L.latLng(tmp[0])) > 100) {
      result.push(L.polyline(tmp));
      tmp = [latlng];
    }
  }
  result.push(L.polyline(tmp));

  return result;
}

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

      const layers = layer.getLayers();
      let lastMarker;
      const hasToolbar = this._toolbar !== undefined;
      /* eslint-disable no-await-in-loop */
      for (let i = 0; i < layers.length; i += 1) {
        if (layers[i] instanceof L.Polyline) {
          const polylines = insertWaypoints ? split(layers[i], insertWaypoints) : [layers[i]];
          const latlngs = polylines.map((l) => l.getLatLngs());

          for (let j = 0; j < latlngs.length; j += 1) {
            if (lastMarker === undefined) {
              lastMarker = L.TrackDrawer.node(latlngs[j][0]);
              await this.addNode(lastMarker, undefined, true);
              if (hasToolbar) this._bindMarkerEvents(lastMarker);
            }

            lastMarker = L.TrackDrawer.node(latlngs[j][latlngs[j].length - 1], {
              type: j === latlngs.length - 1 ? 'stopover' : 'waypoint',
            });
            await this.addNode(
              lastMarker,
              (n1, n2, cb) => {
                cb(null, latlngs[j]);
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
