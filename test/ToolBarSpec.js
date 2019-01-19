describe('ToolBar', () => {
  let map;
  let track;

  beforeEach(() => {
    map = L.map('map', {
      center: L.latLng(0, 0),
      zoom: 13,
    });
    track = L.TrackDrawer.track({
      routingCallback(previousMarker, marker, done) {
        done(null, [previousMarker.getLatLng(), marker.getLatLng()]);
      },
    }).addTo(map);
  });

  afterEach(async () => {
    sinon.restore();
    await map.removeAsPromise();
  });

  describe('Initialization', () => {
    it('constructor should correctly initialize structures', () => {
      const ctrl = L.TrackDrawer.toolBar(track, { mode: 'add' }).addTo(map);
      expect(ctrl._addBtn._currentState.stateName).to.be.equal('active');

      ctrl.remove();
    });
  });

  describe('Map events', () => {
    it('Clicking on map should not do anything if mode is not "add"', () => {
      const ctrl = L.TrackDrawer.toolBar(track, { mode: null }).addTo(map);
      expect(ctrl._addBtn._currentState.stateName).to.be.equal('loaded');

      const f = sinon.fake();
      sinon.replace(track, 'addNode', f);
      happen.click($('#map')[0]);

      expect(f.callCount).to.be.equal(0);
    });

    it('Clicking on map should add marker if mode is "add"', () => {
      const ctrl = L.TrackDrawer.toolBar(track, { mode: 'add' }).addTo(map);
      expect(ctrl._addBtn._currentState.stateName).to.be.equal('active');

      const f = sinon.fake();
      sinon.replace(track, 'addNode', f);
      happen.click($('#map')[0]);

      expect(f.callCount).to.be.equal(1);
    });
  });

  describe('Marker events', () => {
    it('Clicking on marker should not do anything if mode is not supported', async () => {
      const ctrl = L.TrackDrawer.toolBar(track, { mode: null }).addTo(map);
      const marker1 = L.TrackDrawer.node(L.latLng(0, 0));
      await track.addNode(marker1);
      marker1.on('click', ctrl._onMarkerClickHandler);

      const f = sinon.fake();
      sinon.replace(track, 'removeNode', f);
      happen.click($('#map div.leaflet-marker-pane div.awesome-marker')[0]);

      expect(f.callCount).to.be.equal(0);
    });

    it('Clicking on marker should remove marker if mode is "delete"', async () => {
      const ctrl = L.TrackDrawer.toolBar(track, { mode: 'delete' }).addTo(map);
      const marker1 = L.TrackDrawer.node(L.latLng(0, 0));
      await track.addNode(marker1);
      marker1.on('click', ctrl._onMarkerClickHandler);

      const f = sinon.fake();
      sinon.replace(track, 'removeNode', f);
      happen.click($('#map div.leaflet-marker-pane div.awesome-marker')[0]);

      expect(f.callCount).to.be.equal(1);
    });
  });
});
