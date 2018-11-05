L.Map.include({
  loadAsPromise() {
    const _this = this;
    return $.Deferred(function () {
      _this.on('load', () => this.resolve());
    });
  },

  removeAsPromise() {
    const _this = this;
    return $.Deferred(function () {
      _this.on('unload', () => this.resolve());
      _this.remove();
    });
  },
});

$('body').append('<div id="map" style="width: 100%; height: 300px;"></div>');

const assert = chai.assert;
const expect = chai.expect;
