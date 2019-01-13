describe('Main', () => {
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

  describe('Initialization', () => {
    it('constructor should correctly initialize structures', () => {
      const track = L.TrackDrawer.track().addTo(map);
      const state = track.getState();
      expect(state).to.be.an('array');
      expect(state).to.be.empty;
      expect(track.isUndoable()).to.be.false;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(0);

      const track2 = L.TrackDrawer.track({undoable: false}).addTo(map);
      expect(track2.isUndoable()).to.be.false;
      expect(track2.isRedoable()).to.be.false;
      expect(track2._currentStateIndex).to.be.null;
    });

    it('adding marker', async () => {
      const track = L.TrackDrawer.track({undoable: false}).addTo(map);
      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      const marker1 = L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001));
      const marker2 = L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297), { type: 'stopover' });

      await track.addNode(marker1);
      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.false;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.null;
      await track.addNode(marker2, (previousMarker, currentMarker, done) => {
        done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
      });
      expect(eventsTriggered).to.be.equal(2);
      expect(track.isUndoable()).to.be.false;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.null;

      const expectedNewState = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.96777356135154, 6.06822967529297],
            edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
          },
        ],
      ];

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });

    it('adding twice same marker should have no effect', async () => {
      const track = L.TrackDrawer.track({undoable: false}).addTo(map);
      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      const marker1 = L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001));

      await track.addNode(marker1);
      expect(eventsTriggered).to.be.equal(1);
      await track.addNode(marker1);
      expect(eventsTriggered).to.be.equal(1);

      const expectedNewState = [];

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });

    it('adding marker with loss of precision in route', async () => {
      const track = L.TrackDrawer.track({undoable: false}).addTo(map);
      const marker1 = L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001));
      const marker2 = L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297));

      await track.addNode(marker1);
      await track.addNode(marker2, (previousMarker, currentMarker, done) => {
        done(null, [L.latLng(44.974635, 6.06445313), L.latLng(44.967774, 6.06823)]);
      });

      const expectedNewState = [
        [
          {
            start: [44.974635, 6.06445313],
            end: [44.967774, 6.06823],
            edge: [44.974635, 6.06445313, 44.967774, 6.06823],
          },
        ],
      ];

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });

    it('adding marker via routingCallback option', async () => {
      const track = L.TrackDrawer.track({
        undoable: false,
        routingCallback: (previousMarker, currentMarker, done) => {
          done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
        },
      }).addTo(map);
      const marker1 = L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001));
      const marker2 = L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297));

      await track.addNode(marker1);
      await track.addNode(marker2);

      const expectedNewState = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.96777356135154, 6.06822967529297],
            edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
          },
        ],
      ];

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });

    it('adding marker via router option', async () => {
      const hasRouting = L.Routing !== undefined;

      if (!hasRouting) {
        L.Routing = {
          waypoint(latlng) {
            return { latLng: latlng };
          },
        };
      }
      const track = L.TrackDrawer.track({
        undoable: false,
        router: {
          route(waypoints, done) {
            const res = [{ coordinates: [waypoints[0].latLng, waypoints[1].latLng] }];
            done(null, res);
          },
        },
      }).addTo(map);
      const marker1 = L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001));
      const marker2 = L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297));

      await track.addNode(marker1);
      await track.addNode(marker2);

      const expectedNewState = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.96777356135154, 6.06822967529297],
            edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
          },
        ],
      ];

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);

      if (!hasRouting) {
        delete L.Routing;
      }
    });

    it('failure to add a marker should fail gracefully', async () => {
      const track = L.TrackDrawer.track().addTo(map);
      let eventsTriggered = 0;
      let eventsFailureTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      track.on('TrackDrawer:failed', () => (eventsFailureTriggered += 1));
      const marker1 = L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001));
      const marker2 = L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297), { type: 'stopover' });

      await track.addNode(marker1);
      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      await track.addNode(marker2, (previousMarker, currentMarker, done) => {
        done(new Error('error'), null);
      });
      expect(eventsTriggered).to.be.equal(1);
      expect(eventsFailureTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;

      const expectedNewState = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.96777356135154, 6.06822967529297],
            edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
          },
        ],
      ];

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });
  });

  describe('Restoring state', () => {
    it('getting restored state should give back same state', async () => {
      const track = L.TrackDrawer.track({
        routingCallback(previousMarker, marker, done) {
          throw new Error('Unexpected call');
        },
      }).addTo(map);

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));

      const state = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];

      await track.restoreState(state);
      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(1);

      expect(track._nodesContainers).to.have.lengthOf(4);
      expect(track._edgesContainers).to.have.lengthOf(4);
      expect(track._nodesContainers.get(-1)).to.equal(track._nodesContainers.get(3));
      expect(track._edgesContainers.get(-1)).to.equal(track._edgesContainers.get(3));

      const newState = track.getState();
      expect(newState).to.deep.equal(state);
    });

    it('restoring empty state restore nothing', async () => {
      const track = L.TrackDrawer.track({
        routingCallback(previousMarker, marker, done) {
          throw new Error('Unexpected call');
        },
      }).addTo(map);

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));

      await track.restoreState([]);
      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(1);

      expect(track._nodesContainers).to.have.lengthOf(1);
      expect(track._edgesContainers).to.have.lengthOf(1);

      const newState = track.getState();
      expect(newState).to.deep.equal([]);
    });
  });

  describe('Cleaning state', () => {
    it('cleaning state should give back initial state', async () => {
      const track = L.TrackDrawer.track({
        routingCallback(previousMarker, marker, done) {
          throw new Error('Unexpected call');
        },
      }).addTo(map);

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));

      const state = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];

      await track.restoreState(state);
      expect(eventsTriggered).to.be.equal(1);

      track.clean();
      expect(eventsTriggered).to.be.equal(2);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(2);

      expect(track._nodesContainers).to.have.lengthOf(1);
      expect(track._edgesContainers).to.have.lengthOf(1);
      expect(track._nodesContainers.get(-1)).to.equal(track._nodesContainers.get(0));
      expect(track._edgesContainers.get(-1)).to.equal(track._edgesContainers.get(0));

      const newState = track.getState();
      expect(newState).to.be.an('array');
      expect(newState).to.be.empty;
    });
  });

  describe('Modifying state', () => {
    it('demote to waypoints should flatten state', async () => {
      const track = L.TrackDrawer.track({
        routingCallback(previousMarker, marker, done) {
          throw new Error('Unexpected call');
        },
      }).addTo(map);

      const state = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];

      const expectedNewState = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          },
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];

      const markers = [];
      await track.restoreState(state, (latlng) => {
        const marker = L.TrackDrawer.node(latlng);
        markers.push(marker);
        return marker;
      });

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));

      markers.forEach((m, i) => {
        track.demoteNodeToWaypoint(m);
      });
      expect(eventsTriggered).to.be.equal(3);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(4);

      expect(track._nodesContainers).to.have.lengthOf(1);
      expect(track._edgesContainers).to.have.lengthOf(1);
      expect(track._nodesContainers.get(-1)).to.equal(track._nodesContainers.get(0));
      expect(track._edgesContainers.get(-1)).to.equal(track._edgesContainers.get(0));

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });

    it('demote first node should not do anything', async () => {
      const track = L.TrackDrawer.track({
        routingCallback(previousMarker, marker, done) {
          throw new Error('Unexpected call');
        },
      }).addTo(map);

      const state = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];

      const markers = [];
      await track.restoreState(state, (latlng) => {
        const marker = L.TrackDrawer.node(latlng);
        if (markers.length === 0) marker.setType('stopover');
        markers.push(marker);
        return marker;
      });

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));

      track.demoteNodeToWaypoint(markers[0]);
      expect(eventsTriggered).to.be.equal(0);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(1);

      const newState = track.getState();
      expect(newState).to.deep.equal(state);
    });

    it('promoting to stopovers should expand state', async () => {
      const track = L.TrackDrawer.track({
        routingCallback(previousMarker, marker, done) {
          throw new Error('Unexpected call');
        },
      }).addTo(map);

      const state = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];

      const expectedNewState = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
        ],
        [
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
        ],
        [
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
        ],
        [
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
        ],
        [
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];

      const markers = [];
      await track.restoreState(state, (latlng) => {
        const marker = L.TrackDrawer.node(latlng);
        markers.push(marker);
        return marker;
      });

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));

      markers.forEach((m) => {
        track.promoteNodeToStopover(m);
      });
      expect(eventsTriggered).to.be.equal(5);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(6);

      expect(track._nodesContainers).to.have.lengthOf(9);
      expect(track._edgesContainers).to.have.lengthOf(9);
      expect(track._nodesContainers.get(-1)).to.equal(track._nodesContainers.get(8));
      expect(track._edgesContainers.get(-1)).to.equal(track._edgesContainers.get(8));

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });

    it('inserting a marker should alter state', async () => {
      const track = L.TrackDrawer.track({
        routingCallback(previousMarker, marker, done) {
          done(null, [previousMarker.getLatLng(), marker.getLatLng()]);
        },
      }).addTo(map);

      const state = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];

      const expectedNewState = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.96274246792451, 6.073146737835567],
            edge: [44.974635142416496, 6.064453125000001, 44.96274246792451, 6.073146737835567],
          },
          {
            start: [44.96274246792451, 6.073146737835567],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.96274246792451, 6.073146737835567, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];

      const markers = [];
      await track.restoreState(state, (latlng) => {
        const marker = L.TrackDrawer.node(latlng);
        markers.push(marker);
        return marker;
      });

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));

      const marker = L.TrackDrawer.node(L.latLng(44.96274246792451, 6.073146737835567));
      const route = track
        .getStepsContainer()
        .get(0)
        .getLayers()[0];
      await track.insertNode(marker, route);

      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(2);

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });

    it('failure to insert a marker should fail gracefully', async () => {
      const track = L.TrackDrawer.track({
        routingCallback(previousMarker, marker, done) {
          done(null, [previousMarker.getLatLng(), marker.getLatLng()]);
        },
      }).addTo(map);

      const state = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];

      const expectedNewState = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.96274246792451, 6.073146737835567],
            edge: [44.974635142416496, 6.064453125000001, 44.96274246792451, 6.073146737835567],
          },
          {
            start: [44.96274246792451, 6.073146737835567],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.96274246792451, 6.073146737835567, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];

      const markers = [];
      await track.restoreState(state, (latlng) => {
        const marker = L.TrackDrawer.node(latlng);
        markers.push(marker);
        return marker;
      });

      let eventsTriggered = 0;
      let eventsFailureTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      track.on('TrackDrawer:failed', () => (eventsFailureTriggered += 1));

      const routingCallback = function (previousMarker, marker, done) {
        done(new Error('error'), null);
      };

      const marker = L.TrackDrawer.node(L.latLng(44.96274246792451, 6.073146737835567));
      const route = track
        .getStepsContainer()
        .get(0)
        .getLayers()[0];
      await track.insertNode(marker, route, routingCallback);

      expect(eventsTriggered).to.be.equal(0);
      expect(eventsFailureTriggered).to.be.equal(1);

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });

    it('moving markers should alter state', async () => {
      const track = L.TrackDrawer.track({
        routingCallback(previousMarker, marker, done) {
          done(null, [previousMarker.getLatLng(), marker.getLatLng()]);
        },
      }).addTo(map);

      const state = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];

      const expectedNewState = [
        [
          {
            start: [45.974635142416496, 5.064453125000001],
            end: [45.95301534523602, 5.098098754882813],
            edge: [45.974635142416496, 5.064453125000001, 45.95301534523602, 5.098098754882813],
          },
        ],
        [
          {
            start: [45.95301534523602, 5.098098754882813],
            end: [45.982406561242584, 5.120929718017578],
            edge: [45.95301534523602, 5.098098754882813, 45.982406561242584, 5.120929718017578],
          },
          {
            start: [45.982406561242584, 5.120929718017578],
            end: [45.98859865651695, 5.075782775878906],
            edge: [45.982406561242584, 5.120929718017578, 45.98859865651695, 5.075782775878906],
          },
          {
            start: [45.98859865651695, 5.075782775878906],
            end: [45.98119234648246, 5.040935516357423],
            edge: [45.98859865651695, 5.075782775878906, 45.98119234648246, 5.040935516357423],
          },
        ],
        [
          {
            start: [45.98119234648246, 5.040935516357423],
            end: [45.962976039238825, 5.023254394531251],
            edge: [45.98119234648246, 5.040935516357423, 45.962976039238825, 5.023254394531251],
          },
        ],
        [
          {
            start: [45.962976039238825, 5.023254394531251],
            end: [45.94924926661153, 5.041107177734376],
            edge: [45.962976039238825, 5.023254394531251, 45.94924926661153, 5.041107177734376],
          },
          {
            start: [45.94924926661153, 5.041107177734376],
            end: [45.943660436460185, 5.06548309326172],
            edge: [45.94924926661153, 5.041107177734376, 45.943660436460185, 5.06548309326172],
          },
          {
            start: [45.943660436460185, 5.06548309326172],
            end: [45.9439034403902, 5.1049652099609375],
            edge: [45.943660436460185, 5.06548309326172, 45.9439034403902, 5.1049652099609375],
          },
        ],
      ];

      const markers = [];
      await track.restoreState(state, (latlng) => {
        const marker = L.TrackDrawer.node(latlng);
        markers.push(marker);
        return marker;
      });

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));

      for (let i = 0; i < markers.length; i += 1) {
        const latlng = markers[i].getLatLng();
        markers[i].setLatLng(L.latLng(latlng.lat + 1, latlng.lng - 1));
        await track.onMoveNode(markers[i]);
      }
      expect(eventsTriggered).to.be.equal(9);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(10);

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });

    it('moving lonely marker should trigger event', async () => {
      const track = L.TrackDrawer.track().addTo(map);

      const latlng = L.latLng(44.974635142416496, 6.064453125000001);
      const marker = L.TrackDrawer.node(latlng);
      marker.addTo(track);

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      marker.setLatLng(L.latLng(latlng.lat + 1, latlng.lng - 1));
      await track.onMoveNode(marker);
      expect(eventsTriggered).to.be.equal(1);
    });

    it('failure to move a marker should fail gracefully', async () => {
      const track = L.TrackDrawer.track({
        routingCallback(previousMarker, marker, done) {
          done(null, [previousMarker.getLatLng(), marker.getLatLng()]);
        },
      }).addTo(map);

      const state = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];

      const expectedNewState = [
        [
          {
            start: [45.974635142416496, 5.064453125000001],
            end: [45.95301534523602, 5.098098754882813],
            edge: [45.974635142416496, 5.064453125000001, 45.95301534523602, 5.098098754882813],
          },
        ],
        [
          {
            start: [45.95301534523602, 5.098098754882813],
            end: [45.982406561242584, 5.120929718017578],
            edge: [45.95301534523602, 5.098098754882813, 45.982406561242584, 5.120929718017578],
          },
          {
            start: [45.982406561242584, 5.120929718017578],
            end: [45.98859865651695, 5.075782775878906],
            edge: [45.982406561242584, 5.120929718017578, 45.98859865651695, 5.075782775878906],
          },
          {
            start: [45.98859865651695, 5.075782775878906],
            end: [45.98119234648246, 5.040935516357423],
            edge: [45.98859865651695, 5.075782775878906, 45.98119234648246, 5.040935516357423],
          },
        ],
        [
          {
            start: [45.98119234648246, 5.040935516357423],
            end: [45.962976039238825, 5.023254394531251],
            edge: [45.98119234648246, 5.040935516357423, 45.962976039238825, 5.023254394531251],
          },
        ],
        [
          {
            start: [45.962976039238825, 5.023254394531251],
            end: [45.94924926661153, 5.041107177734376],
            edge: [45.962976039238825, 5.023254394531251, 45.94924926661153, 5.041107177734376],
          },
          {
            start: [45.94924926661153, 5.041107177734376],
            end: [45.943660436460185, 5.06548309326172],
            edge: [45.94924926661153, 5.041107177734376, 45.943660436460185, 5.06548309326172],
          },
          {
            start: [45.943660436460185, 5.06548309326172],
            end: [45.9439034403902, 5.1049652099609375],
            edge: [45.943660436460185, 5.06548309326172, 45.9439034403902, 5.1049652099609375],
          },
        ],
      ];

      const markers = [];
      await track.restoreState(state, (latlng) => {
        const marker = L.TrackDrawer.node(latlng);
        markers.push(marker);
        return marker;
      });

      let eventsTriggered = 0;
      let eventsFailureTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      track.on('TrackDrawer:failed', () => (eventsFailureTriggered += 1));

      const routingCallback = function (previousMarker, marker, done) {
        done(new Error('error'), null);
      };

      for (let i = 0; i < markers.length; i += 1) {
        const latlng = markers[i].getLatLng();
        markers[i].setLatLng(L.latLng(latlng.lat + 1, latlng.lng - 1));
        await track.onMoveNode(markers[i], routingCallback);
      }
      expect(eventsTriggered).to.be.equal(0);
      expect(eventsFailureTriggered).to.be.equal(9);

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });

    it('deleting markers should alter state', async () => {
      const track = L.TrackDrawer.track({
        routingCallback(previousMarker, marker, done) {
          done(null, [previousMarker.getLatLng(), marker.getLatLng()]);
        },
      }).addTo(map);

      const state = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];

      const markers = [];
      await track.restoreState(state, (latlng) => {
        const marker = L.TrackDrawer.node(latlng);
        markers.push(marker);
        return marker;
      });

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));

      await track.removeNode(markers.splice(4, 1)[0]);
      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(2);
      await track.removeNode(markers.splice(5, 1)[0]);
      expect(eventsTriggered).to.be.equal(2);
      expect(track._currentStateIndex).to.be.equal(3);
      await track.removeNode(markers.splice(-1, 1)[0]);
      expect(eventsTriggered).to.be.equal(3);
      expect(track._currentStateIndex).to.be.equal(4);
      await track.removeNode(markers.splice(0, 1)[0]);
      expect(eventsTriggered).to.be.equal(4);
      expect(track._currentStateIndex).to.be.equal(5);

      for (let i = 0; i < markers.length; i += 1) {
        await track.removeNode(markers[i]);
        expect(eventsTriggered).to.be.equal(5 + i);
        expect(track._currentStateIndex).to.be.equal(6 + i);
      }

      expect(track._nodesContainers).to.have.lengthOf(1);
      expect(track._edgesContainers).to.have.lengthOf(1);
      expect(track._nodesContainers.get(-1)).to.equal(track._nodesContainers.get(0));
      expect(track._edgesContainers.get(-1)).to.equal(track._edgesContainers.get(0));

      const newState = track.getState();
      expect(newState).to.be.an('array');
      expect(newState).to.be.empty;
    });

    it('failure to delete marker should fail gracefully', async () => {
      const track = L.TrackDrawer.track({
        routingCallback(previousMarker, marker, done) {
          done(null, [previousMarker.getLatLng(), marker.getLatLng()]);
        },
      }).addTo(map);

      const state = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];

      const markers = [];
      await track.restoreState(state, (latlng) => {
        const marker = L.TrackDrawer.node(latlng);
        markers.push(marker);
        return marker;
      });

      let eventsTriggered = 0;
      let eventsFailureTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      track.on('TrackDrawer:failed', () => (eventsFailureTriggered += 1));

      const routingCallback = function (previousMarker, marker, done) {
        done(new Error('error'), null);
      };

      await track.removeNode(markers.splice(4, 1)[0], routingCallback);
      expect(eventsFailureTriggered).to.be.equal(1);
      expect(eventsTriggered).to.be.equal(0);
      await track.removeNode(markers.splice(5, 1)[0], routingCallback);
      expect(eventsFailureTriggered).to.be.equal(2);
      await track.removeNode(markers.splice(-1, 1)[0], routingCallback);
      expect(eventsTriggered).to.be.equal(1);
      expect(eventsFailureTriggered).to.be.equal(2);
      await track.removeNode(markers.splice(0, 1)[0], routingCallback);
      expect(eventsTriggered).to.be.equal(2);
      expect(eventsFailureTriggered).to.be.equal(2);

      for (let i = 0; i < markers.length; i += 1) {
        await track.removeNode(markers[i], routingCallback);
      }
      expect(eventsTriggered).to.be.equal(7);
      expect(eventsFailureTriggered).to.be.equal(2);

      expect(track._nodesContainers).to.have.lengthOf(1);
      expect(track._edgesContainers).to.have.lengthOf(1);
      expect(track._nodesContainers.get(-1)).to.equal(track._nodesContainers.get(0));
      expect(track._edgesContainers.get(-1)).to.equal(track._edgesContainers.get(0));

      const newState = track.getState();
      expect(newState).to.be.an('array');
      expect(newState).to.be.empty;
    });
  });

  describe('Concurrently modifying state', () => {
    it('adding marker', async () => {
      const track = L.TrackDrawer.track({
        routingCallback: (previousMarker, currentMarker, done) => {
          setTimeout(() => {
            done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
          }, Math.random() * 200);
        },
      }).addTo(map);
      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      const marker1 = L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001));
      const marker2 = L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297));
      const marker3 = L.TrackDrawer.node(L.latLng(44.98859865651695, 6.075782775878906));

      const promise1 = track.addNode(marker1);
      const promise2 = track.addNode(marker2);
      const promise3 = track.addNode(marker3);

      await Promise.all([promise1, promise2, promise3]);
      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(1);

      const expectedNewState = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.96777356135154, 6.06822967529297],
            edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
          },
          {
            start: [44.96777356135154, 6.06822967529297],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.96777356135154, 6.06822967529297, 44.98859865651695, 6.075782775878906],
          },
        ],
      ];

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });

    it('moving marker', async () => {
      const track = L.TrackDrawer.track({
        routingCallback: (previousMarker, currentMarker, done) => {
          setTimeout(() => {
            done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
          }, Math.random() * 200);
        },
      }).addTo(map);
      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      const marker1 = L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001));
      const marker2 = L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297));

      const promise1 = track.addNode(marker1);
      const promise2 = track.addNode(marker2);
      marker2.setLatLng(L.latLng(44.98859865651695, 6.075782775878906));
      const promise3 = track.onMoveNode(marker2);

      await Promise.all([promise1, promise2, promise3]);
      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(1);

      const expectedNewState = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.974635142416496, 6.064453125000001, 44.98859865651695, 6.075782775878906],
          },
        ],
      ];

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });

    it('deleting marker', async () => {
      const track = L.TrackDrawer.track({
        routingCallback: (previousMarker, currentMarker, done) => {
          setTimeout(() => {
            done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
          }, Math.random() * 200);
        },
      }).addTo(map);
      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      const marker1 = L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001));
      const marker2 = L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297));
      const marker3 = L.TrackDrawer.node(L.latLng(44.98859865651695, 6.075782775878906));

      const promise1 = track.addNode(marker1);
      const promise2 = track.addNode(marker2);
      const promise3 = track.addNode(marker3);
      const promise4 = track.removeNode(marker2);

      await Promise.all([promise1, promise2, promise3, promise4]);
      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(1);

      const expectedNewState = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.974635142416496, 6.064453125000001, 44.98859865651695, 6.075782775878906],
          },
        ],
      ];

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });

    it('promoting marker', async () => {
      const track = L.TrackDrawer.track({
        routingCallback: (previousMarker, currentMarker, done) => {
          setTimeout(() => {
            done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
          }, Math.random() * 200);
        },
      }).addTo(map);
      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      const marker1 = L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001));
      const marker2 = L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297));
      const marker3 = L.TrackDrawer.node(L.latLng(44.98859865651695, 6.075782775878906));

      const promise1 = track.addNode(marker1);
      const promise2 = track.addNode(marker2);
      const promise3 = track.addNode(marker3);
      track.promoteNodeToStopover(marker2);

      await Promise.all([promise1, promise2, promise3]);
      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(1);

      const expectedNewState = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.96777356135154, 6.06822967529297],
            edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
          },
        ],
        [
          {
            start: [44.96777356135154, 6.06822967529297],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.96777356135154, 6.06822967529297, 44.98859865651695, 6.075782775878906],
          },
        ],
      ];

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });

    it('demoting marker', async () => {
      const track = L.TrackDrawer.track({
        routingCallback: (previousMarker, currentMarker, done) => {
          setTimeout(() => {
            done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
          }, Math.random() * 200);
        },
      }).addTo(map);
      let eventsTriggered = 0;
      const marker1 = L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001));
      const marker2 = L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297));
      const marker3 = L.TrackDrawer.node(L.latLng(44.98859865651695, 6.075782775878906));

      await track.addNode(marker1);
      await track.addNode(marker2);
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      track.promoteNodeToStopover(marker2);
      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(3);

      const promise = track.addNode(marker3);
      track.demoteNodeToWaypoint(marker2);

      await promise;
      expect(eventsTriggered).to.be.equal(2);
      expect(track._currentStateIndex).to.be.equal(4);

      const expectedNewState = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.96777356135154, 6.06822967529297],
            edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
          },
          {
            start: [44.96777356135154, 6.06822967529297],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.96777356135154, 6.06822967529297, 44.98859865651695, 6.075782775878906],
          },
        ],
      ];

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });

    it('restoring state', async () => {
      const track = L.TrackDrawer.track({
        routingCallback: (previousMarker, currentMarker, done) => {
          setTimeout(() => {
            done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
          }, Math.random() * 200);
        },
      }).addTo(map);
      
      const state = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.96777356135154, 6.06822967529297],
            edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
          },
          {
            start: [44.96777356135154, 6.06822967529297],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.96777356135154, 6.06822967529297, 44.98859865651695, 6.075782775878906],
          },
        ],
      ];

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));

      const promise1 = track.addNode(L.TrackDrawer.node(L.latLng(44.977, 6.0667)));
      const promise2 = track.addNode(L.TrackDrawer.node(L.latLng(44.978, 6.0668)));
      const promise3 = track.restoreState(state);

      await Promise.all([promise1, promise2, promise3]);
      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(1);

      const expectedNewState = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.96777356135154, 6.06822967529297],
            edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
          },
          {
            start: [44.96777356135154, 6.06822967529297],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.96777356135154, 6.06822967529297, 44.98859865651695, 6.075782775878906],
          },
        ],
      ];

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });

    
  });

  describe('Bounds', () => {
    it('getBounds() should contain all nodes and edges', async () => {
      // TODO: really test edges
      const track = L.TrackDrawer.track({
        routingCallback(previousMarker, marker, done) {
          throw new Error('Unexpected call');
        },
      }).addTo(map);

      const state = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];

      await track.restoreState(state, latlng => L.TrackDrawer.node(latlng));

      const bounds = track.getBounds();
      state.forEach((i) => {
        i.forEach((step) => {
          const start = L.latLng(step.start);
          const end = L.latLng(step.end);
          expect(bounds.contains(start)).to.be.true;
          expect(bounds.contains(end)).to.be.true;
        });
      });
    });

    // TODO: test getBounds() with empty track
    // TODO: test getBounds() with 1 marker
  });

  describe('Exporting track', () => {
    it('getLatLngs() should return an array of LatLngs for each step', async () => {
      const track = L.TrackDrawer.track({
        routingCallback(previousMarker, marker, done) {
          throw new Error('Unexpected call');
        },
      }).addTo(map);

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));

      const state = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];
      const expectedLatLngs = [
        [{ lat: 44.974635142416496, lng: 6.064453125000001 }, { lat: 44.95301534523602, lng: 6.098098754882813 }],
        [
          { lat: 44.95301534523602, lng: 6.098098754882813 },
          { lat: 44.982406561242584, lng: 6.120929718017578 },
          { lat: 44.982406561242584, lng: 6.120929718017578 },
          { lat: 44.98859865651695, lng: 6.075782775878906 },
          { lat: 44.98859865651695, lng: 6.075782775878906 },
          { lat: 44.98119234648246, lng: 6.040935516357423 },
        ],
        [{ lat: 44.98119234648246, lng: 6.040935516357423 }, { lat: 44.962976039238825, lng: 6.023254394531251 }],
        [
          { lat: 44.962976039238825, lng: 6.023254394531251 },
          { lat: 44.94924926661153, lng: 6.041107177734376 },
          { lat: 44.94924926661153, lng: 6.041107177734376 },
          { lat: 44.943660436460185, lng: 6.06548309326172 },
          { lat: 44.943660436460185, lng: 6.06548309326172 },
          { lat: 44.9439034403902, lng: 6.1049652099609375 },
        ],
      ];

      await track.restoreState(state, latlng => L.TrackDrawer.node(latlng));
      expect(eventsTriggered).to.be.equal(1);

      const latlngs = track.getLatLngs();
      expect(latlngs).to.deep.equal(expectedLatLngs);
    });

    it('toGeoJSON() should return a structure with a Feature/LineString for each step', async () => {
      const track = L.TrackDrawer.track({
        routingCallback(previousMarker, marker, done) {
          throw new Error('Unexpected call');
        },
      }).addTo(map);

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));

      const state = [
        [
          {
            start: [44.974635142416496, 6.064453125000001],
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
          },
        ],
        [
          {
            start: [44.95301534523602, 6.098098754882813],
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
          },
          {
            start: [44.982406561242584, 6.120929718017578],
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
          },
          {
            start: [44.98859865651695, 6.075782775878906],
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
          },
        ],
        [
          {
            start: [44.98119234648246, 6.040935516357423],
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
          },
        ],
        [
          {
            start: [44.962976039238825, 6.023254394531251],
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
          },
          {
            start: [44.94924926661153, 6.041107177734376],
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
          },
          {
            start: [44.943660436460185, 6.06548309326172],
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
          },
        ],
      ];
      const expectedGeoJson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [6.064453, 44.974635],
            },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [6.098099, 44.953015],
            },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [6.12093, 44.982407],
            },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [6.075783, 44.988599],
            },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [6.040936, 44.981192],
            },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [6.023254, 44.962976],
            },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [6.041107, 44.949249],
            },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [6.065483, 44.94366],
            },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [6.104965, 44.943903],
            },
          },
          {
            type: 'Feature',
            properties: {
              index: 0,
            },
            geometry: {
              type: 'LineString',
              coordinates: [[6.064453125000001, 44.974635142416496], [6.098098754882813, 44.95301534523602]],
            },
          },
          {
            type: 'Feature',
            properties: {
              index: 1,
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [6.098098754882813, 44.95301534523602],
                [6.120929718017578, 44.982406561242584],
                [6.120929718017578, 44.982406561242584],
                [6.075782775878906, 44.98859865651695],
                [6.075782775878906, 44.98859865651695],
                [6.040935516357423, 44.98119234648246],
              ],
            },
          },
          {
            type: 'Feature',
            properties: {
              index: 2,
            },
            geometry: {
              type: 'LineString',
              coordinates: [[6.040935516357423, 44.98119234648246], [6.023254394531251, 44.962976039238825]],
            },
          },
          {
            type: 'Feature',
            properties: {
              index: 3,
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [6.023254394531251, 44.962976039238825],
                [6.041107177734376, 44.94924926661153],
                [6.041107177734376, 44.94924926661153],
                [6.06548309326172, 44.943660436460185],
                [6.06548309326172, 44.943660436460185],
                [6.1049652099609375, 44.9439034403902],
              ],
            },
          },
        ],
      };

      await track.restoreState(state, latlng => L.TrackDrawer.node(latlng));
      expect(eventsTriggered).to.be.equal(1);

      const geojson = track.toGeoJSON();
      expect(geojson).to.deep.equal(expectedGeoJson);
    });
  });

  describe('Undoing/Redoing', () => {
    it('undoing and redoing adding first marker', async () => {
      const track = L.TrackDrawer.track({
        routingCallback: (previousMarker, currentMarker, done) => {
          done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
        },
      }).addTo(map);

      await track.addNode(L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001)));

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      await track.undo();

      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.false;
      expect(track.isRedoable()).to.be.true;
      expect(track._currentStateIndex).to.be.equal(0);
      expect(track.getState()).to.deep.equal([]);

      await track.redo();

      expect(eventsTriggered).to.be.equal(2);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(1);
      expect(track.getState()).to.deep.equal([]);
    });

    it('undoing and adding two marker', async () => {
      const track = L.TrackDrawer.track({
        routingCallback: (previousMarker, currentMarker, done) => {
            done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
        },
      }).addTo(map);

      await track.addNode(L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001)));
      await track.addNode(L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297)));

      const state = track.getState();
      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      await track.undo();

      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.true;
      expect(track._currentStateIndex).to.be.equal(1);
      expect(track.getState()).to.deep.equal([]);
      
      await track.undo();

      expect(eventsTriggered).to.be.equal(2);
      expect(track.isUndoable()).to.be.false;
      expect(track.isRedoable()).to.be.true;
      expect(track._currentStateIndex).to.be.equal(0);
      expect(track.getState()).to.deep.equal([]);
      
      await track.redo();

      expect(eventsTriggered).to.be.equal(3);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.true;
      expect(track._currentStateIndex).to.be.equal(1);
      expect(track.getState()).to.deep.equal([]);

      await track.redo();

      expect(eventsTriggered).to.be.equal(4);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(2);
      expect(track.getState()).to.deep.equal(state);
    });

    it('undoing while computation is going on should do nothing', async () => {
      const track = L.TrackDrawer.track({
        routingCallback: (previousMarker, currentMarker, done) => {
          setTimeout(() => {
            done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
          }, 1000);
        },
      }).addTo(map);

      await track.addNode(L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001)));

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      const promise1 = track.addNode(L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297)));
      const promise2 = track.undo();
      await Promise.all([promise1, promise2]);

      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(2);
    });

    it('undoing and adding new marker should remove redo stack', async () => {
      const track = L.TrackDrawer.track({
        routingCallback: (previousMarker, currentMarker, done) => {
            done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
        },
      }).addTo(map);

      await track.addNode(L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001)));
      await track.addNode(L.TrackDrawer.node(L.latLng(44.96777356135154, 6.06822967529297)));

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      await track.undo();

      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.true;
      expect(track._currentStateIndex).to.be.equal(1);
      expect(track.getState()).to.deep.equal([]);

      await track.addNode(L.TrackDrawer.node(L.latLng(44.98859865651695, 6.075782775878906)));

      expect(eventsTriggered).to.be.equal(2);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(2);
    });

    it('undoing with nothing to undo should fail gracefully', async () => {
      const track = L.TrackDrawer.track({
        routingCallback: (previousMarker, currentMarker, done) => {
            done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
        },
      }).addTo(map);

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      await track.undo();

      expect(eventsTriggered).to.be.equal(0);
      expect(track.isUndoable()).to.be.false;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(0);
      expect(track.getState()).to.deep.equal([]);
    });

    it('redoing with nothing to redo should fail gracefully', async () => {
      const track = L.TrackDrawer.track({
        routingCallback: (previousMarker, currentMarker, done) => {
            done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
        },
      }).addTo(map);

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));
      await track.redo();

      expect(eventsTriggered).to.be.equal(0);
      expect(track.isUndoable()).to.be.false;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(0);
      expect(track.getState()).to.deep.equal([]);
    });

    it('adding more actions than undoDepth option should remove first items from stack', async () => {
      const track = L.TrackDrawer.track({
        undoDepth: 2,
        routingCallback: (previousMarker, currentMarker, done) => {
          done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
        },
      }).addTo(map);

      await track.addNode(L.TrackDrawer.node(L.latLng(44.97463, 6.064453)));
      expect(track._currentStateIndex).to.be.equal(1);
      await track.addNode(L.TrackDrawer.node(L.latLng(44.97464, 6.064454)));
      expect(track._currentStateIndex).to.be.equal(2);
      await track.addNode(L.TrackDrawer.node(L.latLng(44.97465, 6.064455)));
      expect(track._currentStateIndex).to.be.equal(2);
      await track.addNode(L.TrackDrawer.node(L.latLng(44.97466, 6.064456)));
      expect(track._currentStateIndex).to.be.equal(2);

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));

      await track.undo();
      expect(eventsTriggered).to.be.equal(1);
      expect(track._currentStateIndex).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;

      await track.undo();
      expect(eventsTriggered).to.be.equal(2);
      expect(track._currentStateIndex).to.be.equal(0);
      expect(track.isUndoable()).to.be.false;

      await track.undo();
      expect(eventsTriggered).to.be.equal(2);
      expect(track._currentStateIndex).to.be.equal(0);
      expect(track.isUndoable()).to.be.false;
    });
    
    it('undoing and redoing when undoable option is false should fail gracefully', async () => {
      const track = L.TrackDrawer.track({
        undoable: false,
        routingCallback: (previousMarker, currentMarker, done) => {
          done(null, [previousMarker.getLatLng(), currentMarker.getLatLng()]);
        },
      }).addTo(map);

      await track.addNode(L.TrackDrawer.node(L.latLng(44.974635142416496, 6.064453125000001)));
      expect(track.isUndoable()).to.be.false;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.null;

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));

      await track.undo();
      expect(eventsTriggered).to.be.equal(0);
      expect(track.isUndoable()).to.be.false;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.null;

      await track.redo();
      expect(track.isUndoable()).to.be.false;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.null;
    });
  });
});
