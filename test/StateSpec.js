describe('State', () => {
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

  describe('Legacy state', () => {
    it('Restoring version1 should work', async () => {
      const track = L.TrackDrawer.track({
        routingCallback(previousMarker, marker, done) {
          throw new Error('Unexpected call');
        },
      }).addTo(map);

      let eventsTriggered = 0;
      track.on('TrackDrawer:done', () => (eventsTriggered += 1));

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

      await track.restoreState(state);
      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(1);

      expect(track._nodesContainers).to.have.lengthOf(4);
      expect(track._edgesContainers).to.have.lengthOf(4);
      expect(track._nodesContainers.get(-1)).to.equal(track._nodesContainers.get(3));
      expect(track._edgesContainers.get(-1)).to.equal(track._edgesContainers.get(3));
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
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
            metadata: {node: {}, edge: {}},
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

      await track.restoreState([{ version: 2, start: undefined, metadata: undefined }]);
      expect(eventsTriggered).to.be.equal(1);
      expect(track.isUndoable()).to.be.true;
      expect(track.isRedoable()).to.be.false;
      expect(track._currentStateIndex).to.be.equal(1);

      expect(track._nodesContainers).to.have.lengthOf(1);
      expect(track._edgesContainers).to.have.lengthOf(1);

      const newState = track.getState();
      expect(newState).to.deep.equal([{ version: 2, start: undefined, metadata: undefined }]);
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
      expect(newState).to.deep.equal([{ version: 2, start: undefined, metadata: undefined }]);
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
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
            metadata: {node: {}, edge: {}},
          },
        ],
      ];

      const expectedNewState = [
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
            metadata: {node: {}, edge: {}},
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
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
            metadata: {node: {}, edge: {}},
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
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
            metadata: {node: {}, edge: {}},
          },
        ],
      ];

      const expectedNewState = [
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
            metadata: {node: {}, edge: {}},
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
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
            metadata: {node: {}, edge: {}},
          },
        ],
      ];

      const expectedNewState = [
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.96274246792451, 6.073146737835567],
            edge: [44.974635142416496, 6.064453125000001, 44.96274246792451, 6.073146737835567],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.96274246792451, 6.073146737835567, 44.95301534523602, 6.098098754882813],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
            metadata: {node: {}, edge: {}},
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
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
            metadata: {node: {}, edge: {}},
          },
        ],
      ];

      const expectedNewState = [
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.96274246792451, 6.073146737835567],
            edge: [44.974635142416496, 6.064453125000001, 44.96274246792451, 6.073146737835567],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.96274246792451, 6.073146737835567, 44.95301534523602, 6.098098754882813],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
            metadata: {node: {}, edge: {}},
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
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
            metadata: {node: {}, edge: {}},
          },
        ],
      ];

      const expectedNewState = [
        { version: 2, start: [45.974635142416496, 5.064453125000001], metadata: {} },
        [
          {
            end: [45.95301534523602, 5.098098754882813],
            edge: [45.974635142416496, 5.064453125000001, 45.95301534523602, 5.098098754882813],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [45.982406561242584, 5.120929718017578],
            edge: [45.95301534523602, 5.098098754882813, 45.982406561242584, 5.120929718017578],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [45.98859865651695, 5.075782775878906],
            edge: [45.982406561242584, 5.120929718017578, 45.98859865651695, 5.075782775878906],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [45.98119234648246, 5.040935516357423],
            edge: [45.98859865651695, 5.075782775878906, 45.98119234648246, 5.040935516357423],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [45.962976039238825, 5.023254394531251],
            edge: [45.98119234648246, 5.040935516357423, 45.962976039238825, 5.023254394531251],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [45.94924926661153, 5.041107177734376],
            edge: [45.962976039238825, 5.023254394531251, 45.94924926661153, 5.041107177734376],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [45.943660436460185, 5.06548309326172],
            edge: [45.94924926661153, 5.041107177734376, 45.943660436460185, 5.06548309326172],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [45.9439034403902, 5.1049652099609375],
            edge: [45.943660436460185, 5.06548309326172, 45.9439034403902, 5.1049652099609375],
            metadata: {node: {}, edge: {}},
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
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
            metadata: {node: {}, edge: {}},
          },
        ],
      ];

      const expectedNewState = [
        { version: 2, start: [45.974635142416496, 5.064453125000001], metadata: {} },
        [
          {
            end: [45.95301534523602, 5.098098754882813],
            edge: [45.974635142416496, 5.064453125000001, 45.95301534523602, 5.098098754882813],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [45.982406561242584, 5.120929718017578],
            edge: [45.95301534523602, 5.098098754882813, 45.982406561242584, 5.120929718017578],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [45.98859865651695, 5.075782775878906],
            edge: [45.982406561242584, 5.120929718017578, 45.98859865651695, 5.075782775878906],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [45.98119234648246, 5.040935516357423],
            edge: [45.98859865651695, 5.075782775878906, 45.98119234648246, 5.040935516357423],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [45.962976039238825, 5.023254394531251],
            edge: [45.98119234648246, 5.040935516357423, 45.962976039238825, 5.023254394531251],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [45.94924926661153, 5.041107177734376],
            edge: [45.962976039238825, 5.023254394531251, 45.94924926661153, 5.041107177734376],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [45.943660436460185, 5.06548309326172],
            edge: [45.94924926661153, 5.041107177734376, 45.943660436460185, 5.06548309326172],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [45.9439034403902, 5.1049652099609375],
            edge: [45.943660436460185, 5.06548309326172, 45.9439034403902, 5.1049652099609375],
            metadata: {node: {}, edge: {}},
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
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
            metadata: {node: {}, edge: {}},
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
      expect(newState).to.deep.equal([{ version: 2, start: undefined, metadata: undefined }]);
    });

    it('failure to delete marker should fail gracefully', async () => {
      const track = L.TrackDrawer.track({
        routingCallback(previousMarker, marker, done) {
          done(null, [previousMarker.getLatLng(), marker.getLatLng()]);
        },
      }).addTo(map);

      const state = [
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.95301534523602, 6.098098754882813],
            edge: [44.974635142416496, 6.064453125000001, 44.95301534523602, 6.098098754882813],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.982406561242584, 6.120929718017578],
            edge: [44.95301534523602, 6.098098754882813, 44.982406561242584, 6.120929718017578],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.982406561242584, 6.120929718017578, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98119234648246, 6.040935516357423],
            edge: [44.98859865651695, 6.075782775878906, 44.98119234648246, 6.040935516357423],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.962976039238825, 6.023254394531251],
            edge: [44.98119234648246, 6.040935516357423, 44.962976039238825, 6.023254394531251],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.94924926661153, 6.041107177734376],
            edge: [44.962976039238825, 6.023254394531251, 44.94924926661153, 6.041107177734376],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.943660436460185, 6.06548309326172],
            edge: [44.94924926661153, 6.041107177734376, 44.943660436460185, 6.06548309326172],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.9439034403902, 6.1049652099609375],
            edge: [44.943660436460185, 6.06548309326172, 44.9439034403902, 6.1049652099609375],
            metadata: {node: {}, edge: {}},
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
      expect(newState).to.deep.equal([{ version: 2, start: undefined, metadata: undefined }]);
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
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.96777356135154, 6.06822967529297],
            edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.96777356135154, 6.06822967529297, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
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
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.974635142416496, 6.064453125000001, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
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
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.974635142416496, 6.064453125000001, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
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
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.96777356135154, 6.06822967529297],
            edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
            metadata: {node: {}, edge: {}},
          },
        ],
        [
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.96777356135154, 6.06822967529297, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
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
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.96777356135154, 6.06822967529297],
            edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.96777356135154, 6.06822967529297, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
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
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.96777356135154, 6.06822967529297],
            edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.96777356135154, 6.06822967529297, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
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
        { version: 2, start: [44.974635142416496, 6.064453125000001], metadata: {} },
        [
          {
            end: [44.96777356135154, 6.06822967529297],
            edge: [44.974635142416496, 6.064453125000001, 44.96777356135154, 6.06822967529297],
            metadata: {node: {}, edge: {}},
          },
          {
            end: [44.98859865651695, 6.075782775878906],
            edge: [44.96777356135154, 6.06822967529297, 44.98859865651695, 6.075782775878906],
            metadata: {node: {}, edge: {}},
          },
        ],
      ];

      const newState = track.getState();
      expect(newState).to.deep.equal(expectedNewState);
    });
  });
});
