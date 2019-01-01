const L = require('leaflet');

if (L.Control.EasyBar === undefined) {
  module.exports = null;
} else {
  module.exports = L.Control.EasyBar.extend({
    options: {
      mode: null,
    },

    initialize(track, modes, options) {
      this._track = track;
      this._buttonsMap = {};

      L.Control.EasyBar.prototype.initialize.call(this, this._initializeButtons(modes), options);
      this.setMode(this.options.mode);
    },

    setMode(m) {
      const ids = Object.keys(this._buttonsMap);
      let newMode = m;
      if (newMode === null) {
        const idx = this.options.mode === ids[0] ? 1 : 0;
        newMode = ids[idx];
      }

      this.options.mode = newMode;
      ids.forEach((key) => {
        this._buttonsMap[key].btn.state('loaded');
      });

      this._buttonsMap[newMode].btn.state('active');
      this._track.setOptions({
        router: this._buttonsMap[newMode].router,
        routingCallback: this._buttonsMap[newMode].routingCallback,
      });

      return this;
    },

    _initializeButtons(modes) {
      const buttons = [];
      modes.forEach((m) => {
        const btn = L.easyButton({
          id: `trackdrawer-mode-${m.id}`,
          states: [
            {
              stateName: 'loaded',
              icon: m.icon,
              title: m.name,
              onClick: () => {
                this.setMode(m.id);
              },
            },
            {
              stateName: 'active',
              icon: m.icon,
              title: m.name,
              onClick: () => {
                this.setMode(null);
              },
            },
          ],
        });
        buttons.push(btn);
        this._buttonsMap[m.id] = {
          router: m.router,
          routingCallback: m.routingCallback,
          btn,
        };
      });

      return buttons;
    },
  });
}
