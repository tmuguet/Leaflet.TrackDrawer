describe('Misc', () => {
  let map;

  beforeEach(() => {
    map = L.map('map', {
      center: L.latLng(44.96777356135154, 6.06822967529297),
      zoom: 13,
    });
  });

  afterEach(async () => {
    sinon.restore();
    await map.removeAsPromise();
  });

  describe('Bounds', () => {
    it('getBounds() should contain all nodes and edges', async () => {
      // TODO: really test edges
      const track = L.TrackDrawer.track({
        routingCallback() {
          throw new Error('Unexpected call');
        },
      }).addTo(map);

      const state = [
        { version: 1, start: [44.974635142416496, 6.064453125000001] },
        [
          {
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];

      await track.restoreState(state, latlng => L.TrackDrawer.node(latlng));

      const bounds = track.getBounds();
      state.forEach((group, idx) => {
        if (idx === 0) {
          const start = L.latLng(group.start);
          expect(bounds.contains(start)).to.be.true;
        } else {
          group.forEach((step) => {
            const end = L.latLng(step.end);
            expect(bounds.contains(end)).to.be.true;
          });
        }
      });
    });

    // TODO: test getBounds() with empty track
    // TODO: test getBounds() with 1 marker
  });
});
