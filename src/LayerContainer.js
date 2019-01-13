const L = require('leaflet');

module.exports = L.Evented.extend({
  initialize(parent) {
    this._parent = parent;
    const f = L.featureGroup()
      .addTo(parent)
      .addEventParent(this);
    this._elements = [f];
    this.length = 1;
  },

  get(i) {
    const idx = i < 0 ? this._elements.length + i : i;
    return this._elements[idx];
  },

  /* eslint-disable prefer-rest-params */
  splice() {
    const ret = this._elements.splice(...arguments);
    ret.forEach(x => x.removeFrom(this._parent).removeEventParent(this));

    if (arguments.length > 2) {
      const args = Array.prototype.slice.call(arguments, 2);
      args.forEach((x) => {
        x.addTo(this._parent).addEventParent(this);
      });
    }

    this.length = this._elements.length;
    return ret;
  },
  /* eslint-enable prefer-rest-params */

  forEach(cb) {
    this._elements.forEach(cb);
  },

  clean() {
    this._elements[0].clearLayers();
    this.splice(1);
  },

  getLayer(id) {
    const parentLayer = this._elements.find(x => x.getLayer(id) !== undefined);
    return parentLayer !== undefined ? parentLayer.getLayer(id) : undefined;
  },
  getLayerId(layer) {
    const parentLayer = this._elements.find(x => x.hasLayer(layer));
    return parentLayer !== undefined ? parentLayer.getLayerId(layer) : undefined;
  },
  getLayerIndex(layer) {
    return this._elements.findIndex(x => x.hasLayer(layer));
  },
});
